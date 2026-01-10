# TSRC Schema Production Integration Review

## Executive Summary

**Reviewer**: Senior Database & Full-Stack Engineer  
**Date**: January 10, 2026  
**Status**: ⚠️ **REQUIRES MODIFICATIONS BEFORE PRODUCTION DEPLOYMENT**

---

## Critical Issues Found

### 🔴 **CRITICAL: Type Mismatch with Existing Schema**

#### **Issue 1: User ID Type Mismatch**
```sql
-- TSRC Schema (NEW)
user_id UUID

-- Existing Production Schema
users_table.id TEXT
```

**Impact**: Cannot create foreign key constraint. Application queries will fail.

**Fix Required**: Change `user_id UUID` to `user_id TEXT`

---

#### **Issue 2: Submission ID Type Mismatch**
```sql
-- TSRC Schema (NEW)
submission_id UUID

-- Existing Production Schema
contributions.submission_hash TEXT (primary key)
```

**Impact**: Cannot create foreign key constraint. Lookups will fail.

**Fix Required**: Change `submission_id UUID` to `submission_id TEXT` and rename to `submission_hash` for consistency

---

### 🟡 **MEDIUM: Naming Convention Inconsistency**

#### **Issue 3: Table Name Confusion**
- TSRC schema references `submissions` table
- Production uses `contributions` table (with `submission_hash` as PK)

**Recommendation**: 
- Update TSRC schema to reference `contributions` table
- Or create a view: `CREATE VIEW submissions AS SELECT * FROM contributions;`

---

### 🟡 **MEDIUM: Auth Integration**

#### **Issue 4: Auth Schema Reference**
```sql
-- TSRC Schema assumes Supabase Auth
user_id UUID -- References auth.users(id)

-- Production uses custom users table
users_table (id TEXT, email TEXT, name TEXT, plan TEXT, stripe_id TEXT)
```

**Impact**: RLS policies referencing `auth.uid()` will not work as expected.

**Fix Required**:
- Remove `auth.uid()` references in RLS policies
- Use `users_table` instead of `auth.users`
- Or integrate with Supabase Auth properly

---

## Recommended Schema Modifications

### **Modified TSRC Schema (Production-Ready)**

```sql
-- ============================================================================
-- LAYER -1: PROPOSAL ENVELOPES (Modified for Production)
-- ============================================================================

CREATE TABLE IF NOT EXISTS proposal_envelopes (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core fields
  proposal_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  intent TEXT NOT NULL,
  action_type TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}',
  
  -- Trace
  run_id TEXT NOT NULL,
  inputs_hash TEXT NOT NULL, -- SHA-256 hex
  
  -- Determinism contract
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  temperature NUMERIC(5,3) NOT NULL,
  prompt_hash TEXT NOT NULL,
  content_hash TEXT,
  seed INTEGER,
  score_config_id TEXT NOT NULL,
  archive_snapshot_id TEXT NOT NULL,
  mode_state TEXT,
  
  -- Score toggles
  seed_on BOOLEAN DEFAULT FALSE,
  edge_on BOOLEAN DEFAULT FALSE,
  overlap_on BOOLEAN DEFAULT FALSE,
  
  -- Metadata (MODIFIED TYPES)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT, -- Changed from UUID to TEXT to match users_table.id
  submission_hash TEXT, -- Changed from submission_id UUID, renamed to match contributions table
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  
  CONSTRAINT proposal_envelopes_action_type_check 
    CHECK (action_type IN ('score_poc_proposal', 'create_payment_session', 'register_blockchain', 'update_snapshot', 'other'))
);

-- Indexes
CREATE INDEX idx_proposal_envelopes_proposal_id ON proposal_envelopes(proposal_id);
CREATE INDEX idx_proposal_envelopes_timestamp ON proposal_envelopes(timestamp DESC);
CREATE INDEX idx_proposal_envelopes_action_type ON proposal_envelopes(action_type);
CREATE INDEX idx_proposal_envelopes_status ON proposal_envelopes(status);
CREATE INDEX idx_proposal_envelopes_user_id ON proposal_envelopes(user_id);
CREATE INDEX idx_proposal_envelopes_submission_hash ON proposal_envelopes(submission_hash);
CREATE INDEX idx_proposal_envelopes_inputs_hash ON proposal_envelopes(inputs_hash);

-- Foreign key constraints (add ONLY if tables exist)
-- Run these separately after verifying tables exist:

-- ALTER TABLE proposal_envelopes 
--   ADD CONSTRAINT fk_proposal_envelopes_user_id 
--   FOREIGN KEY (user_id) REFERENCES users_table(id) ON DELETE SET NULL;

-- ALTER TABLE proposal_envelopes 
--   ADD CONSTRAINT fk_proposal_envelopes_submission_hash 
--   FOREIGN KEY (submission_hash) REFERENCES contributions(submission_hash) ON DELETE CASCADE;
```

