-- SIMPLE approach: Use INSERT INTO storage.policies instead of CREATE POLICY
-- This is more reliable and works around potential RLS issues

-- Step 1: Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-media-images', 
  'social-media-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Step 2: Remove ALL existing policies for this bucket to start fresh
DELETE FROM storage.policies 
WHERE bucket_id = 'social-media-images';

-- Step 3: Add upload policy for authenticated users (using INSERT)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'Authenticated users can upload',
  'social-media-images',
  'authenticated',
  '(bucket_id = ''social-media-images'')'::text
);

-- Step 4: Add public read policy (using INSERT)
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'Public can read all images',
  'social-media-images',
  'public',
  '(bucket_id = ''social-media-images'')'::text
);

-- Verify policies were created
SELECT 
  name, 
  bucket_id, 
  definition as role, 
  check_expression 
FROM storage.policies 
WHERE bucket_id = 'social-media-images'
ORDER BY name;

