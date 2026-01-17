# Schema Update Analysis: BridgeSpec, n̂, and TO Integration

**Date:** January 2025  
**Status:** ✅ **MINIMAL CHANGES NEEDED**

---

## Executive Summary

**Good news:** The current `jsonb` column for `atomic_score` can accommodate all new fields without a database migration. However, we should:

1. ✅ **Update TypeScript types** in `schema.ts` for type safety
2. ⚠️ **Optional migration** for indexes/constraints on new fields (performance optimization)
3. ✅ **Store BridgeSpec separately** (as JSONB or reference) - RECOMMENDED

---

## Current Schema Status

### ✅ What Works (No Changes Needed)

The `atomic_score` column is already `jsonb`, which means:
- ✅ Can store nested JSON structures (precision, T_B results)
- ✅ Flexible schema (no migration required to add fields)
- ✅ Existing GIN index supports querying new fields

### ⚠️ What Needs Updates

1. **TypeScript Type Definitions** (REQUIRED)
   - Current: Only defines basic trace structure
   - Needed: Extended trace with precision, T_B, bridgespec_hash

2. **BridgeSpec Storage** (RECOMMENDED)
   - Option A: Store in `atomic_score.trace.bridgespec` (inline)
   - Option B: Store in separate table/column (better for querying)
   - Option C: Only store hash, retrieve from external source

3. **Indexes** (OPTIONAL - Performance)
   - Index on `atomic_score->>'trace'->>'bridgespec_hash'` (if querying by BridgeSpec)
   - Index on `atomic_score->>'trace'->>'precision'->>'bubble_class'` (if filtering by tier)
   - Index on `atomic_score->>'trace'->>'precision'->>'n_hat'` (if sorting by precision)

---

## Recommended Schema Updates

### 1. Update TypeScript Types (REQUIRED)

**File:** `utils/db/schema.ts`

**Current type:**
```typescript
atomic_score: jsonb('atomic_score').$type<{
  final: number;
  execution_context: { ... };
  trace: {
    composite: number;
    penalty_percent: number;
    // ... existing fields ...
  };
  integrity_hash: string;
}>(),
```

**Updated type (extends existing):**
```typescript
atomic_score: jsonb('atomic_score').$type<{
  final: number;
  execution_context: { ... };
  trace: {
    composite: number;
    penalty_percent: number;
    // ... existing fields ...
    
    // NEW: Precision/BMP fields
    precision?: {
      n_hat: number;
      bubble_class: string;
      epsilon: number;
      coherence: number;
      c: number;
      penalty_inconsistency: number;
      tier: 'Copper' | 'Silver' | 'Gold' | 'Community';
    };
    
    // NEW: Extended THALET with T-B
    thalet?: {
      T_I?: 'passed' | 'failed' | 'not_checked';
      T_P?: 'passed' | 'failed' | 'not_checked';
      T_N?: 'passed' | 'failed' | 'not_checked';
      T_S?: 'passed' | 'failed' | 'not_checked';
      T_R?: 'passed' | 'failed' | 'not_checked';
      T_C?: 'passed' | 'failed' | 'not_checked';
      T_B?: {
        T_B_01: 'passed' | 'failed' | 'not_checked';
        T_B_02: 'passed' | 'failed' | 'not_checked';
        T_B_03: 'passed' | 'failed' | 'not_checked';
        T_B_04: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
        overall: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
        testabilityScore: number;
        degeneracyPenalty: number;
      };
      overall?: 'passed' | 'failed' | 'soft_failed' | 'not_checked';
    };
    
    // NEW: BridgeSpec hash pointer
    bridgespec_hash?: string;
  };
  integrity_hash: string;
}>(),
```

**Impact:** TypeScript only - no database migration needed

---

### 2. BridgeSpec Storage (RECOMMENDED)

**Option A: Inline in atomic_score.trace (Simplest)**
- Store BridgeSpec JSON in `atomic_score.trace.bridgespec`
- Pros: Self-contained, no additional queries
- Cons: Larger JSON, harder to query BridgeSpec separately

**Option B: Separate Column (Recommended)**
- Add `bridge_spec jsonb` column to contributions table
- Store BridgeSpec separately, reference hash in trace
- Pros: Queryable, indexable, cleaner separation
- Cons: Requires migration

**Option C: External Storage (Advanced)**
- Store BridgeSpec in separate table or file storage
- Only store hash in atomic_score.trace
- Pros: Scalable, can version BridgeSpec separately
- Cons: More complex, requires additional queries

**Recommendation:** **Option B** (separate column) for better queryability

---

### 3. Optional Migration (Performance)

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_bridge_spec_fields.sql`

```sql
-- Add bridge_spec column to contributions table
ALTER TABLE contributions
ADD COLUMN IF NOT EXISTS bridge_spec JSONB;

-- Create GIN index on bridge_spec for querying
CREATE INDEX IF NOT EXISTS idx_contributions_bridge_spec 
ON contributions USING gin(bridge_spec);

-- Create index on bridgespec_hash in atomic_score.trace (if stored inline)
CREATE INDEX IF NOT EXISTS idx_contributions_bridgespec_hash
ON contributions ((atomic_score->'trace'->>'bridgespec_hash'));

-- Create index on bubble_class for tier filtering
CREATE INDEX IF NOT EXISTS idx_contributions_bubble_class
ON contributions ((atomic_score->'trace'->'precision'->>'bubble_class'));

-- Create index on n_hat for precision sorting
CREATE INDEX IF NOT EXISTS idx_contributions_n_hat
ON contributions (((atomic_score->'trace'->'precision'->>'n_hat')::numeric) DESC NULLS LAST);

-- Add comment
COMMENT ON COLUMN contributions.bridge_spec IS 
'BridgeSpec (TO/Objective Theory) artifact for PoC submission. Required for official status. Contains bridges from Chamber A (meaning) to Chamber B (testability).';
```

**Impact:** Performance optimization - optional but recommended

---

## Decision Matrix

| Change | Required? | Impact | Effort |
|--------|-----------|--------|--------|
| **Update TypeScript types** | ✅ YES | Type safety | Low (5 min) |
| **Add bridge_spec column** | ⚠️ RECOMMENDED | Queryability | Medium (15 min + migration) |
| **Add indexes** | ⚠️ OPTIONAL | Performance | Low (migration only) |
| **Database migration** | ❌ NO (for basic) | None | N/A |
| **Update constraints** | ❌ NO | None | N/A |

---

## Recommended Action Plan

### Phase 1: TypeScript Update (Immediate)

1. ✅ Update `utils/db/schema.ts` types to include extended trace structure
2. ✅ Use `ExtendedAtomicScore` type from `types/atomic-score-extended.ts`

### Phase 2: BridgeSpec Storage (Sprint 1)

1. ⏳ Create migration to add `bridge_spec jsonb` column
2. ⏳ Create GIN index on `bridge_spec`
3. ⏳ Update insert/update queries to store BridgeSpec

### Phase 3: Performance Indexes (Sprint 1-2)

1. ⏳ Add indexes on `bridgespec_hash`, `bubble_class`, `n_hat`
2. ⏳ Test query performance

---

## Conclusion

**Minimum required:** Update TypeScript types (no database migration needed)

**Recommended:** Add `bridge_spec` column + indexes for better queryability and performance

**The jsonb column can handle everything, but proper schema design improves maintainability.**


