-- Add seed submission and sweet spot edge detection columns
-- This migration adds explicit columns for seed submissions and sweet spot edges
-- to make querying and filtering easier in the UI

-- Add is_seed column to contributions table
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT FALSE;

-- Add has_sweet_spot_edges column to contributions table
-- Sweet spot edges are overlaps in the 9.2%-19.2% range (centered at 14.2%)
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS has_sweet_spot_edges BOOLEAN DEFAULT FALSE;

-- Add overlap_percent column for easy filtering/sorting
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS overlap_percent NUMERIC(5, 2) DEFAULT 0.0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contributions_is_seed ON contributions(is_seed) WHERE is_seed = TRUE;
CREATE INDEX IF NOT EXISTS idx_contributions_has_sweet_spot ON contributions(has_sweet_spot_edges) WHERE has_sweet_spot_edges = TRUE;
CREATE INDEX IF NOT EXISTS idx_contributions_overlap_percent ON contributions(overlap_percent);

-- Update existing submissions to populate these columns from metadata
-- This is a one-time backfill for existing data
UPDATE contributions
SET 
  is_seed = COALESCE((metadata->>'is_seed_submission')::boolean, FALSE),
  has_sweet_spot_edges = CASE 
    WHEN (metadata->'grok_evaluation_details'->>'bonus_multiplier_applied')::numeric > 1.0 
    THEN TRUE 
    ELSE FALSE 
  END,
  overlap_percent = COALESCE(
    (metadata->>'redundancy')::numeric,
    (metadata->'grok_evaluation_details'->>'overlap_percent')::numeric,
    0.0
  )
WHERE metadata IS NOT NULL;

-- Add similar columns to enterprise_contributions table
ALTER TABLE enterprise_contributions 
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT FALSE;

ALTER TABLE enterprise_contributions 
ADD COLUMN IF NOT EXISTS has_sweet_spot_edges BOOLEAN DEFAULT FALSE;

ALTER TABLE enterprise_contributions 
ADD COLUMN IF NOT EXISTS overlap_percent NUMERIC(5, 2) DEFAULT 0.0;

-- Create indexes for enterprise contributions
CREATE INDEX IF NOT EXISTS idx_enterprise_contributions_is_seed ON enterprise_contributions(is_seed) WHERE is_seed = TRUE;
CREATE INDEX IF NOT EXISTS idx_enterprise_contributions_has_sweet_spot ON enterprise_contributions(has_sweet_spot_edges) WHERE has_sweet_spot_edges = TRUE;
CREATE INDEX IF NOT EXISTS idx_enterprise_contributions_overlap_percent ON enterprise_contributions(overlap_percent);

-- Update existing enterprise submissions
UPDATE enterprise_contributions
SET 
  is_seed = COALESCE((metadata->>'is_seed_submission')::boolean, FALSE),
  has_sweet_spot_edges = CASE 
    WHEN (metadata->'grok_evaluation_details'->>'bonus_multiplier_applied')::numeric > 1.0 
    THEN TRUE 
    ELSE FALSE 
  END,
  overlap_percent = COALESCE(
    (metadata->>'redundancy')::numeric,
    (metadata->'grok_evaluation_details'->>'overlap_percent')::numeric,
    0.0
  )
WHERE metadata IS NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN contributions.is_seed IS 'First submission to a sandbox - receives 15% score multiplier (×1.15)';
COMMENT ON COLUMN contributions.has_sweet_spot_edges IS 'Overlap in sweet spot range (9.2%-19.2%, centered at 14.2%) - receives bonus multiplier';
COMMENT ON COLUMN contributions.overlap_percent IS 'Percentage overlap with archive (0-100). Positive = bonus, negative = penalty.';

COMMENT ON COLUMN enterprise_contributions.is_seed IS 'First submission to a sandbox - receives 15% score multiplier (×1.15)';
COMMENT ON COLUMN enterprise_contributions.has_sweet_spot_edges IS 'Overlap in sweet spot range (9.2%-19.2%, centered at 14.2%) - receives bonus multiplier';
COMMENT ON COLUMN enterprise_contributions.overlap_percent IS 'Percentage overlap with archive (0-100). Positive = bonus, negative = penalty.';