---

## Database Best Practices Analysis

### ✅ **What's Good**

#### **1. Indexing Strategy**
```sql
-- Excellent index coverage
CREATE INDEX idx_proposal_envelopes_timestamp ON proposal_envelopes(timestamp DESC);
CREATE INDEX idx_proposal_envelopes_status ON proposal_envelopes(status);
CREATE INDEX idx_proposal_envelopes_user_id ON proposal_envelopes(user_id);
```

**✅ Follows best practices**:
- Indexed foreign keys (user_id, submission_hash)
- Indexed frequently queried columns (status, timestamp)
- DESC order on timestamp for recent-first queries
- Unique index on natural key (proposal_id)

---

#### **2. Data Types**
```sql
-- Appropriate types chosen
proposal_id UUID                    -- Good: Universally unique
timestamp TIMESTAMPTZ               -- Good: Timezone-aware
temperature NUMERIC(5,3)            -- Good: Precise decimal
params JSONB                        -- Good: Structured, indexable
```

**✅ Best practices**:
- TIMESTAMPTZ for timezone awareness
- JSONB for structured data (indexable, efficient)
- NUMERIC for financial/scientific precision
- UUID for distributed ID generation

---

#### **3. Constraints**
```sql
-- Good constraint coverage
CONSTRAINT proposal_envelopes_action_type_check 
  CHECK (action_type IN ('score_poc_proposal', ...))

CONSTRAINT projected_commands_risk_tier_check 
  CHECK (risk_tier IN (0, 1, 2, 3))

UNIQUE INDEX idx_authorizations_cmd_counter ON authorizations(cmd_counter)
```

**✅ Best practices**:
- CHECK constraints for enum-like values
- UNIQUE constraint on anti-replay counter
- NOT NULL on required fields
- Default values where appropriate

---

#### **4. Cascade Rules**
```sql
-- Proper cascade handling
proposal_id UUID NOT NULL REFERENCES proposal_envelopes(proposal_id) ON DELETE CASCADE
projection_id UUID NOT NULL REFERENCES projected_commands(projection_id) ON DELETE CASCADE
```

**✅ Best practices**:
- CASCADE for dependent data (projections, authorizations)
- SET NULL for optional references (user_id)
- Maintains referential integrity

---

#### **5. Functions & Triggers**
```sql
-- Atomic counter increment
CREATE OR REPLACE FUNCTION get_next_command_counter(...) 
RETURNS BIGINT AS $$ ... $$ LANGUAGE plpgsql;

-- Status synchronization
CREATE TRIGGER trigger_sync_authorization_status
AFTER UPDATE ON authorizations ...
```

**✅ Best practices**:
- Atomic operations for counters
- Triggers for automatic status updates
- Idempotent functions (CREATE OR REPLACE)

---

### ⚠️ **Potential Issues & Recommendations**

#### **1. BIGSERIAL vs UUID for Primary Keys**

**Current**:
```sql
CREATE TABLE proposal_envelopes (
  id BIGSERIAL PRIMARY KEY,          -- Sequential integer
  proposal_id UUID UNIQUE NOT NULL,  -- Natural UUID key
  ...
);
```

**Concern**: Using both surrogate key (BIGSERIAL) and natural key (UUID)

**Recommendation**:
```sql
-- Option A: Use UUID as primary key (better for distributed systems)
CREATE TABLE proposal_envelopes (
  proposal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- Option B: Keep BIGSERIAL, but ensure proposal_id is always indexed
-- (current approach is fine for centralized DB)
```

**Decision**: ✅ **Current approach is acceptable** for production  
- BIGSERIAL provides fast lookups for internal joins
- UUID provides global uniqueness for external references
- Both have their place in a hybrid approach

---

#### **2. Index Bloat Over Time**

**Current**: 7+ indexes per table

**Concern**: High write overhead, index bloat over time

**Recommendations**:
- **Monitor index usage**: `SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';`
- **Periodic maintenance**: `REINDEX TABLE proposal_envelopes;`
- **Vacuum regularly**: `VACUUM ANALYZE proposal_envelopes;`

**Mitigation Strategy**:
```sql
-- Add to cron or Supabase Edge Function (weekly)
REINDEX TABLE CONCURRENTLY proposal_envelopes;
REINDEX TABLE CONCURRENTLY projected_commands;
REINDEX TABLE CONCURRENTLY authorizations;

-- Daily vacuum
VACUUM ANALYZE;
```

