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

-- Step 3: Enable RLS on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own application" ON applications;
DROP POLICY IF EXISTS "Students can insert own application" ON applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON applications;
DROP POLICY IF EXISTS "Admin can update applications" ON applications;

-- Step 5: Create RLS policies for students
CREATE POLICY "Students can view own application"
ON applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own application"
ON applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 6: Create RLS policies for admin
CREATE POLICY "Admin can view all applications"
ON applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update all applications"
ON applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

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

-- Step 9: Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role = 'admin'
  )
);

-- Step 11: Create trigger to auto-insert profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'student')
  ON CONFLICT (id) DO UPDATE SET email = new.email;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 12: Storage - Create acceptance-letters bucket (if not using public bucket)
-- In Supabase Console:
-- 1. Go to Storage
-- 2. Click "Create a new bucket"
-- 3. Name: acceptance-letters
-- 4. Make it PRIVATE (not public)
-- 5. Click Create

-- Step 13: Storage RLS policies for acceptance-letters bucket
-- In Supabase Console, go to Storage > acceptance-letters > Policies and add:
-- 
-- SELECT policy:
-- CREATE POLICY "Students can view their own letters"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'acceptance-letters' 
--   AND (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- INSERT policy:
-- CREATE POLICY "Admins can upload letters"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'acceptance-letters' 
--   AND EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE profiles.id = auth.uid() 
--     AND profiles.role = 'admin'
--   )
-- );

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
-- 6. Add the RLS policies shown above
-- ============================================================
