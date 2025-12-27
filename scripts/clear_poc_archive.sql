-- ============================================================================
-- Clear PoC Archive and Reset Registration/Payment History
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- 
-- This script clears:
-- - All contributions (including registration/payment data)
-- - All allocations (token allocations)
-- - All poc_log entries (audit trail)
-- - Resets tokenomics total_distributed to 0
-- - Resets epoch balances to original distribution amounts
-- ============================================================================

-- Start transaction
BEGIN;

-- 1. Delete all allocations (token allocations)
DELETE FROM allocations;
-- Note: This will show count of deleted rows

-- 2. Delete all poc_log entries (audit trail)
DELETE FROM poc_log;

-- 3. Delete all contributions (includes registration data: registered, registration_date, registration_tx_hash, stripe_payment_id)
DELETE FROM contributions;

-- 4. Reset tokenomics total_distributed to 0
UPDATE tokenomics
SET 
    total_distributed = '0',
    updated_at = NOW()
WHERE id = 'main';

-- 5. Reset epoch balances to original distribution amounts (preserves epoch structure)
UPDATE epoch_balances
SET 
    balance = distribution_amount,
    updated_at = NOW();

-- Commit transaction
COMMIT;

-- Optional: Verify the cleanup
-- SELECT 'allocations' as table_name, COUNT(*) as remaining_count FROM allocations
-- UNION ALL
-- SELECT 'contributions', COUNT(*) FROM contributions
-- UNION ALL
-- SELECT 'poc_log', COUNT(*) FROM poc_log
-- UNION ALL
-- SELECT 'tokenomics total_distributed', total_distributed::bigint FROM tokenomics WHERE id = 'main';

