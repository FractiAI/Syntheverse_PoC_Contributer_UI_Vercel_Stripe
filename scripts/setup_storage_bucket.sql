-- ============================================
-- Supabase Storage Bucket Setup for PoC PDF Files
-- ============================================
-- 
-- NOTE: Storage buckets cannot be created via SQL.
-- This script sets up RLS policies for the 'poc-files' bucket.
-- 
-- You must create the bucket first using one of these methods:
--   1. Supabase Dashboard: Storage → New Bucket → Name: "poc-files", Public: true
--   2. Run: npx tsx scripts/setup-storage-bucket.ts
--   3. Run: ./scripts/setup-storage-bucket.sh
--
-- After creating the bucket, run this SQL to set up policies.
-- ============================================

-- Verify bucket exists (run this first to check)
-- This will return empty if bucket doesn't exist yet
SELECT 
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets
WHERE name = 'poc-files';

-- ============================================
-- Enable RLS on storage.objects (if not already enabled)
-- ============================================
-- Note: RLS is usually enabled by default in Supabase Storage
-- Skip this if you get permission errors - RLS is likely already enabled
DO $$
BEGIN
    -- Only try to enable RLS if we have permission
    -- RLS should already be enabled in Supabase by default
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'storage' 
        AND c.relname = 'objects'
        AND NOT c.relrowsecurity
    ) THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on storage.objects';
    ELSE
        RAISE NOTICE 'RLS already enabled or table does not exist';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Cannot enable RLS - insufficient privileges (RLS may already be enabled)';
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS is likely already enabled - continuing with policy creation';
END $$;

-- ============================================
-- Create RLS Policies for 'poc-files' bucket
-- ============================================

-- Policy 1: Allow public read access to all files
-- Anyone can view/download PDFs from the bucket
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access - Read poc-files" ON storage.objects;
    
    CREATE POLICY "Public Access - Read poc-files"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
        bucket_id = 'poc-files'
    );
    
    RAISE NOTICE 'Read policy created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not create read policy: %', SQLERRM;
END $$;

-- Policy 2: Allow authenticated users to upload files
-- Only authenticated users can upload PDFs
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated Upload - poc-files" ON storage.objects;
    
    CREATE POLICY "Authenticated Upload - poc-files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'poc-files' AND
        (storage.foldername(name))[1] = 'poc-submissions'
    );
    
    RAISE NOTICE 'Upload policy created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not create upload policy: %', SQLERRM;
END $$;

-- Policy 3: Allow authenticated users to update their own files
-- Users can update files they uploaded (based on owner)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated Update - poc-files" ON storage.objects;
    
    CREATE POLICY "Authenticated Update - poc-files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'poc-files' AND
        auth.uid()::text = owner
    );
    
    RAISE NOTICE 'Update policy created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not create update policy: %', SQLERRM;
END $$;

-- Policy 4: Allow authenticated users to delete their own files
-- Users can delete files they uploaded (based on owner)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated Delete - poc-files" ON storage.objects;
    
    CREATE POLICY "Authenticated Delete - poc-files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'poc-files' AND
        auth.uid()::text = owner
    );
    
    RAISE NOTICE 'Delete policy created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not create delete policy: %', SQLERRM;
END $$;

-- ============================================
-- Verify Policies Created
-- ============================================
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%poc-files%'
ORDER BY policyname;

-- ============================================
-- Optional: Create a function to get public URL for a file
-- ============================================
CREATE OR REPLACE FUNCTION storage.get_poc_file_url(file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bucket_url TEXT;
BEGIN
    -- Get the public URL for the file
    SELECT 
        CONCAT(
            (SELECT setting::text FROM pg_settings WHERE name = 'app.settings.supabase_url'),
            '/storage/v1/object/public/poc-files/',
            file_path
        )
    INTO bucket_url;
    
    RETURN bucket_url;
END;
$$;

-- Test the function (replace with actual path after upload)
-- SELECT storage.get_poc_file_url('poc-submissions/test-hash/test.pdf');

-- ============================================
-- Verification Queries
-- ============================================

-- Check bucket exists and settings
SELECT 
    'Bucket Status' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'poc-files') 
        THEN '✅ Bucket exists' 
        ELSE '❌ Bucket does not exist - create it first!' 
    END as status
UNION ALL
SELECT 
    'Bucket is Public',
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'poc-files' AND public = true) 
        THEN '✅ Bucket is public' 
        ELSE '⚠️  Bucket is not public - enable public access' 
    END
UNION ALL
SELECT 
    'RLS Enabled',
    CASE 
        WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage'))
        THEN '✅ RLS is enabled'
        ELSE '❌ RLS is not enabled'
    END
UNION ALL
SELECT 
    'Read Policy',
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access - Read poc-files')
        THEN '✅ Read policy exists'
        ELSE '❌ Read policy missing'
    END
UNION ALL
SELECT 
    'Upload Policy',
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload - poc-files')
        THEN '✅ Upload policy exists'
        ELSE '❌ Upload policy missing'
    END;

-- ============================================
-- Summary
-- ============================================
-- After running this script:
-- 1. Verify bucket exists (first query)
-- 2. Check all policies are created (verification queries)
-- 3. If bucket doesn't exist, create it via Dashboard or API first
-- 4. PDF uploads will work once bucket is created and policies are in place
-- ============================================

