# Supabase Security Setup

## Enable Leaked Password Protection

**Status:** ⚠️ Currently disabled (Security Warning)

**What it does:**
Prevents users from using passwords that have been compromised in data breaches by checking against HaveIBeenPwned.org database.

**How to enable:**

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/hylxmpekinecztqnqkij
2. Navigate to **Authentication** → **Policies**
3. Find **Password Settings** section
4. Enable **"Check passwords against breach database (HaveIBeenPwned)"**
5. Click **Save**

**More info:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## Performance & Security Issues Fixed (2026-01-20)

✅ **Performance Issues Fixed:**
- Optimized all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
  - Prevents re-evaluation for each row (11 policies fixed)
- Removed 4 unused indexes:
  - `notes_in_progress_idx`
  - `idx_notes_userid_date`
  - `idx_notes_deadline`
  - `idx_notes_completedat`

✅ **Security Issues Fixed:**
- Fixed `update_updated_at_column` function with immutable search_path
  - Added `SET search_path = public` to prevent search path injection attacks

**Migration:** `20260120230000_fix_performance_and_security.sql`
