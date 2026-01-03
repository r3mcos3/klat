# Authentication Setup Guide

This guide will help you complete the authentication setup for Klat. The code has been fully implemented - you just need to configure Supabase and run the database migrations.

## Overview

Klat now has a complete email/password authentication system that:
- ✅ Requires login to access all notes
- ✅ Protects your data with Row Level Security (RLS)
- ✅ Provides a single-user experience (only you can access your notes)
- ✅ Automatically handles session management and token refresh

---

## Step 1: Run Database Migrations

Execute the SQL migration to add `userId` columns and enable Row Level Security.

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `apps/backend/migrations/001_add_authentication.sql`
3. Click **Run** to execute the migration

**What this does:**
- Adds `userId` column to `notes` and `tags` tables
- Creates database indexes for performance
- Enables Row Level Security (RLS) to ensure users can only see their own data
- Sets up RLS policies for all tables

---

## Step 2: Enable Email/Password Authentication

1. Open **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Email** in the list
3. Toggle it **ON** (Enable)
4. Save your changes

**Optional:** After creating your account (Step 4), you can disable new signups:
- Go to **Authentication** → **Settings**
- Toggle **OFF**: "Enable email signups"
- This ensures you remain the only user with access

---

## Step 3: Add Environment Variables

The frontend needs Supabase credentials to connect.

