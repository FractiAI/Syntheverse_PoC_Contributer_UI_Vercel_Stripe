# Database Connection Fix

## Issue

Error: `getaddrinfo ENOTFOUND db.jfbgdxeumzqzigptbmvp.supabase.co`

This means the DATABASE_URL environment variable in Vercel is either:

1. Not set
2. Set incorrectly
3. Using wrong hostname format

## Solution

### Step 1: Get Database Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/jfbgdxeumzqzigptbmvp
2. Navigate to: **Settings** → **Database**
3. Scroll down to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]` with your actual database password**

### Step 2: Set DATABASE_URL in Vercel

1. Go to: https://vercel.com/fractiais-projects/syntheverse-poc/settings/environment-variables
2. Find `DATABASE_URL` or create it if it doesn't exist
3. Set the value to the connection string from Step 1
4. Make sure it's set for **Production**, **Preview**, and **Development** environments
5. Save

### Step 3: Verify Connection

After setting the DATABASE_URL, test the connection:

- Visit: https://syntheverse-poc.vercel.app/api/test-db
- You should see: `{"success":true,"connection":"ok",...}`

### Step 4: Redeploy (if needed)

If the environment variable was just added/updated, you may need to redeploy:

```bash
vercel --prod
```

## Connection String Format

The correct format is:

```
postgresql://postgres:PASSWORD@db.jfbgdxeumzqzigptbmvp.supabase.co:5432/postgres
```

Where:

- `postgresql://` - protocol
- `postgres` - username
- `PASSWORD` - your database password (URL encoded if it contains special characters)
- `db.jfbgdxeumzqzigptbmvp.supabase.co` - database hostname
- `5432` - port
- `postgres` - database name

## Troubleshooting

If you still get connection errors:

1. Verify the password is correct
2. Check if your Supabase project is active (not paused)
3. Verify the project ID matches: `jfbgdxeumzqzigptbmvp`
4. Check if database allows connections from external IPs (should be enabled by default)
