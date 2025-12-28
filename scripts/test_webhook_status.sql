-- ============================================
-- Test Webhook Status and Registration
-- ============================================
-- This script helps verify if webhook processing is working correctly
-- Run this after a Stripe payment to check registration and allocation status

-- Step 1: Check recent contributions and their registration status
SELECT 
    'RECENT CONTRIBUTIONS' as "Status",
    "submission_hash",
    "title",
    "contributor",
    "registered" as "Is Registered",
    "registration_date",
    "stripe_payment_id",
    "registration_tx_hash",
    "created_at",
    "updated_at"
FROM "contributions"
WHERE "created_at" > NOW() - INTERVAL '1 hour'
ORDER BY "created_at" DESC
LIMIT 10;

-- Step 2: Check allocations for recent submissions
SELECT 
    'RECENT ALLOCATIONS' as "Status",
    a."submission_hash",
    c."title",
    a."contributor",
    a."metal",
    a."epoch",
    a."reward"::text as "allocation_amount",
    a."tier_multiplier",
    a."created_at"
FROM "allocations" a
LEFT JOIN "contributions" c ON c."submission_hash" = a."submission_hash"
WHERE a."created_at" > NOW() - INTERVAL '1 hour'
ORDER BY a."created_at" DESC
LIMIT 10;

-- Step 3: Check epoch balances to see if they were updated
SELECT 
    'EPOCH BALANCES' as "Status",
    "epoch",
    "balance"::text as "current_balance",
    "distribution_amount"::text as "initial_balance",
    ("distribution_amount"::numeric - "balance"::numeric)::text as "allocated_amount",
    "updated_at"
FROM "epoch_balances"
ORDER BY 
    CASE "epoch"
        WHEN 'founder' THEN 1
        WHEN 'pioneer' THEN 2
        WHEN 'community' THEN 3
        WHEN 'ecosystem' THEN 4
    END;

-- Step 4: Check tokenomics total distributed
SELECT 
    'TOKENOMICS' as "Status",
    "current_epoch",
    "total_distributed"::text,
    "total_supply"::text,
    ("total_supply"::numeric - "total_distributed"::numeric)::text as "remaining",
    "updated_at"
FROM "tokenomics"
WHERE "id" = 'main';

-- Step 5: Find contributions that are registered but have no allocations
SELECT 
    'REGISTERED BUT NOT ALLOCATED' as "Status",
    c."submission_hash",
    c."title",
    c."registered",
    c."registration_date",
    c."stripe_payment_id",
    c."metadata"->>'qualified_founder' as "qualified_founder",
    c."metadata"->>'pod_score' as "pod_score"
FROM "contributions" c
LEFT JOIN "allocations" a ON a."submission_hash" = c."submission_hash"
WHERE c."registered" = true
    AND a."submission_hash" IS NULL
    AND c."created_at" > NOW() - INTERVAL '24 hours'
ORDER BY c."registration_date" DESC;

