-- ============================================================================
-- Get Current Schema from Supabase Online Database
-- ============================================================================
-- Run this query in Supabase Dashboard → SQL Editor → New Query
-- This will generate the complete schema including tables, columns, indexes, etc.
-- ============================================================================

-- 1. Get all tables and columns
SELECT 
    'TABLE' as object_type,
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN data_type || '(' || character_maximum_length || ')'
        WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL
        THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
        WHEN numeric_precision IS NOT NULL
        THEN data_type || '(' || numeric_precision || ')'
        ELSE data_type
    END as full_data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Get all indexes
SELECT 
    'INDEX' as object_type,
    tablename as table_name,
    indexname as index_name,
    indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 3. Get all foreign keys
SELECT 
    'FOREIGN_KEY' as object_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. Get all primary keys
SELECT 
    'PRIMARY_KEY' as object_type,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. Get all unique constraints
SELECT 
    'UNIQUE' as object_type,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 6. Get table comments
SELECT 
    'COMMENT' as object_type,
    'public' as schemaname,
    c.relname as table_name,
    obj_description(c.oid, 'pg_class') as table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
ORDER BY c.relname;

-- 7. Get column comments
SELECT 
    'COLUMN_COMMENT' as object_type,
    table_name,
    column_name,
    col_description(
        (table_schema||'.'||table_name)::regclass::oid,
        ordinal_position
    ) as column_comment
FROM information_schema.columns
WHERE table_schema = 'public'
    AND col_description(
        (table_schema||'.'||table_name)::regclass::oid,
        ordinal_position
    ) IS NOT NULL
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- Alternative: Get complete CREATE TABLE statements
-- ============================================================================
-- This query generates CREATE TABLE statements for all tables
SELECT 
    'CREATE TABLE "' || table_name || '" (' || 
    string_agg(
        '"' || column_name || '" ' || 
        CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN data_type || '(' || character_maximum_length || ')'
            WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL
            THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN numeric_precision IS NOT NULL
            THEN data_type || '(' || numeric_precision || ')'
            ELSE data_type
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
        ORDER BY ordinal_position
    ) || 
    ');' as create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

