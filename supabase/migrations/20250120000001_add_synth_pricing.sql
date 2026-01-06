-- Migration: Add SYNTH token-based pricing to enterprise sandboxes
-- Date: 2025-01-20
-- Description: Adds SYNTH balance, activation status, and usage metrics tracking

-- Add SYNTH-related columns to enterprise_sandboxes
ALTER TABLE enterprise_sandboxes
ADD COLUMN IF NOT EXISTS synth_balance NUMERIC(20, 0) DEFAULT 0,
ADD COLUMN IF NOT EXISTS synth_activated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS synth_activated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS synth_activation_fee NUMERIC(20, 0) DEFAULT 10000,
ADD COLUMN IF NOT EXISTS current_reach_tier TEXT,
ADD COLUMN IF NOT EXISTS last_billing_cycle TIMESTAMP,
ADD COLUMN IF NOT EXISTS testing_mode BOOLEAN DEFAULT TRUE; -- New sandboxes start in testing mode

-- Create sandbox SYNTH transactions table
CREATE TABLE IF NOT EXISTS sandbox_synth_transactions (
  id TEXT PRIMARY KEY,
  sandbox_id TEXT NOT NULL REFERENCES enterprise_sandboxes(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('activation', 'deposit', 'rent', 'energy', 'refund', 'withdrawal')),
  amount NUMERIC(20, 0) NOT NULL,
  balance_before NUMERIC(20, 0) NOT NULL,
  balance_after NUMERIC(20, 0) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_synth_transactions_sandbox_id ON sandbox_synth_transactions(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_synth_transactions_created_at ON sandbox_synth_transactions(created_at DESC);

-- Create sandbox metrics table for tracking reach and activity
CREATE TABLE IF NOT EXISTS sandbox_metrics (
  sandbox_id TEXT PRIMARY KEY REFERENCES enterprise_sandboxes(id) ON DELETE CASCADE,
  unique_contributors INTEGER DEFAULT 0 NOT NULL,
  total_submissions INTEGER DEFAULT 0 NOT NULL,
  total_evaluations INTEGER DEFAULT 0 NOT NULL,
  total_registrations INTEGER DEFAULT 0 NOT NULL,
  total_allocations INTEGER DEFAULT 0 NOT NULL,
  total_analytics_queries INTEGER DEFAULT 0 NOT NULL,
  last_calculated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for metrics
CREATE INDEX IF NOT EXISTS idx_sandbox_metrics_updated_at ON sandbox_metrics(updated_at DESC);

-- Function to calculate reach tier based on unique contributors
CREATE OR REPLACE FUNCTION calculate_reach_tier(contributors INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE
    WHEN contributors <= 5 THEN RETURN 'Seed';
    WHEN contributors <= 25 THEN RETURN 'Growth';
    WHEN contributors <= 100 THEN RETURN 'Community';
    WHEN contributors <= 500 THEN RETURN 'Ecosystem';
    ELSE RETURN 'Metropolis';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get monthly rent based on reach tier
CREATE OR REPLACE FUNCTION get_monthly_rent(tier TEXT)
RETURNS NUMERIC(20, 0) AS $$
BEGIN
  CASE
    WHEN tier = 'Seed' THEN RETURN 1000;
    WHEN tier = 'Growth' THEN RETURN 5000;
    WHEN tier = 'Community' THEN RETURN 15000;
    WHEN tier = 'Ecosystem' THEN RETURN 50000;
    WHEN tier = 'Metropolis' THEN RETURN 100000;
    ELSE RETURN 1000; -- Default to Seed tier
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update sandbox metrics
CREATE OR REPLACE FUNCTION update_sandbox_metrics(p_sandbox_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_unique_contributors INTEGER;
  v_total_submissions INTEGER;
  v_total_evaluations INTEGER;
  v_total_registrations INTEGER;
  v_total_allocations INTEGER;
BEGIN
  -- Count unique contributors (excluding test submissions)
  SELECT COUNT(DISTINCT contributor)
  INTO v_unique_contributors
  FROM enterprise_contributions
  WHERE sandbox_id = p_sandbox_id
    AND status != 'testing'; -- Exclude test submissions

  -- Count total submissions
  SELECT COUNT(*)
  INTO v_total_submissions
  FROM enterprise_contributions
  WHERE sandbox_id = p_sandbox_id
    AND status != 'testing';

  -- Count evaluations (submissions that have been evaluated)
  SELECT COUNT(*)
  INTO v_total_evaluations
  FROM enterprise_contributions
  WHERE sandbox_id = p_sandbox_id
    AND status IN ('qualified', 'unqualified', 'evaluating')
    AND status != 'testing';

  -- Count on-chain registrations
  SELECT COUNT(*)
  INTO v_total_registrations
  FROM enterprise_contributions
  WHERE sandbox_id = p_sandbox_id
    AND registered = TRUE;

  -- Count token allocations
  SELECT COUNT(*)
  INTO v_total_allocations
  FROM enterprise_allocations
  WHERE sandbox_id = p_sandbox_id;

  -- Insert or update metrics
  INSERT INTO sandbox_metrics (
    sandbox_id,
    unique_contributors,
    total_submissions,
    total_evaluations,
    total_registrations,
    total_allocations,
    last_calculated_at,
    updated_at
  )
  VALUES (
    p_sandbox_id,
    v_unique_contributors,
    v_total_submissions,
    v_total_evaluations,
    v_total_registrations,
    v_total_allocations,
    NOW(),
    NOW()
  )
  ON CONFLICT (sandbox_id) DO UPDATE
  SET
    unique_contributors = EXCLUDED.unique_contributors,
    total_submissions = EXCLUDED.total_submissions,
    total_evaluations = EXCLUDED.total_evaluations,
    total_registrations = EXCLUDED.total_registrations,
    total_allocations = EXCLUDED.total_allocations,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics when contributions change
CREATE OR REPLACE FUNCTION trigger_update_sandbox_metrics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_sandbox_metrics(COALESCE(NEW.sandbox_id, OLD.sandbox_id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for enterprise_contributions
DROP TRIGGER IF EXISTS trg_update_sandbox_metrics_contributions ON enterprise_contributions;
CREATE TRIGGER trg_update_sandbox_metrics_contributions
  AFTER INSERT OR UPDATE OR DELETE ON enterprise_contributions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_sandbox_metrics();

-- Create trigger for enterprise_allocations
DROP TRIGGER IF EXISTS trg_update_sandbox_metrics_allocations ON enterprise_allocations;
CREATE TRIGGER trg_update_sandbox_metrics_allocations
  AFTER INSERT OR UPDATE OR DELETE ON enterprise_allocations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_sandbox_metrics();

-- Add comments for documentation
COMMENT ON COLUMN enterprise_sandboxes.synth_balance IS 'Current SYNTH token balance (18 decimals)';
COMMENT ON COLUMN enterprise_sandboxes.synth_activated IS 'Whether sandbox is activated for production use';
COMMENT ON COLUMN enterprise_sandboxes.synth_activated_at IS 'Timestamp when sandbox was activated';
COMMENT ON COLUMN enterprise_sandboxes.synth_activation_fee IS 'One-time activation fee in SYNTH tokens (default: 10,000)';
COMMENT ON COLUMN enterprise_sandboxes.current_reach_tier IS 'Current reach tier: Seed, Growth, Community, Ecosystem, Metropolis';
COMMENT ON COLUMN enterprise_sandboxes.last_billing_cycle IS 'Last time rent was charged';
COMMENT ON COLUMN enterprise_sandboxes.testing_mode IS 'Whether sandbox is in testing mode (free, no charges)';

COMMENT ON TABLE sandbox_synth_transactions IS 'Tracks all SYNTH token transactions for sandboxes';
COMMENT ON TABLE sandbox_metrics IS 'Tracks reach and activity metrics for sandboxes';

