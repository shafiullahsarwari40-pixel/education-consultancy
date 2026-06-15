# Quick Start Checklist - Horizon Student Portal

## ⚡ 5-Minute Setup Summary

### What You Need to Do RIGHT NOW:

```
1. Open Supabase Console
   ├─ Go to SQL Editor
   ├─ Create new query
   ├─ Copy entire DATABASE_SCHEMA.sql file
   ├─ Paste it
   └─ Click RUN ✓

2. Go to Storage
   ├─ Create new bucket
   ├─ Name: acceptance-letters
   ├─ Privacy: PRIVATE
   └─ Create ✓

3. Go back to SQL Editor
   ├─ Run this command:
   ├─ UPDATE profiles SET role = 'admin'
   │  WHERE email = 'your.email@example.com';
   └─ Run ✓

4. Restart your dev server
   ├─ Stop: Ctrl+C in terminal
   ├─ Restart: npm run dev
   └─ Go to https://horizoneducon.com ✓
```

---

## 📋 What Changed in Code

| File | Change | Status |
|------|--------|--------|
| `Navbar.js` | Added "See Your Application Result" link | ✅ Ready |
| `ApplicationForm.js` | Added button to result page in success modal | ✅ Ready |
| `/api/admin/applications/[id]/status/route.js` | Fixed admin auth | ✅ Ready |
| `/api/admin/applications/[id]/letter/route.js` | Added PDF upload + admin auth | ✅ Ready |
| `DATABASE_SCHEMA.sql` | NEW - Database migrations | 🔄 Execute |
| `SETUP_GUIDE.md` | NEW - Complete setup guide | 📖 Reference |
| `SESSION_SUMMARY.md` | NEW - This session's work | 📖 Reference |

---

## 🧪 Quick Test After Setup

1. **Student signup**: https://horizoneducon.com/student/auth
   - Click "Sign Up"
   - Enter email + password
   - ✓ Account created

2. **Student login**: https://horizoneducon.com/student/auth
   - Click "Sign In"
   - Enter same credentials
   - ✓ Redirects to /apply

3. **See your result**: Click navbar link "See Your Application Result"
   - Not logged in? → Goes to login page
   - Logged in? → Shows application status page
   - ✓ Smart redirect works

4. **Submit application**: https://horizoneducon.com/apply
   - Fill form
   - Click Submit
   - ✓ Success modal appears
   - Click "See Your Application Result"
   - ✓ Goes to status page

5. **Admin update**: Check admin dashboard
   - Find application
   - Change status dropdown
   - ✓ Status updates immediately

---

## 🐛 If Something Doesn't Work

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check Supabase anon key in `.env.local` |
| "Admin access required" | Make sure you ran the admin designation SQL |
| Can't upload PDF | Verify bucket is PRIVATE and policies are set |
| Status doesn't update | Verify RLS policies were created in DATABASE_SCHEMA.sql |
| Navbar link missing | Clear browser cache (Ctrl+Shift+Delete) and refresh |
| Mobile menu broken | Clear cache and restart dev server |

---

## 📞 Support Resources

- **Setup Guide**: See `SETUP_GUIDE.md` for detailed instructions
- **Session Summary**: See `SESSION_SUMMARY.md` for complete changes
- **Database Schema**: See `DATABASE_SCHEMA.sql` for SQL details

---

## 🎯 Success Criteria

After database setup, you should have:

- ✅ Student login/signup working
- ✅ Protected apply page
- ✅ Application submission with status tracking
- ✅ Admin can update status
- ✅ Navbar has "See Your Application Result" link
- ✅ Students can check their application status
- ✅ Mobile menu works properly

---

**Status**: 🟡 **Code Complete - Awaiting Database Setup**

Next action: Execute DATABASE_SCHEMA.sql in Supabase SQL Editor
