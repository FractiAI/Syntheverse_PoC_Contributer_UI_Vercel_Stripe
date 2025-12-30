-- ============================================
-- Supabase Storage Bucket RLS Policies for 'poc-files'
-- ============================================
-- 
-- IMPORTANT: This script only creates RLS policies.
-- Storage buckets must be created via Dashboard or API (not SQL).
-- 
-- Step 1: Create bucket in Dashboard:
--   Storage → New Bucket → Name: "poc-files", Public: true
-- 
-- Step 2: Run this SQL to create policies
-- ============================================

-- First, verify the bucket exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'poc-files') 
        THEN '✅ Bucket exists - proceeding with policies'
        ELSE '❌ ERROR: Bucket does not exist! Create it first in Dashboard.'
    END as status;

-- ============================================
-- Create RLS Policies (RLS is already enabled on storage.objects)
-- ============================================

-- Policy 1: Allow public read access to all files in poc-files bucket
-- Anyone can view/download PDFs from the bucket
DROP POLICY IF EXISTS "Public Access - Read poc-files" ON storage.objects;

CREATE POLICY "Public Access - Read poc-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'poc-files');

-- Policy 2: Allow authenticated users to upload files
-- Only authenticated users can upload PDFs to poc-submissions folder
DROP POLICY IF EXISTS "Authenticated Upload - poc-files" ON storage.objects;

CREATE POLICY "Authenticated Upload - poc-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'poc-files' AND
    (storage.foldername(name))[1] = 'poc-submissions'
);

-- Policy 3: Allow authenticated users to update their own files
-- Users can update files they uploaded (based on owner)
DROP POLICY IF EXISTS "Authenticated Update - poc-files" ON storage.objects;

CREATE POLICY "Authenticated Update - poc-files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'poc-files' AND
    auth.uid() = (owner::uuid)
);

-- Policy 4: Allow authenticated users to delete their own files
-- Users can delete files they uploaded (based on owner)
DROP POLICY IF EXISTS "Authenticated Delete - poc-files" ON storage.objects;

CREATE POLICY "Authenticated Delete - poc-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'poc-files' AND
    auth.uid() = (owner::uuid)
);

-- ============================================
-- Verify Policies Created
-- ============================================
SELECT 
    '✅ Policies Created' as status,
    policyname,
    cmd as operation,
    array_to_string(roles, ', ') as roles
FROM pg_policies
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%poc-files%'
ORDER BY policyname;

-- ============================================
-- Final Verification Summary
-- ============================================
SELECT 
    'Setup Complete' as summary,
    COUNT(*) FILTER (WHERE policyname LIKE '%Read%') as read_policies,
    COUNT(*) FILTER (WHERE policyname LIKE '%Upload%') as upload_policies,
    COUNT(*) FILTER (WHERE policyname LIKE '%Update%') as update_policies,
    COUNT(*) FILTER (WHERE policyname LIKE '%Delete%') as delete_policies,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ All policies created'
        ELSE '⚠️  Some policies may be missing'
    END as status
FROM pg_policies
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%poc-files%';

