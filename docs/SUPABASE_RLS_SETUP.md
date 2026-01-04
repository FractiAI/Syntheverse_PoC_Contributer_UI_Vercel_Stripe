# Supabase RLS (Row Level Security) Setup Guide

## Overview

This guide explains how to enable Row Level Security (RLS) on all public tables in Supabase to address security warnings.

## Current Status

**⚠️ Security Warnings**: The following tables are public but don't have RLS enabled:
- `public.contributions`
- `public.allocations`
- `public.epoch_balances`
- `public.epoch_metal_balances`
- `public.users_table`
- `public.poc_log`

## Solution

### Step 1: Apply RLS Migration

Run the migration file in Supabase Dashboard:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/20260103000000_enable_rls_policies.sql`
4. Click **Run** to execute

### Step 2: Verify RLS is Enabled

After running the migration, verify RLS is enabled:

```sql
-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'contributions',
    'allocations',
    'epoch_balances',
    'epoch_metal_balances',
    'users_table',
    'poc_log'
)
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

### Step 3: Enable Password Compromise Checking

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **Password** section
3. Enable **"Check passwords against HaveIBeenPwned"**
4. Click **Save**

This will check user passwords against the HaveIBeenPwned database to prevent compromised passwords.

## RLS Policies Overview

### Contributions Table
- ✅ Users can read their own contributions
- ✅ Public can read qualified contributions (archive)
- ✅ Service role has full access (for API routes)

### Allocations Table
- ✅ Users can read their own allocations
- ✅ Service role has full access

### Epoch Balances Table
- ✅ Public read access (tokenomics state is public)
- ✅ Service role can update

### Epoch Metal Balances Table
- ✅ Public read access (tokenomics state is public)
- ✅ Service role can update

### Users Table
- ✅ Users can read their own user record
- ✅ Service role has full access

### PoC Log Table
- ✅ Users can read logs for their contributions
- ✅ Public can read logs for qualified contributions
- ✅ Service role has full access

## Testing RLS Policies

After applying the migration, test that policies work correctly:

```sql
-- Test 1: Verify users can read their own contributions
-- (Run as authenticated user)
SELECT * FROM contributions WHERE contributor = auth.jwt() ->> 'email';

-- Test 2: Verify public can read qualified contributions
-- (Run as anonymous user)
SELECT * FROM contributions WHERE status = 'qualified';

-- Test 3: Verify service role has full access
-- (Run via API with service role key)
```

## Important Notes

1. **Service Role Access**: API routes use the service role key, which bypasses RLS. This is intentional for backend operations.

2. **Public Read Access**: Tokenomics state (epoch balances) and qualified contributions are publicly readable, which is correct for the protocol.

3. **User Privacy**: Users can only read their own contributions and allocations, protecting privacy.

4. **Migration Safety**: The migration uses `CREATE POLICY IF NOT EXISTS` where possible, but some policies may need to be dropped first if they already exist.

## Troubleshooting

### If Migration Fails

1. Check if policies already exist:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

2. Drop existing policies if needed:
```sql
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
```

3. Re-run the migration.

### If RLS Blocks Legitimate Access

1. Check the user's authentication status:
```sql
SELECT auth.uid(), auth.jwt();
```

2. Verify the policy conditions match your access patterns.

3. Temporarily disable RLS for debugging (NOT recommended for production):
```sql
ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
```

## Security Best Practices

✅ **DO**:
- Keep RLS enabled on all public tables
- Use service role key only in backend API routes
- Test policies after changes
- Review policies periodically

❌ **DON'T**:
- Disable RLS in production
- Use service role key in client-side code
- Create overly permissive policies
- Skip testing after policy changes

---

**Last Updated**: January 3, 2025  
**Migration File**: `supabase/migrations/20260103000000_enable_rls_policies.sql`

