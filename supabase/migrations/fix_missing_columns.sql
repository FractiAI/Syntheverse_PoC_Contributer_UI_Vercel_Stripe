-- Fix Missing Columns & Tables - Safe to run multiple times
-- Run this in Supabase SQL Editor to fix the 500 error

-- ============================================================
-- 1. Add is_edge column to contributions table (if missing)
-- ============================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contributions' 
    AND column_name = 'is_edge'
  ) THEN
    ALTER TABLE contributions 
    ADD COLUMN is_edge boolean DEFAULT false;
    
    -- Add comment
    COMMENT ON COLUMN contributions.is_edge IS 'Content exhibits edge characteristics (E₀-E₆) - receives 15% multiplier (×1.15)';
    
    RAISE NOTICE 'Added is_edge column to contributions table';
  ELSE
    RAISE NOTICE 'is_edge column already exists in contributions table';
  END IF;
END $$;

-- ============================================================
-- 2. Add is_edge column to enterprise_contributions table (if missing)
-- ============================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enterprise_contributions' 
    AND column_name = 'is_edge'
  ) THEN
    ALTER TABLE enterprise_contributions 
    ADD COLUMN is_edge boolean DEFAULT false;
    
    -- Add comment
    COMMENT ON COLUMN enterprise_contributions.is_edge IS 'Content exhibits edge characteristics (E₀-E₆) - receives 15% multiplier (×1.15)';
    
    RAISE NOTICE 'Added is_edge column to enterprise_contributions table';
  ELSE
    RAISE NOTICE 'is_edge column already exists in enterprise_contributions table';
  END IF;
END $$;

-- ============================================================
-- 3. Create scoring_config table (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS scoring_config (
  id SERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on config_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_scoring_config_key ON scoring_config(config_key);

-- Insert default multiplier config (only if not exists)
INSERT INTO scoring_config (config_key, config_value, updated_by)
VALUES (
  'multiplier_toggles',
  '{"seed_enabled": true, "edge_enabled": true}'::jsonb,
  'system'
)
ON CONFLICT (config_key) DO NOTHING;

-- Add comments
COMMENT ON TABLE scoring_config IS 'Runtime configuration for scoring system - used for testing and tuning';
COMMENT ON COLUMN scoring_config.config_key IS 'Unique identifier for config option (e.g., multiplier_toggles)';
COMMENT ON COLUMN scoring_config.config_value IS 'JSONB value storing the configuration';

-- ============================================================
-- 4. Enable RLS on scoring_config
-- ============================================================
ALTER TABLE scoring_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make script idempotent)
DROP POLICY IF EXISTS "Anyone authenticated can read scoring config" ON scoring_config;
DROP POLICY IF EXISTS "Only creators and operators can update scoring config" ON scoring_config;

-- Policy: Anyone authenticated can read scoring config
CREATE POLICY "Anyone authenticated can read scoring config"
ON scoring_config FOR SELECT
TO authenticated
USING (true);

-- Policy: Only creators and operators can update scoring config
CREATE POLICY "Only creators and operators can update scoring config"
ON scoring_config FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users_table
    WHERE users_table.email = auth.jwt() ->> 'email'
    AND (users_table.role = 'creator' OR users_table.role = 'operator')
  )
);

-- ============================================================
-- 5. Create indexes for better performance (if missing)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contributions_is_edge ON contributions(is_edge);
CREATE INDEX IF NOT EXISTS idx_contributions_is_seed ON contributions(is_seed);
CREATE INDEX IF NOT EXISTS idx_enterprise_contributions_is_edge ON enterprise_contributions(is_edge);
CREATE INDEX IF NOT EXISTS idx_enterprise_contributions_is_seed ON enterprise_contributions(is_seed);

-- ============================================================
-- Success message
-- ============================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '   - is_edge column added to contributions tables';
  RAISE NOTICE '   - scoring_config table created';
  RAISE NOTICE '   - RLS policies configured';
  RAISE NOTICE '   - Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Please redeploy your application or wait for auto-deploy to complete.';
END $$;

