-- ============================================================
-- HORIZON EDUCATIONAL CONSULTANCY - STUDENT PORTAL DATABASE SCHEMA
-- ============================================================
-- Run these queries in your Supabase SQL editor
-- ============================================================

-- Step 1: Update applications table with new columns
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS application_status text DEFAULT 'submitted',
ADD COLUMN IF NOT EXISTS acceptance_letter_url text,
ADD COLUMN IF NOT EXISTS acceptance_letter_path text,
ADD COLUMN IF NOT EXISTS submission_token text UNIQUE,
ADD COLUMN IF NOT EXISTS admin_note text,
ADD COLUMN IF NOT EXISTS rejection_message text,
ADD COLUMN IF NOT EXISTS status_updated_at timestamptz DEFAULT now();

-- Step 2: Create profiles table for role-based access
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role text DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 3: Keep sensitive tables server-only. All student and admin reads/writes
-- go through authenticated API routes that use the service role on the server.
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications FORCE ROW LEVEL SECURITY;

DO $policies$
DECLARE policy record;
BEGIN
  FOR policy IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'applications'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.applications', policy.policyname);
  END LOOP;
END;
$policies$;

REVOKE ALL ON TABLE public.applications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.applications TO service_role;

-- Step 7: Create constraint for valid statuses
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
ADD CONSTRAINT applications_status_check
CHECK (application_status IN ('submitted', 'evaluating', 'accepted', 'rejected'));

-- Step 8: Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_applications_user_id
ON applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
ON applications(application_status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at
ON applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_submission_token
ON applications(submission_token);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id bigserial PRIMARY KEY,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_email text NOT NULL,
  program text,
  university text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read
ON admin_notifications(read);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at
ON admin_notifications(created_at DESC);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notifications TO service_role;
REVOKE ALL ON SEQUENCE public.admin_notifications_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.admin_notifications_id_seq TO service_role;

CREATE TABLE IF NOT EXISTS homepage_media (
  id bigserial PRIMARY KEY,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  media_path text,
  thumbnail_url text,
  title text,
  description text,
  button_text text,
  button_link text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homepage_media_order
ON homepage_media(sort_order);

CREATE INDEX IF NOT EXISTS idx_homepage_media_published
ON homepage_media(is_published);

ALTER TABLE public.homepage_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_media FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.homepage_media FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.homepage_media TO service_role;
REVOKE ALL ON SEQUENCE public.homepage_media_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.homepage_media_id_seq TO service_role;

-- Step 9: Profiles are also server-only and the role column has a second,
-- trigger-level guard against future policy mistakes.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DO $policies$
DECLARE policy record;
BEGIN
  FOR policy IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', policy.policyname);
  END LOOP;
END;
$policies$;

REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

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

-- Step 10: Create a trusted profile row on signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'student')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Storage - Create acceptance-letters bucket (if not using public bucket)
-- In Supabase Console:
-- 1. Go to Storage
-- 2. Click "Create a new bucket"
-- 3. Name: acceptance-letters
-- 4. Make it PRIVATE (not public)
-- 5. Click Create

-- Files are read and written only through authenticated server API routes.

-- ============================================================
-- MANUAL SETUP REQUIRED:
-- ============================================================
-- 1. Go to Authentication > Users in Supabase Console
-- 2. Find your admin email
-- 3. Go to the SQL Editor and run:
--    UPDATE profiles SET role = 'admin' WHERE email = 'your.admin@email.com';
--
-- 4. Go to Storage and create 'acceptance-letters' bucket if needed
-- 5. Set it to PRIVATE
-- 6. Run scripts/lock-down-sensitive-tables.sql on existing projects and then
--    execute scripts/verify-live-release.mjs against a production build.
-- ============================================================
