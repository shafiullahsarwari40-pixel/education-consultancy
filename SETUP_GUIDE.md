# Horizon Student Portal - Setup Guide

## Overview
This guide walks you through setting up the student portal system for Horizon Educational Consultancy. The system includes student authentication, application protection, result tracking, and admin controls.

---

## Phase 1: Database Setup (CRITICAL - Do This First)

### Step 1: Execute SQL Schema
1. Go to your Supabase project console
2. Navigate to **SQL Editor**
3. Create a new query and paste the entire contents of `DATABASE_SCHEMA.sql`
4. Click **Run** (▶)
5. Wait for all queries to complete successfully

**What this does:**
- Adds 7 new columns to the `applications` table
- Creates a `profiles` table for role management
- Sets up Row Level Security (RLS) policies
- Creates database indexes for performance
- Creates a trigger to auto-create student profiles on signup

### Step 2: Verify Applications Table
In SQL Editor, run:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;
```

You should see these new columns:
- `user_id` (uuid)
- `application_status` (text)
- `acceptance_letter_url` (text)
- `acceptance_letter_path` (text)
- `admin_note` (text)
- `rejection_message` (text)
- `status_updated_at` (timestamptz)

### Step 3: Create Storage Bucket
1. Go to **Storage** in Supabase Console
2. Click **Create a new bucket**
3. Name: `acceptance-letters`
4. Privacy: **Private** (NOT public)
5. Click **Create**

### Step 4: Set Up Storage RLS Policies
1. Go to **Storage** > **acceptance-letters** > **Policies**
2. Create a new policy for **SELECT**:
   - Policy name: `Students can view their own letters`
   - Formula: `bucket_id = 'acceptance-letters' AND (storage.foldername(name))[1] = auth.uid()::text`
   - Roles: `authenticated`
3. Create a new policy for **INSERT**:
   - Policy name: `Admins can upload letters`
   - Use the Supabase policy template for admin INSERT, modify to check profiles.role

### Step 5: Make Your First Admin
1. Go to **Authentication** > **Users** in Supabase Console
2. Find your admin email address
3. Go to **SQL Editor** and run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your.email@example.com';
```
Replace `your.email@example.com` with your actual admin email.

---

## Phase 2: Environment Configuration

### Verify Environment Variables
Your `.env.local` file should have:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-valid-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**IMPORTANT:** If you're getting "Invalid API key" errors:
1. Go to **Settings** > **API** in Supabase Console
2. Copy the **anon** key and update `.env.local`
3. Restart your dev server: `npm run dev`

---

## Phase 3: Test the System

### Test 1: Student Signup
1. Open http://localhost:3000/student/auth
2. Click "Sign Up" toggle
3. Enter email and password
4. Click "Create Account"
5. Expected: Success message, account created

### Test 2: Student Signin
1. On the same page, toggle back to "Sign In"
2. Enter your email and password
3. Click "Sign In"
4. Expected: Redirected to `/apply` page (if redirect was provided)

### Test 3: Protected Apply Page
1. Open http://localhost:3000/apply while logged out
2. Expected: Redirected to `/student/auth?redirect=/apply`
3. After login: Should see the application form

### Test 4: Application Submission
1. Fill in and submit the application form
2. Expected: Success message with "See Application Result" button
3. Click the button or go to `/student/result`
4. Expected: Should see application status (submitted)

### Test 5: Admin Status Update
This requires direct API call or admin dashboard update:
```bash
curl -X PATCH http://localhost:3000/api/admin/applications/[APPLICATION_ID]/status \
  -H "Authorization: Bearer [YOUR_SESSION_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "evaluating",
    "admin_note": "Under review"
  }'
```

---

## Phase 4: Admin Features (Recommended Setup)

### Access Admin Dashboard
1. Go to http://localhost:3000/admin/login
2. Login with your admin credentials
3. Go to **Applications**

### Update Application Status
1. Find a student application in the list
2. Click to view details
3. Change status dropdown: `submitted` → `evaluating` → `accepted` or `rejected`
4. Add optional admin notes or rejection message
5. Save changes
6. Student should see updated status immediately

### Upload Acceptance Letter (Optional)
1. From application detail page
2. Click "Upload Acceptance Letter"
3. Select a PDF file
4. Click Upload
5. System will generate a signed URL for the student to download

---

## Key Files Overview

| File | Purpose |
|------|---------|
| `components/StudentAuthClient.js` | Student login/signup page |
| `components/StudentResultClient.js` | Application status tracking page |
| `app/student/auth/page.js` | Auth page route wrapper |
| `app/student/result/page.js` | Result tracking page route |
| `app/api/student/result/route.js` | GET endpoint for application data |
| `app/api/student/check-application/route.js` | Check if student already applied |
| `app/api/admin/applications/[id]/status/route.js` | PATCH endpoint for status updates |
| `app/api/admin/applications/[id]/letter/route.js` | POST endpoint for PDF uploads |
| `lib/supabaseAdmin.js` | Server-side Supabase client |
| `lib/supabaseClient.js` | Browser-side Supabase client |
| `DATABASE_SCHEMA.sql` | SQL schema to run in Supabase |
| `SETUP_GUIDE.md` | This file |

---

## Troubleshooting

### "Invalid API key" Error
**Solution:** 
1. Check your anon key in Supabase Console > Settings > API
2. Update `.env.local` with the correct key
3. Restart dev server
4. Clear browser cache

### "Admin access required" When Admin Tries to Update
**Solution:**
1. Verify the admin's email in `profiles` table has `role = 'admin'`
2. Run: `SELECT * FROM profiles WHERE email = 'admin@email.com';`
3. If role is 'student', update it: `UPDATE profiles SET role = 'admin' WHERE email = 'admin@email.com';`

### Student Can't See Own Application
**Solution:**
1. Check RLS is enabled: `ALTER TABLE applications ENABLE ROW LEVEL SECURITY;`
2. Verify policy exists: SELECT from `postgres` schema > policies
3. Student must have valid auth session

### Can't Upload PDF
**Solution:**
1. Verify `acceptance-letters` bucket exists and is PRIVATE
2. Check bucket policies are correctly set
3. Ensure file is actual PDF (not .txt renamed)
4. File size must be < 10MB

---

## Feature Checklist

After setup, verify these features work:

- [x] Student can sign up with email/password
- [x] Student can sign in 
- [x] Unauthenticated users can't access `/apply`
- [x] Student can submit application
- [x] Duplicate applications are blocked
- [x] Student can check application status
- [x] Admin can update application status
- [x] Status updates reflected in real-time
- [x] Admin can upload acceptance letter
- [x] Student can download letter
- [x] Navbar shows "See Your Application Result" option
- [x] Mobile menu works properly

---

## Next Steps

Once the above is working:

1. **Customize Messages:** Update rejection messages and admin notes in admin interface
2. **Add Email Notifications:** Integrate SendGrid or Resend to email students on status changes
3. **Mobile App:** Consider React Native app using same Supabase backend
4. **Analytics:** Add tracking for signup/completion rates
5. **Bulk Operations:** Add admin feature to bulk email students

---

## Support & Debugging

If you encounter issues:

1. Check browser console (F12) for client-side errors
2. Check terminal output for server-side errors
3. Check Supabase logs: Console > Logs > API
4. Test with cURL before debugging in UI
5. Verify environment variables are loaded

---

**Last Updated:** [Current Date]
**Version:** 1.0
