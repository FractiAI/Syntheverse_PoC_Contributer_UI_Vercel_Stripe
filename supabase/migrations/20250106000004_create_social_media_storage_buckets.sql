-- Migration: Create Storage Buckets for Social Media
-- Created: January 2025
-- Description: Instructions for creating Supabase Storage buckets for social media images and profile pictures

-- Note: This SQL cannot create buckets directly. Use Supabase Dashboard or CLI:
-- supabase storage create social-media-images --public
-- supabase storage create profile-pictures --public

-- Bucket 1: social-media-images
-- Name: social-media-images
-- Public: true
-- File size limit: 5MB (5242880 bytes)
-- Allowed MIME types: image/*
-- Path structure: {sandbox_id}/{filename} or syntheverse/{filename}

-- Bucket 2: profile-pictures
-- Name: profile-pictures
-- Public: true
-- File size limit: 2MB (2097152 bytes)
-- Allowed MIME types: image/*
-- Path structure: {filename} (organized by user email hash)

-- After creating the buckets, set up RLS policies:

-- Storage RLS Policies for social-media-images:
-- Allow authenticated users to upload
-- Allow public read access

-- Storage RLS Policies for profile-pictures:
-- Allow authenticated users to upload (own profile only)
-- Allow public read access

-- Instructions:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Create "social-media-images" bucket:
--    - Name: social-media-images
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/*
-- 4. Create "profile-pictures" bucket:
--    - Name: profile-pictures
--    - Public: Yes
--    - File size limit: 2MB
--    - Allowed MIME types: image/*
-- 5. Set up RLS policies in Storage → Policies for each bucket

