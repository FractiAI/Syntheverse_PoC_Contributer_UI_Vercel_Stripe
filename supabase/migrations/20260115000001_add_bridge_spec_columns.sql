-- ============================================================================
-- BridgeSpec and TO (Testability) Integration Migration
-- Date: 2026-01-15
-- Purpose: Add bridge_spec column and indexes for BridgeSpec/TO integration
-- ============================================================================

-- Add bridge_spec column to contributions table
-- BridgeSpec is optional for community scoring, required for official status
ALTER TABLE contributions
ADD COLUMN IF NOT EXISTS bridge_spec JSONB;

-- Create GIN index on bridge_spec for efficient querying
CREATE INDEX IF NOT EXISTS idx_contributions_bridge_spec 
ON contributions USING gin(bridge_spec);

-- Create index on bridgespec_hash in atomic_score.trace for lookup
CREATE INDEX IF NOT EXISTS idx_contributions_bridgespec_hash
ON contributions ((atomic_score->'trace'->>'bridgespec_hash'))
WHERE atomic_score->'trace'->>'bridgespec_hash' IS NOT NULL;

-- Create index on bubble_class for tier filtering (Copper/Silver/Gold/Community)
CREATE INDEX IF NOT EXISTS idx_contributions_bubble_class
ON contributions ((atomic_score->'trace'->'precision'->>'bubble_class'))
WHERE atomic_score->'trace'->'precision'->>'bubble_class' IS NOT NULL;

-- Create index on n_hat (BMP precision) for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_contributions_n_hat
ON contributions (((atomic_score->'trace'->'precision'->>'n_hat')::numeric) DESC NULLS LAST)
WHERE atomic_score->'trace'->'precision'->>'n_hat' IS NOT NULL;

-- Create index on T-B overall status for filtering official vs community
CREATE INDEX IF NOT EXISTS idx_contributions_t_b_overall
ON contributions ((atomic_score->'trace'->'thalet'->'T_B'->>'overall'))
WHERE atomic_score->'trace'->'thalet'->'T_B'->>'overall' IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN contributions.bridge_spec IS 
'BridgeSpec (TO/Objective Theory) artifact for PoC submission. Optional for community scoring, required for official status. Contains bridges from Chamber A (meaning/narrative) to Chamber B (testability/physics). Each bridge includes: claim_id, regime, observables, differential_prediction, failure_condition, floor_constraints.';

-- Add comment for atomic_score.trace extensions
COMMENT ON COLUMN contributions.atomic_score IS 
'THALET Protocol compliant atomic score payload. Single source of truth for PoC score. Extended with: precision (n_hat, bubble_class, epsilon, tier), thalet.T_B (T-B-01..04 testability checks), bridgespec_hash (SHA-256 pointer to bridge_spec). Contains: final (sovereign field), execution_context (toggles, seed, timestamp_utc, pipeline_version, operator_id), trace (intermediate steps + precision + THALET + T-B), integrity_hash (SHA-256 for validation).';


