# Copy-Paste SQL for Supabase

**Quick Answer**: ✅ **NO SCHEMA CHANGES NEEDED!**

All the scoring fixes use existing JSONB columns. Just run these verification queries.

---

## Step 1: Verify scoring_config Table Exists

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scoring_config'
) as scoring_config_exists;
```

**Expected**: Returns `true`

---

## Step 2: Check/Insert Default Toggle Configuration

```sql
-- Check if configuration exists
SELECT config_key, config_value 
FROM scoring_config 
WHERE config_key = 'multiplier_toggles';

-- If no rows returned, run this to insert defaults:
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
  updated_at = NOW();
```

---

## Step 3: Verify Recent Evaluations Have New Fields

```sql
SELECT 
  submission_hash,
  title,
  metadata->>'score_trace' IS NOT NULL as has_score_trace,
  metadata->'score_trace'->'toggles' as toggle_states,
  metadata->'score_trace'->>'final_score' as final_score,
  updated_at
FROM contributions
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC
LIMIT 5;
```

**Expected**: Recent evaluations show `has_score_trace = true` and toggle states visible

---

## Step 4: Optional Performance Indexes

```sql
-- Optional: Add GIN index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_contributions_metadata_gin 
ON contributions USING GIN (metadata);

-- Optional: Index on updated_at for faster recent queries
CREATE INDEX IF NOT EXISTS idx_contributions_updated_at 
ON contributions(updated_at DESC);
```

---

## That's It!

✅ No ALTER TABLE statements needed  
✅ No new columns needed  
✅ No schema migrations needed  

The existing JSONB columns handle everything. Just verify with the queries above.

---

**For complete verification queries**, see: `SUPABASE_VERIFICATION_QUERIES.sql`  
**For detailed explanation**, see: `SCHEMA_VERIFICATION.md`



