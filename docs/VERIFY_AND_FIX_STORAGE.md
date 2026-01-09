# Verify and Fix Storage Bucket RLS Policies

## Step 1: Check if Bucket Exists

1. Go to Supabase Dashboard
2. Click **Storage** in left sidebar
3. Look for `social-media-images` bucket

### If Bucket DOES NOT Exist:
Click **New Bucket** and create it:
- Name: `social-media-images`
- Public bucket: **YES** (toggle on)
- Click **Create bucket**

### If Bucket EXISTS:
- Click on the bucket name
- Check if "Public" toggle is **ON**
- If not, click **Settings** and enable Public

## Step 2: Verify Current Policies

1. In Storage, click `social-media-images` bucket
2. Click **Policies** tab
3. Check what policies exist (if any)

## Step 3: Run This SIMPLE SQL

Go to **SQL Editor** and run this simplified version:

```sql
-- Step 1: Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-media-images', 'social-media-images', true)
ON CONFLICT (id) 
DO UPDATE SET public = true;

-- Step 2: Remove ALL existing policies for this bucket
DELETE FROM storage.policies 
WHERE bucket_id = 'social-media-images';

-- Step 3: Create upload policy (most permissive - for testing)
INSERT INTO storage.policies (name, bucket_id, definition, check)
VALUES (
  'Allow authenticated uploads',
  'social-media-images',
  'authenticated',
  '(bucket_id = ''social-media-images'')'
);

-- Step 4: Create public read policy
INSERT INTO storage.policies (name, bucket_id, definition, check)
VALUES (
  'Allow public reads',
  'social-media-images',
  'public',
  '(bucket_id = ''social-media-images'')'
);
```

## Step 4: Test Upload

After running the SQL:
1. Refresh your app
2. Try uploading an image in Cloud Channel
3. Check the error logs

## Alternative: Use Supabase UI to Create Policies

If SQL still fails, use the UI:

### Create Upload Policy via UI:

1. Go to **Storage** → `social-media-images` → **Policies**
2. Click **New Policy**
3. Choose **Custom** policy
4. Fill in:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **USING expression**: (leave empty)
   - **WITH CHECK expression**: `bucket_id = 'social-media-images'`
5. Click **Review** then **Save policy**

### Create Read Policy via UI:

1. Click **New Policy** again
2. Choose **Custom** policy
3. Fill in:
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **USING expression**: `bucket_id = 'social-media-images'`
   - **WITH CHECK expression**: (leave empty)
4. Click **Review** then **Save policy**

## Step 5: Verify Policies Are Active

1. Go to **Storage** → **Policies**
2. Filter by `social-media-images`
3. You should see:
   - ✅ Allow authenticated uploads (INSERT, authenticated)
   - ✅ Allow public reads (SELECT, public)
4. Both should show as **Enabled**

## Debugging Checklist

- [ ] Bucket `social-media-images` exists
- [ ] Bucket is marked as **Public**
- [ ] At least one INSERT policy exists for `authenticated` role
- [ ] At least one SELECT policy exists for `public` role
- [ ] Policies show as **Enabled** in dashboard
- [ ] User is logged in (check auth token in browser)

## If Still Failing

Check these in Supabase logs:

1. Go to **Logs** → **Postgres Logs**
2. Look for RLS errors when upload is attempted
3. Copy any error message

Then check:
- Is the user's auth token valid?
- Is the user's email verified?
- Are there conflicting policies?

