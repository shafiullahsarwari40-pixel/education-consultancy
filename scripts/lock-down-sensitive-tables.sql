-- HORIZON RELEASE BLOCKER: sensitive application data must be server-only.
-- Run in the SQL editor for project goerjwjxpwmpimkeiokx, then execute
-- scripts/verify-live-release.mjs. The application uses the service role only
-- inside authenticated API routes; browsers do not need table access.
BEGIN;

-- Older production projects may predate the admin notification feed. Create
-- the table before applying the same server-only permissions as the other
-- sensitive application tables. These statements are safe to rerun.
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id bigserial PRIMARY KEY,
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_email text NOT NULL,
  program text,
  university text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read
ON public.admin_notifications(read);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at
ON public.admin_notifications(created_at DESC);

DO $migration$
DECLARE
  table_name text;
  policy record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'applications',
    'application_documents',
    'admin_notifications',
    'contact_messages',
    'profiles',
    'homepage_media'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role', table_name);

    FOR policy IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy.policyname, table_name);
    END LOOP;
  END LOOP;
END;
$migration$;

-- Protect the authorization field even if direct profile access is granted by
-- a future migration. Trusted service-role operations and the auth trigger may
-- assign roles; browser roles may not.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
BEGIN
  IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    IF TG_OP = 'INSERT' AND NEW.role IS DISTINCT FROM 'student' THEN
      RAISE EXCEPTION 'Profile roles can only be assigned by an administrator'
        USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Profile roles can only be changed by an administrator'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
BEFORE INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated;

-- Keep sequence access server-only for tables using serial/bigserial ids.
DO $sequences$
DECLARE
  sequence_name text;
BEGIN
  FOREACH sequence_name IN ARRAY ARRAY[
    'admin_notifications_id_seq',
    'homepage_media_id_seq'
  ]
  LOOP
    IF to_regclass(format('public.%I', sequence_name)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON SEQUENCE public.%I FROM PUBLIC, anon, authenticated', sequence_name);
      EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I TO service_role', sequence_name);
    END IF;
  END LOOP;
END;
$sequences$;

COMMIT;

-- Expected result: all rows below show anon/authenticated read = false,
-- RLS = true, forced RLS = true, and zero policies.
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_read,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_can_read,
  COUNT(p.policyname) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relname = ANY (ARRAY[
    'applications',
    'application_documents',
    'admin_notifications',
    'contact_messages',
    'profiles',
    'homepage_media'
  ])
GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity, c.oid
ORDER BY c.relname;
