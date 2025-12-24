# Supabase Pooled Connection String

## Issue
The direct connection hostname `db.jfbgdxeumzqzigptbmvp.supabase.co` no longer resolves (ENOTFOUND error).

## Solution: Use Pooled Connection

Supabase now uses **pooled connections** instead of direct connections. The hostname format is different.

### Step 1: Get Pooled Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/jfbgdxeumzqzigptbmvp/settings/database
2. Scroll to **"Connection string"** section
3. Click on **"Connection pooling"** tab (NOT "URI" tab)
4. Copy the connection string - it will look like:
   ```
   postgresql://postgres.jfbgdxeumzqzigptbmvp:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your database password: `5J4gmVYTLuWZeOBT`

### Step 2: Update DATABASE_URL in Vercel

The pooled connection string format is:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

For your project, it should be:
```
postgresql://postgres.jfbgdxeumzqzigptbmvp:5J4gmVYTLuWZeOBT@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Note:** Replace `[region]` with your actual region (e.g., `us-west-1`, `us-east-1`, etc.) - this will be shown in the Supabase dashboard.

### Key Differences:
- **Old (Direct):** `postgresql://postgres:password@db.[ref].supabase.co:5432/postgres`
- **New (Pooled):** `postgresql://postgres.[ref]:password@aws-0-[region].pooler.supabase.com:5432/postgres`

The username format changed from `postgres` to `postgres.[project-ref]`!

