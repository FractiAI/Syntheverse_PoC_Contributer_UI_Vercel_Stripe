-- Verify PoC Archive is Cleared
-- Run this to confirm all data was deleted

SELECT 
    (SELECT COUNT(*) FROM contributions) as remaining_contributions,
    (SELECT COUNT(*) FROM allocations) as remaining_allocations,
    (SELECT COUNT(*) FROM poc_log) as remaining_logs;

-- Expected result: All counts should be 0
-- remaining_contributions | remaining_allocations | remaining_logs
-- -----------------------+----------------------+----------------
-- 0                      | 0                    | 0