---

#### **3. JSONB Performance**

**Current**: Using JSONB for `params`, `execution_result`, etc.

**Concern**: Large JSONB columns can slow queries

**Recommendations**:
- **Add GIN indexes for frequent JSONB queries**:
  ```sql
  CREATE INDEX idx_proposal_envelopes_params_gin 
    ON proposal_envelopes USING GIN (params);
  ```
- **Set storage to EXTERNAL** for large JSONB:
  ```sql
  ALTER TABLE execution_audit_log 
    ALTER COLUMN result SET STORAGE EXTERNAL;
  ```

---

#### **4. Counter Management**

**Current**: Global counter with atomic increment

**Concern**: Potential bottleneck at high scale

**Current Implementation**:
```sql
CREATE OR REPLACE FUNCTION get_next_command_counter(
  p_scope TEXT DEFAULT 'global',
  p_scope_key TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_counter BIGINT;
BEGIN
  INSERT INTO command_counters (counter_scope, scope_key, current_counter, ...)
  VALUES (p_scope, p_scope_key, 1, ...)
  ON CONFLICT (counter_scope, scope_key)
  DO UPDATE SET 
    current_counter = command_counters.current_counter + 1,
    ...
  RETURNING current_counter INTO v_counter;
  
  RETURN v_counter;
END;
$$ LANGUAGE plpgsql;
```

**✅ Good**: Uses ON CONFLICT for atomicity

**⚠️ Recommendation**: Add scoped counters for parallelization
```sql
-- Use per-action-type counters to reduce contention
SELECT get_next_command_counter('per_action_type', 'score_poc_proposal');
```

**Implementation**: ✅ **Already supports scoped counters** via parameters

---

#### **5. Lease Management**

**Current**: Time-based lease expiry with manual cleanup

**Concern**: Requires periodic maintenance

**Recommendation**: Add automatic expiry via trigger
```sql
-- Option A: Use a CHECK constraint (enforced at read time)
ALTER TABLE authorizations 
  ADD CONSTRAINT check_not_expired 
  CHECK (status != 'pending' OR expires_at > NOW());

-- Option B: Use pg_cron for automatic cleanup (better)
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup every 5 minutes
SELECT cron.schedule(
  'expire-old-leases',
  '*/5 * * * *',
  'SELECT expire_old_leases();'
);
```

---

#### **6. Row Level Security (RLS)**

**Current**: RLS policies reference `auth.uid()` and `auth.role()`

**Issue**: Production uses `users_table`, not Supabase Auth

**Recommendations**:

**Option A: Integrate with Supabase Auth**
```sql
-- Enable Supabase Auth and link to users_table
-- Then keep current RLS policies
```

**Option B: Use Custom RLS with users_table**
```sql
-- Create a function to get current user
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
CREATE POLICY "Users can read their own proposals"
ON proposal_envelopes FOR SELECT
USING (user_id = get_current_user_id() OR has_service_role());

-- Set user context in application
-- In your API routes:
SET LOCAL app.current_user_id = 'user_123';
```

**Option C: Service Role Only (Simplest)**
```sql
-- Remove user-scoped policies entirely
-- Only allow service role access (backend operations)
CREATE POLICY "Service role full access"
ON proposal_envelopes FOR ALL
USING (has_service_role());
```

**Recommendation**: ✅ **Option C for MVP** (simplest, most secure for backend-only access)

---

## Migration Strategy

### **Phase 1: Fix Type Mismatches** (CRITICAL)

**File**: `supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql`

Changes needed:
1. Change `user_id UUID` → `user_id TEXT`
2. Change `submission_id UUID` → `submission_hash TEXT`
3. Update all references throughout schema
4. Update RLS policies to use service role only

---

### **Phase 2: Add Foreign Keys** (After Phase 1)

```sql
-- Run AFTER verifying existing tables
ALTER TABLE proposal_envelopes 
  ADD CONSTRAINT fk_proposal_envelopes_user_id 
  FOREIGN KEY (user_id) REFERENCES users_table(id) ON DELETE SET NULL;

ALTER TABLE proposal_envelopes 
  ADD CONSTRAINT fk_proposal_envelopes_submission_hash 
  FOREIGN KEY (submission_hash) REFERENCES contributions(submission_hash) ON DELETE CASCADE;
```

---

### **Phase 3: Add Maintenance Jobs** (Optional)

