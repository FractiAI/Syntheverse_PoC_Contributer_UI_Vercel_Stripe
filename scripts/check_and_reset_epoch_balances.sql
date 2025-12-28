-- ============================================
-- Check and Reset Epoch Balances to 100%
-- ============================================
-- Verify current balances and reset them to initial distribution amounts
-- Since no PoC has been registered/allocated, balances should equal distribution_amount

-- Step 1: Check current state
SELECT 
    'CURRENT STATE' as "Status",
    "id",
    "epoch",
    "balance"::text as "current_balance",
    "distribution_amount"::text as "distribution_amount",
    "balance"::numeric - "distribution_amount"::numeric as "difference",
    CASE 
        WHEN "balance"::numeric = "distribution_amount"::numeric THEN 'OK - At 100%'
        WHEN "balance"::numeric < "distribution_amount"::numeric THEN 'LOW - Needs Reset'
        ELSE 'UNKNOWN'
    END as "Status Check"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Step 2: Reset all balances to match distribution_amount (100% available)
-- This sets balance = distribution_amount for each epoch
UPDATE "epoch_balances"
SET 
    "balance" = "distribution_amount",
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- Step 3: If distribution_amount is 0 or NULL, set both balance and distribution_amount to correct initial values
-- First ensure distribution_amount is set correctly, then balance matches it
UPDATE "epoch_balances"
SET 
    "distribution_amount" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'      -- 45T SYNTH (50%)
        WHEN "epoch" = 'pioneer' THEN '22500000000000'      -- 22.5T SYNTH (25%)
        WHEN "epoch" = 'community' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        ELSE "distribution_amount"
    END,
    "balance" = CASE 
        WHEN "epoch" = 'founder' THEN '45000000000000'      -- 45T SYNTH (50%)
        WHEN "epoch" = 'pioneer' THEN '22500000000000'      -- 22.5T SYNTH (25%)
        WHEN "epoch" = 'community' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        WHEN "epoch" = 'ecosystem' THEN '11250000000000'    -- 11.25T SYNTH (12.5%)
        ELSE "balance"
    END,
    "updated_at" = NOW()
WHERE "epoch" IN ('founder', 'pioneer', 'community', 'ecosystem');

-- Step 4: Insert epoch balances if they don't exist
INSERT INTO "epoch_balances" ("id", "epoch", "balance", "threshold", "distribution_amount", "distribution_percent")
VALUES 
    ('epoch_founder', 'founder', '45000000000000', '0', '45000000000000', 50.0),
    ('epoch_pioneer', 'pioneer', '22500000000000', '0', '22500000000000', 25.0),
    ('epoch_community', 'community', '11250000000000', '0', '11250000000000', 12.5),
    ('epoch_ecosystem', 'ecosystem', '11250000000000', '0', '11250000000000', 12.5)
ON CONFLICT ("id") DO UPDATE
SET 
    "balance" = EXCLUDED."distribution_amount",  -- Set balance = distribution_amount (100%)
    "distribution_amount" = EXCLUDED."distribution_amount",
    "updated_at" = NOW();

-- Step 5: Verify final state - balance should equal distribution_amount (100% available)
SELECT 
    'FINAL VERIFICATION' as "Status",
    "id",
    "epoch",
    "balance"::text as "balance",
    "distribution_amount"::text as "distribution_amount",
    "balance"::numeric = "distribution_amount"::numeric as "is_100_percent",
    "distribution_percent"::text as "distribution_percent",
    CASE 
        WHEN "balance"::numeric = "distribution_amount"::numeric THEN '✓ At 100% - Ready'
        ELSE '✗ NOT at 100% - Check values'
    END as "Status"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

