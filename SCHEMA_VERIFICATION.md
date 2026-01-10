# Schema Verification for Scoring Fixes

**Date**: January 10, 2026  
**Status**: ✅ **NO SCHEMA CHANGES REQUIRED**

---

## Summary

**Good news!** All the scoring fixes we implemented are **fully supported by the existing database schema**. No SQL migrations or schema changes are needed.

---

## Why No Schema Changes Are Needed

### 1. **New Scoring Fields Use Existing JSONB Columns** ✅

The new fields (`score_trace`, `scoring_metadata`, `pod_composition`) are stored in the existing `metadata` JSONB column:

**Schema Definition** (`utils/db/schema.ts` line 28):
```typescript
metadata: jsonb('metadata').$type<{
  coherence?: number;
  density?: number;
  redundancy?: number;
  pod_score?: number;
  novelty?: number;
  alignment?: number;
  qualified_founder?: boolean;
  qualified_epoch?: string | null;
  [key: string]: any; // ← This allows any additional JSON properties!
}>()
```

**Where They're Stored** (`app/api/evaluate/[hash]/route.ts` lines 321-323):
```typescript
metadata: {
  // ... existing fields ...
  score_trace: evaluation.score_trace || null,
  scoring_metadata: evaluation.scoring_metadata || null,
  pod_composition: evaluation.pod_composition || null,
}
```

**Why This Works**: 
- JSONB columns are schemaless and flexible
- The `[key: string]: any` type allows any additional properties
- No ALTER TABLE or migration needed

---

### 2. **Toggle Configuration Already Has Its Own Table** ✅

The toggle states (`seed_enabled`, `edge_enabled`, `overlap_enabled`) are stored in the existing `scoring_config` table:

**Schema Definition** (`utils/db/schema.ts` lines 489-516):
```typescript
export const scoringConfigTable = pgTable('scoring_config', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  config_key: text('config_key').notNull().unique(),
  config_value: jsonb('config_value').notNull().$type<{
    // Mode toggles
    seed_enabled?: boolean;
    edge_enabled?: boolean;
    overlap_enabled?: boolean;
    metal_policy_enabled?: boolean;
    
    // Sweet spot parameters (HHF bridge - tunable, not dogmatic)
    sweet_spot_center?: number;      // Default: 0.142 (14.2%)
    sweet_spot_tolerance?: number;   // Default: 0.05 (±5%)
    penalty_threshold?: number;      // Default: 0.30 (30%)
    
    // Overlap operator declaration
    overlap_operator?: string;       // 'embedding_cosine', 'axis', 'kiss', etc.
    
    [key: string]: any;
  }>(),
  version: text('version').default('v1.0.0'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  updated_by: text('updated_by'),
});
```

**Migration Already Exists**: `supabase/migrations/add_scoring_config.sql`

---

### 3. **New Fields in score_trace Are Inside JSONB** ✅

All the new fields we added to `score_trace` are just additional JSON properties:

**New Fields Added**:
- `seed_detected_by_ai` (boolean)
- `seed_toggle_enabled` (boolean)
- `edge_detected_by_ai` (boolean)
- `edge_toggle_enabled` (boolean)
- `toggles` object with `overlap_on`, `seed_on`, `edge_on`

**Why No Schema Change Needed**: 
These are all stored inside the `metadata.score_trace` JSONB object, which is flexible and accepts any JSON structure.

---

## What You Need to Do in Supabase

### ✅ **NOTHING!**

The existing schema already supports all the changes. However, if you want to **verify** everything is set up correctly, you can run these queries:

### Verification Query 1: Check scoring_config Table Exists

```sql
-- Check if scoring_config table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scoring_config'
);
```

**Expected Result**: `true`

---

### Verification Query 2: Check Default Toggle Configuration

```sql
-- Check current toggle configuration
SELECT config_key, config_value, version, updated_at
FROM scoring_config
WHERE config_key = 'multiplier_toggles';
```

**Expected Result**: Should return a row with:
- `config_key`: `'multiplier_toggles'`
- `config_value`: JSON object with `seed_enabled`, `edge_enabled`, `overlap_enabled`
- `version`: `'v1.0.0'` or similar

**If No Row Exists**, you can insert the default configuration:

```sql
-- Insert default toggle configuration (only if not exists)
INSERT INTO scoring_config (config_key, config_value, version, updated_by)
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
  'v1.0.0',
  'system'
)
ON CONFLICT (config_key) DO NOTHING;
```

---

### Verification Query 3: Check Metadata Contains New Fields

```sql
-- Check if any recent evaluations have the new score_trace fields
SELECT 
  submission_hash,
  title,
  metadata->>'score_trace' IS NOT NULL as has_score_trace,
  metadata->>'scoring_metadata' IS NOT NULL as has_scoring_metadata,
  metadata->>'pod_composition' IS NOT NULL as has_pod_composition,
  created_at
FROM contributions
WHERE updated_at > NOW() - INTERVAL '1 day'
ORDER BY updated_at DESC
LIMIT 5;
```

**Expected Result**: Recent evaluations should show `true` for the new fields.

---

### Verification Query 4: Inspect a Recent score_trace

```sql
-- Look at the structure of a recent score_trace
SELECT 
  submission_hash,
  title,
  metadata->'score_trace'->'toggles' as toggle_states,
  metadata->'score_trace'->>'seed_detected_by_ai' as seed_detected,
  metadata->'score_trace'->>'seed_toggle_enabled' as seed_toggle,
  metadata->'score_trace'->>'seed_multiplier_applied' as seed_applied,
  metadata->'score_trace'->>'final_score' as final_score,
  updated_at
FROM contributions
WHERE metadata->'score_trace' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 1;
```

**Expected Result**: Should show the new fields we added (toggles, seed_detected_by_ai, etc.)

---

## Optional: Index Optimization

If you want to optimize queries on the new fields, you can add indexes:

```sql
-- Optional: Add GIN index on metadata JSONB for faster queries
CREATE INDEX IF NOT EXISTS idx_contributions_metadata_gin 
ON contributions USING GIN (metadata);

-- Optional: Add index on scoring_config config_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_scoring_config_key 
ON scoring_config(config_key);
```

**Note**: These are optional performance optimizations, not required for functionality.

---

## Summary

### ✅ What Already Exists
- `contributions.metadata` JSONB column (stores score_trace, scoring_metadata, pod_composition)
- `scoring_config` table (stores toggle states and parameters)
- Flexible schema with `[key: string]: any` types

### ❌ What You DON'T Need to Do
- No ALTER TABLE statements
- No new columns
- No schema migrations
- No data type changes

### ✅ What You CAN Do (Optional)
- Run verification queries to check everything is working
- Insert default toggle configuration if it doesn't exist
- Add optional indexes for performance

---

## Conclusion

**The existing database schema is perfectly set up to handle all the scoring fixes.** The use of JSONB columns and flexible typing means we can add new fields without any schema changes.

Just run the verification queries above to confirm everything is working, and you're good to go! 🎉

---

**Prepared by**: Senior Research Scientist & Full Stack Engineer  
**Date**: January 10, 2026  
**Status**: ✅ Schema Verified - No Changes Needed



