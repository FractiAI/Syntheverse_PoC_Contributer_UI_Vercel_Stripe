-- ============================================================================
-- Current Schema from Supabase Online Database
-- Generated from Supabase Dashboard SQL Editor
-- ============================================================================

-- Table: allocations
CREATE TABLE "allocations" (
    "id" text NOT NULL,
    "submission_hash" text NOT NULL,
    "contributor" text NOT NULL,
    "metal" text NOT NULL,
    "epoch" text NOT NULL,
    "tier" text,
    "reward" numeric(20,0) NOT NULL,
    "tier_multiplier" numeric(10,4) NOT NULL DEFAULT 1.0,
    "epoch_balance_before" numeric(20,0) NOT NULL,
    "epoch_balance_after" numeric(20,0) NOT NULL,
    "created_at" timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: contributions
CREATE TABLE "contributions" (
    "submission_hash" text NOT NULL,
    "title" text NOT NULL,
    "contributor" text NOT NULL,
    "content_hash" text NOT NULL,
    "text_content" text,
    "pdf_path" text,
    "status" text NOT NULL DEFAULT 'draft'::text,
    "category" text,
    "metals" jsonb,
    "metadata" jsonb,
    "created_at" timestamp without time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
    "embedding" jsonb,
    "vector_x" numeric(20,10),
    "vector_y" numeric(20,10),
    "vector_z" numeric(20,10),
    "embedding_model" text,
    "vector_generated_at" timestamp without time zone,
    "registered" boolean DEFAULT false,
    "registration_date" timestamp without time zone,
    "registration_tx_hash" text,
    "stripe_payment_id" text
);

-- Table: epoch_balances
CREATE TABLE "epoch_balances" (
    "id" text NOT NULL,
    "epoch" text NOT NULL,
    "balance" numeric(20,0) NOT NULL,
    "threshold" numeric(20,0) NOT NULL,
    "distribution_amount" numeric(20,0) NOT NULL,
    "distribution_percent" numeric(5,2) NOT NULL,
    "updated_at" timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: poc_log
CREATE TABLE "poc_log" (
    "id" text NOT NULL,
    "submission_hash" text NOT NULL,
    "contributor" text NOT NULL,
    "event_type" text NOT NULL,
    "event_status" text,
    "title" text,
    "category" text,
    "request_data" jsonb,
    "response_data" jsonb,
    "evaluation_result" jsonb,
    "grok_api_request" jsonb,
    "grok_api_response" jsonb,
    "error_message" text,
    "error_stack" text,
    "processing_time_ms" integer(32,0),
    "metadata" jsonb,
    "created_at" timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: tokenomics
CREATE TABLE "tokenomics" (
    "id" text NOT NULL DEFAULT 'main'::text,
    "total_supply" numeric(20,0) NOT NULL DEFAULT '90000000000000'::numeric,
    "total_distributed" numeric(20,0) NOT NULL DEFAULT '0'::numeric,
    "current_epoch" text NOT NULL DEFAULT 'founder'::text,
    "founder_halving_count" integer(32,0) NOT NULL DEFAULT 0,
    "updated_at" timestamp without time zone NOT NULL DEFAULT now()
);

-- Table: users_table
CREATE TABLE "users_table" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "plan" text NOT NULL,
    "stripe_id" text NOT NULL
);

-- ============================================================================
-- Notes:
-- 1. The contributions table has the registration fields we added:
--    - registered (boolean, default false)
--    - registration_date (timestamp)
--    - registration_tx_hash (text)
--    - stripe_payment_id (text)
-- 2. Vector fields (vector_x, vector_y, vector_z) are numeric(20,10)
-- 3. Table name is "users_table" not "users"
-- ============================================================================

