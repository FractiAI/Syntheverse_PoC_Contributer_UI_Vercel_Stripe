-- Migration: Add Profile Picture Support to Users Table
-- Created: January 2025
-- Description: Adds profile_picture_url field to users_table for social media avatars

-- Add profile_picture_url column if it doesn't exist
ALTER TABLE public.users_table 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add index for faster lookups (optional, but helpful for profile queries)
CREATE INDEX IF NOT EXISTS idx_users_table_profile_picture ON public.users_table(profile_picture_url) WHERE profile_picture_url IS NOT NULL;

COMMENT ON COLUMN public.users_table.profile_picture_url IS 'URL to user profile picture stored in Supabase Storage (profile-pictures bucket)';

