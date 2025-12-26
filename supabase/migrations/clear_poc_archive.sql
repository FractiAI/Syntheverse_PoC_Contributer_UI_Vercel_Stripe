-- Clear PoC Archive for Testing
-- This script deletes all contributions, allocations, and PoC logs
-- 
-- WARNING: This will delete ALL PoC submissions, allocations, and logs!
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- Delete in order to respect foreign key constraints
-- 1. Delete allocations first (references contributions via submission_hash)
DELETE FROM allocations;

-- 2. Delete poc_log entries (references contributions via submission_hash)
DELETE FROM poc_log;

-- 3. Delete contributions
DELETE FROM contributions;

-- Verify deletion
SELECT 
    (SELECT COUNT(*) FROM contributions) as remaining_contributions,
    (SELECT COUNT(*) FROM allocations) as remaining_allocations,
    (SELECT COUNT(*) FROM poc_log) as remaining_logs;