1. Create or update `apps/frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

**Where to find these values:**
- **VITE_SUPABASE_URL**: Supabase Dashboard → Settings → API → Project URL
- **VITE_SUPABASE_ANON_KEY**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

2. Restart the frontend dev server:

```bash
npm run frontend:dev
```

---

## Step 4: Create Your Account

1. Start the app: `npm run dev`
2. Navigate to **http://localhost:5173**
3. You'll be redirected to **/login**
4. Click **"Don't have an account? Sign up"**
5. Enter your email and password (minimum 6 characters)
6. Click **"Create account"**

**Important:** Save your email and password securely - this is your only account!

---

## Step 5: Migrate Existing Notes

Assign all your existing notes and tags to your newly created account.

1. Get your **User ID** from Supabase:
   - Go to **Supabase Dashboard** → **Authentication** → **Users**
   - Copy the **UID** (UUID) from your user row

2. Run the migration script from the backend directory:

```bash
cd apps/backend
npx ts-node src/scripts/migrate-notes-to-user.ts YOUR-USER-ID-HERE
```

**Example:**
```bash
npx ts-node src/scripts/migrate-notes-to-user.ts abc123-def456-ghi789
```

**What this does:**
- Assigns all existing notes to your user account
- Assigns all existing tags to your user account
- Verifies that no orphaned data remains

---

## Step 6: Test Authentication

1. **Login Test:**
   - Go to http://localhost:5173/login
   - Enter your credentials
   - Verify you're redirected to the main page with all your notes

2. **Protected Routes Test:**
   - Try accessing http://localhost:5173/search while logged out
   - You should be redirected to /login automatically

3. **Logout Test:**
   - Click the **Logout** button in the top-right corner (next to theme toggle)
   - Verify you're redirected to /login
   - Try accessing protected routes - should redirect to /login

4. **Session Persistence Test:**
   - Login to your account
   - Refresh the page
   - You should remain logged in (session persists)

5. **API Authentication Test:**
   - Open browser DevTools → Network tab
   - Perform any action (create note, search, etc.)
   - Check the API requests - they should have `Authorization: Bearer <token>` header
   - Backend should respond with 200 OK (not 401 Unauthorized)

---

## Architecture Overview

### Backend Changes

**New Files:**
- `apps/backend/src/middleware/auth.ts` - JWT verification middleware
- `apps/backend/src/routes/auth.ts` - Auth endpoints
- `apps/backend/src/controllers/authController.ts` - Auth handlers
- `apps/backend/src/services/authService.ts` - Supabase Auth integration
- `apps/backend/migrations/001_add_authentication.sql` - Database migration
- `apps/backend/src/scripts/migrate-notes-to-user.ts` - Migration script

**Modified Files:**
- All route files now use `authenticate` middleware
- All service files filter data by `userId`
- All controllers extract `userId` from `req.userId`

**New API Endpoints:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Frontend Changes

**New Files:**
- `apps/frontend/src/config/supabase.ts` - Supabase client
- `apps/frontend/src/store/authStore.ts` - Auth state management (Zustand)
- `apps/frontend/src/components/Auth/AuthProvider.tsx` - Auth initialization
- `apps/frontend/src/components/Auth/ProtectedRoute.tsx` - Route guard
- `apps/frontend/src/pages/LoginView.tsx` - Login/register page

**Modified Files:**
- `apps/frontend/src/services/api.ts` - JWT interceptor for API requests
- `apps/frontend/src/App.tsx` - Auth routes and protected route wrapper
- `apps/frontend/src/pages/CardStackView.tsx` - Logout button

**New Routes:**
- `/login` - Public (login/register page)
- All other routes - Protected (require authentication)

### Database Changes

**Schema Updates:**
- `notes` table: Added `userId` column (UUID, references auth.users)
- `tags` table: Added `userId` column (UUID, references auth.users)
- Indexes: `idx_notes_userId`, `idx_tags_userId`, `idx_notes_date_userId`

**Row Level Security (RLS):**
- Users can only SELECT/INSERT/UPDATE/DELETE their own notes and tags
- RLS policies enforce this at the database level (defense in depth)
- Even if backend auth fails, database prevents unauthorized access

---

## Security Features

### Defense in Depth

1. **Frontend Protection:**
   - ProtectedRoute redirects unauthenticated users to /login
   - AuthProvider initializes and manages auth state

2. **Backend Protection:**
   - Auth middleware verifies JWT on every API request
   - Services filter all queries by userId

3. **Database Protection:**
   - Row Level Security (RLS) enforces data isolation
   - Even direct database queries respect RLS policies

### Session Management

- **Automatic token refresh:** Supabase handles this transparently
- **Persistent sessions:** Login persists across page refreshes
- **Automatic logout on 401:** API interceptor handles expired tokens

---

## Troubleshooting

### "Missing Supabase environment variables" Error

**Solution:** Make sure `apps/frontend/.env` contains:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then restart the frontend dev server.

---

### Can't login - "Invalid credentials" Error

**Possible causes:**
1. Email/password auth not enabled in Supabase Dashboard
2. Wrong email/password
3. Account not created yet

**Solution:** Double-check auth is enabled (Step 2) and your credentials are correct.

---

### API returns 401 Unauthorized

**Possible causes:**
1. Not logged in
2. Session expired
3. Auth middleware not working
4. Token not being sent

**Solution:**
- Check browser DevTools → Application → Local Storage → `auth-storage`
- Should contain `session` and `user` data
- Check Network tab → API requests should have `Authorization: Bearer <token>` header

---

### Migration script fails

**Possible causes:**
1. Wrong user ID
2. Notes/tags already have userId assigned
3. Supabase connection issues

**Solution:**
- Verify user ID from Supabase Dashboard
- Check `apps/backend/.env` has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure migration SQL (Step 1) was executed successfully

---

### RLS blocks my queries

**Symptoms:**
- Queries return empty results
- Can't create/update/delete notes

**Possible causes:**
- RLS policies not matching auth.uid()
- userId not being set correctly

**Debug:**
```sql
-- Check if userId is set on notes
SELECT id, "userId", date, content FROM notes LIMIT 5;

-- Check current auth user
SELECT auth.uid();
```

**Quick fix (temporary):**
```sql
-- Disable RLS temporarily for debugging
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
```

**Remember to re-enable after debugging!**

---

## Optional: Disable New Registrations

After creating your account, prevent others from signing up:

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. Find **"Enable email signups"**
3. Toggle it **OFF**

This ensures you remain the only user with access to the app.

---

## Next Steps

Your authentication system is now fully set up! All your notes are protected and only accessible to you.

**Recommended:**
1. Test all features thoroughly
2. Disable new signups (optional)
3. Consider adding password reset functionality in the future
4. Set up production environment variables for deployment

---

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all steps were completed in order
3. Check browser console and network tab for errors
4. Check backend logs for auth-related errors