```sql
-- Option 1: Supabase Edge Function (cron)
-- Create edge function to run every 5 minutes

-- Option 2: pg_cron (if available)
SELECT cron.schedule('expire-leases', '*/5 * * * *', 'SELECT expire_old_leases();');
SELECT cron.schedule('vacuum-daily', '0 2 * * *', 'VACUUM ANALYZE;');
```

---

### **Phase 4: Monitoring & Observability**

```sql
-- Create monitoring views
CREATE OR REPLACE VIEW tsrc_health_check AS
SELECT 
  'proposal_envelopes' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'executed') AS executed,
  COUNT(*) FILTER (WHERE status = 'vetoed') AS vetoed,
  MAX(created_at) AS last_activity
FROM proposal_envelopes
UNION ALL
SELECT 
  'authorizations' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'executed') AS executed,
  COUNT(*) FILTER (WHERE status = 'expired') AS expired,
  MAX(issued_at) AS last_activity
FROM authorizations;

-- Query this view to monitor system health
SELECT * FROM tsrc_health_check;
```

---

## Performance Considerations

### **Write Performance**

**Estimated throughput** (based on schema):
- **Proposals**: 1,000-5,000 inserts/second (single node)
- **Bottleneck**: Global counter increment (~10,000 ops/sec max)

**Optimization**:
- Use per-action-type counters for parallelization
- Consider counter batching for ultra-high throughput

---

### **Read Performance**

**Query patterns**:
- Recent proposals: `WHERE timestamp > NOW() - INTERVAL '24 hours'`  
  ✅ **Efficient**: Uses `idx_proposal_envelopes_timestamp`
  
- User's proposals: `WHERE user_id = 'user_123'`  
  ✅ **Efficient**: Uses `idx_proposal_envelopes_user_id`
  
- Pipeline trace: Uses `pipeline_trace` view with JOINs  
  ⚠️ **Potentially slow**: 4-way JOIN (proposal → projection → authorization → execution)

**Optimization**:
```sql
-- Add materialized view for complex queries
CREATE MATERIALIZED VIEW recent_pipeline_trace AS
SELECT * FROM pipeline_trace
WHERE proposal_timestamp > NOW() - INTERVAL '7 days';

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY recent_pipeline_trace;
```

---

### **Storage Growth**

**Estimated storage** (per 1M proposals):
- `proposal_envelopes`: ~500 MB
- `projected_commands`: ~300 MB
- `authorizations`: ~400 MB
- `execution_audit_log`: ~600 MB
- **Total**: ~1.8 GB per 1M proposals

**Archival strategy**:
```sql
-- Archive old proposals (>90 days)
CREATE TABLE proposal_envelopes_archive (LIKE proposal_envelopes INCLUDING ALL);

-- Move old data
INSERT INTO proposal_envelopes_archive
SELECT * FROM proposal_envelopes
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('executed', 'vetoed');

-- Delete from active table
DELETE FROM proposal_envelopes
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('executed', 'vetoed');
```

---

## Security Review

### ✅ **Strong Security Properties**

1. **Anti-Replay**: ✅ UNIQUE constraint on `cmd_counter`
2. **Time-Bound**: ✅ Lease expiry with `expires_at`
3. **Fail-Closed**: ✅ Must verify before execution
4. **Audit Trail**: ✅ Complete pipeline trace
5. **RLS**: ✅ Row-level security enabled

---

### ⚠️ **Security Recommendations**

#### **1. Signature Verification**

**Current**: Stores signature, but no verification function

**Add**:
```sql
CREATE OR REPLACE FUNCTION verify_authorization_signature(
  p_command_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_auth authorizations;
  v_payload TEXT;
  v_expected_sig TEXT;
BEGIN
  SELECT * INTO v_auth FROM authorizations WHERE command_id = p_command_id;
  
  -- Reconstruct canonical payload (JCS RFC8785)
  v_payload := jsonb_build_object(
    'command_id', v_auth.command_id,
    'projection_id', v_auth.projection_id,
    'cmd_counter', v_auth.cmd_counter,
    'action_type', v_auth.action_type,
    'params', v_auth.params
  )::text;
  
  -- Verify HMAC-SHA256 (simplified, use pgcrypto extension)
  v_expected_sig := encode(
    hmac(v_payload, current_setting('app.hmac_secret'), 'sha256'),
    'base64'
  );
  
  RETURN v_expected_sig = v_auth.sig_b64;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### **2. Policy Version Validation**

**Add CHECK to prevent policy rollback**:
```sql
ALTER TABLE policy_versions
  ADD CONSTRAINT policy_seq_increasing
  CHECK (
    policy_seq > COALESCE(
      (SELECT MAX(policy_seq) FROM policy_versions WHERE id != NEW.id),
      -1
    )
  );
