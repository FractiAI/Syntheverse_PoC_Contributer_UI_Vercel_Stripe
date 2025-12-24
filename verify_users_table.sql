-- Verify users_table was created successfully
-- Run this in Supabase Dashboard → SQL Editor

-- Check table exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users_table'
) AS users_table_exists;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users_table'
ORDER BY ordinal_position;

-- Check if any users exist (will be 0 if none)
SELECT COUNT(*) AS user_count FROM users_table;

