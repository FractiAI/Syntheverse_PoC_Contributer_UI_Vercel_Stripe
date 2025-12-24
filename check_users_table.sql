-- SQL query to check if users_table exists
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- Check all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Specifically check if users_table exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users_table'
) AS users_table_exists;

-- If users_table exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users_table'
ORDER BY ordinal_position;