```

---

#### **3. Input Sanitization**

**Current**: No input validation on TEXT fields

**Add CHECK constraints**:
```sql
-- Prevent SQL injection in text fields
ALTER TABLE proposal_envelopes
  ADD CONSTRAINT check_action_type_safe
  CHECK (action_type ~ '^[a-z_]+$');

ALTER TABLE proposal_envelopes
  ADD CONSTRAINT check_hash_format
  CHECK (inputs_hash ~ '^[a-9a-f]{64}$'); -- SHA-256 hex
```

---

## Rollback Plan

### **If Issues Occur Post-Deployment**

```sql
-- Step 1: Disable new writes (emergency brake)
CREATE OR REPLACE FUNCTION reject_tsrc_writes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'TSRC writes temporarily disabled for maintenance';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER emergency_brake_proposals
BEFORE INSERT ON proposal_envelopes
FOR EACH ROW EXECUTE FUNCTION reject_tsrc_writes();

-- Step 2: Export data
COPY proposal_envelopes TO '/tmp/proposal_backup.csv' CSV HEADER;

-- Step 3: Drop tables (if needed)
DROP TABLE IF EXISTS execution_audit_log CASCADE;
DROP TABLE IF EXISTS authorizations CASCADE;
DROP TABLE IF EXISTS projected_commands CASCADE;
DROP TABLE IF EXISTS proposal_envelopes CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS command_counters CASCADE;
DROP TABLE IF EXISTS policy_versions CASCADE;

-- Step 4: Remove triggers
DROP TRIGGER IF EXISTS emergency_brake_proposals ON proposal_envelopes;
DROP FUNCTION IF EXISTS reject_tsrc_writes();
```

---

## Final Recommendations

### **Before Production Deployment**

#### **CRITICAL (Must Fix)**:
1. ✅ Change `user_id UUID` → `user_id TEXT`
2. ✅ Change `submission_id UUID` → `submission_hash TEXT`
3. ✅ Update RLS policies (remove auth.uid() references)
4. ✅ Test foreign key constraints with existing data

#### **HIGH PRIORITY**:
1. ⚠️ Add signature verification function
2. ⚠️ Set up lease expiry cron job
3. ⚠️ Create health check monitoring view
4. ⚠️ Document rollback procedure

#### **MEDIUM PRIORITY**:
1. 🟡 Add GIN indexes for JSONB queries
2. 🟡 Set up archival strategy (>90 days)
3. 🟡 Create materialized views for complex queries
4. 🟡 Add input sanitization CHECK constraints

#### **LOW PRIORITY (Post-MVP)**:
1. 🟢 Implement counter batching for high throughput
2. 🟢 Add pg_cron for automated maintenance
3. 🟢 Create dashboard for TSRC metrics
4. 🟢 Optimize pipeline_trace view performance

---

## Deployment Checklist

```bash
# Pre-Deployment
□ Review this document with team
□ Create fixed schema file (v2_production.sql)
□ Test schema on staging database
□ Verify foreign key constraints work with existing data
□ Load test counter function (10k+ ops)
□ Document rollback procedure

# Deployment
□ Backup existing database
□ Run schema in transaction block
□ Verify all 7 tables created
□ Test counter function
□ Test RLS policies
□ Run health check query
□ Monitor logs for errors

# Post-Deployment
□ Set up lease expiry cron job
□ Create monitoring dashboard
□ Document maintenance procedures
□ Schedule weekly REINDEX
□ Schedule daily VACUUM ANALYZE
```

---

## Conclusion

**Overall Assessment**: 🟡 **GOOD FOUNDATION, NEEDS TYPE FIXES**

**Strengths**:
- ✅ Excellent architecture (4-layer gate model)
- ✅ Strong indexing strategy
- ✅ Proper constraints and validation
- ✅ Atomic counter management
- ✅ Complete audit trail

**Critical Fixes Needed**:
- 🔴 Type mismatches (UUID → TEXT)
- 🔴 Table name references (submissions → contributions)
- 🔴 Auth integration (auth.uid() → service role)

**Recommendation**: ✅ **FIX CRITICAL ISSUES, THEN DEPLOY**

With the identified fixes, this schema is production-ready and follows database best practices for a fail-closed, auditable authorization system.

---

**Reviewed By**: Senior Database Engineer  
**Status**: ⚠️ Pending fixes (Type mismatches)  
**Estimated Fix Time**: 30 minutes  
**Ready for Production**: After fixes applied  

*Last Updated: January 10, 2026*

