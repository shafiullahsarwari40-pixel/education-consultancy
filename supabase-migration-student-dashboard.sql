-- Supabase schema migration for student application tracking

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS acceptance_letter_url text,
  ADD COLUMN IF NOT EXISTS acceptance_letter_path text,
  ADD COLUMN IF NOT EXISTS admin_note text,
  ADD COLUMN IF NOT EXISTS status_updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

UPDATE applications SET status = 'submitted' WHERE status IS NULL;
UPDATE applications SET created_at = now() WHERE created_at IS NULL;
UPDATE applications SET status_updated_at = now() WHERE status_updated_at IS NULL;

-- Create or configure a private storage bucket named "acceptance-letters" in Supabase storage.
-- Use the Supabase dashboard or CLI to create the bucket and set access policies so only authenticated users and admin server routes can access the files.
