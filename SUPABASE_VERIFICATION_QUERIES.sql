-- ============================================================================
-- Supabase Verification Queries for Scoring Fixes
-- Date: January 10, 2026
-- Purpose: Verify schema supports new scoring fields (no changes needed!)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: Verify scoring_config table exists
-- ----------------------------------------------------------------------------
-- Expected: Should return 'true'
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scoring_config'
) as scoring_config_exists;

-- ----------------------------------------------------------------------------
-- Query 2: Check current toggle configuration
-- ----------------------------------------------------------------------------
-- Expected: Should return a row with multiplier_toggles configuration
SELECT 
  config_key, 
  config_value, 
  updated_at,
  updated_by
FROM scoring_config
WHERE config_key = 'multiplier_toggles';

-- ----------------------------------------------------------------------------
-- Query 3: Insert default configuration (ONLY IF NOT EXISTS)
-- ----------------------------------------------------------------------------
-- Run this ONLY if Query 2 returned no rows
-- This sets up the default toggle configuration
INSERT INTO scoring_config (config_key, config_value, updated_by)
VALUES (
  'multiplier_toggles',
  '{
    "seed_enabled": true,
    "edge_enabled": true,
    "overlap_enabled": true,
    "metal_policy_enabled": true,
    "sweet_spot_center": 0.142,
    "sweet_spot_tolerance": 0.05,
    "penalty_threshold": 0.30,
    "overlap_operator": "embedding_cosine"
  }'::jsonb,
  'system'
)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = NOW(),
  updated_by = EXCLUDED.updated_by;

-- ----------------------------------------------------------------------------
-- Query 4: Check recent evaluations have new fields
-- ----------------------------------------------------------------------------
-- Expected: Recent evaluations should show 'true' for has_score_trace, etc.
SELECT 
  submission_hash,
  title,
  metadata->>'score_trace' IS NOT NULL as has_score_trace,
  metadata->>'scoring_metadata' IS NOT NULL as has_scoring_metadata,
  metadata->>'pod_composition' IS NOT NULL as has_pod_composition,
  metadata->'score_trace'->>'final_score' as final_score,
  metadata->>'pod_score' as pod_score,
  updated_at
FROM contributions
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- Query 5: Inspect a recent score_trace structure
-- ----------------------------------------------------------------------------
-- Expected: Should show the new toggle fields we added
SELECT 
  submission_hash,
  title,
  -- Toggle states
  metadata->'score_trace'->'toggles' as toggle_states,
  -- Seed multiplier fields
  metadata->'score_trace'->>'seed_detected_by_ai' as seed_detected,
  metadata->'score_trace'->>'seed_toggle_enabled' as seed_toggle,
  metadata->'score_trace'->>'seed_multiplier_applied' as seed_applied,
  metadata->'score_trace'->>'seed_multiplier' as seed_multiplier_value,
  -- Edge multiplier fields
  metadata->'score_trace'->>'edge_detected_by_ai' as edge_detected,
  metadata->'score_trace'->>'edge_toggle_enabled' as edge_toggle,
  metadata->'score_trace'->>'edge_multiplier_applied' as edge_applied,
  -- Scoring fields
  metadata->'score_trace'->>'composite' as composite_score,
  metadata->'score_trace'->>'overlap_percent' as overlap_percent,
  metadata->'score_trace'->>'penalty_percent_applied' as penalty_applied,
  metadata->'score_trace'->>'bonus_multiplier_applied' as bonus_applied,
  metadata->'score_trace'->>'final_score' as final_score,
  updated_at
FROM contributions
WHERE metadata->'score_trace' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 1;

-- ----------------------------------------------------------------------------
-- Query 6: Verify pod_composition has toggle states
-- ----------------------------------------------------------------------------
-- Expected: Should show toggle states in pod_composition
SELECT 
  submission_hash,
  title,
  metadata->'pod_composition'->'toggles' as composition_toggles,
  metadata->'pod_composition'->'computed_vs_applied' as computed_vs_applied,
  metadata->'pod_composition'->>'final_clamped' as final_clamped,
  updated_at
FROM contributions
WHERE metadata->'pod_composition' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 1;

-- ----------------------------------------------------------------------------
-- Query 7: Check for any negative overlap values (should be ZERO)
-- ----------------------------------------------------------------------------
-- Expected: Should return 0 rows (no negative overlaps after our fix)
SELECT 
  submission_hash,
  title,
  metadata->'score_trace'->>'overlap_percent' as overlap_percent,
  metadata->>'redundancy_overlap_percent' as redundancy_overlap,
  updated_at
FROM contributions
WHERE 
  (metadata->'score_trace'->>'overlap_percent')::numeric < 0
  OR (metadata->>'redundancy_overlap_percent')::numeric < 0
ORDER BY updated_at DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- Query 8: Verify timestamps are current year (2026)
-- ----------------------------------------------------------------------------
-- Expected: All recent evaluations should have 2026 timestamps
SELECT 
  submission_hash,
  title,
  metadata->'scoring_metadata'->>'evaluation_timestamp' as eval_timestamp,
  EXTRACT(YEAR FROM (metadata->'scoring_metadata'->>'evaluation_timestamp')::timestamptz) as eval_year,
  updated_at
FROM contributions
WHERE metadata->'scoring_metadata' IS NOT NULL
  AND updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- OPTIONAL: Performance Optimization Indexes
-- ----------------------------------------------------------------------------
-- These are optional but recommended for better query performance

-- GIN index on metadata JSONB for faster queries
CREATE INDEX IF NOT EXISTS idx_contributions_metadata_gin 
ON contributions USING GIN (metadata);

-- Index on scoring_config config_key (should already exist from migration)
CREATE INDEX IF NOT EXISTS idx_scoring_config_key 
ON scoring_config(config_key);

-- Index on updated_at for faster recent queries
CREATE INDEX IF NOT EXISTS idx_contributions_updated_at 
ON contributions(updated_at DESC);

-- ============================================================================
-- Summary
-- ============================================================================
-- 
-- NO SCHEMA CHANGES REQUIRED! 
-- 
-- All new scoring fields (score_trace, scoring_metadata, pod_composition) 
-- are stored in the existing 'metadata' JSONB column.
-- 
-- Toggle configuration is stored in the existing 'scoring_config' table.
-- 
-- Just run these queries to verify everything is working correctly.
-- 
-- ============================================================================



