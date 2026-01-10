# 🚀 Quick Supabase Setup - Copy & Paste

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your **Syntheverse** project
3. Click **SQL Editor** in left sidebar
4. Click **"New Query"** button

---

## Step 2: Copy This Entire SQL Schema

👉 **PRODUCTION FILE**: `supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql`

⚠️ **IMPORTANT**: Use the v2_production file, NOT the original schema file. The v2 version has been fixed to match your existing production database types.

Or click below to expand and copy:

<details>
<summary>📋 Click to expand SQL (700+ lines)</summary>

```sql
-- Copy the entire contents of:
-- supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql
--
-- FIXED FOR PRODUCTION:
-- ✅ user_id changed from UUID to TEXT (matches users_table.id)
-- ✅ submission_id changed to submission_hash TEXT (matches contributions.submission_hash)
-- ✅ RLS policies updated for service role access
-- ✅ Foreign key constraints made optional (add separately if needed)
```

</details>

---

## Step 3: Paste and Run

1. **Paste** the entire schema into SQL Editor
2. Click **"Run"** button (or Cmd/Ctrl + Enter)
3. Wait for success message (~5-10 seconds)

---

## Step 4: Verify Tables Created

Click **Table Editor** in left sidebar. You should see:

✅ `proposal_envelopes` (Layer -1)  
✅ `projected_commands` (Layer 0a)  
✅ `authorizations` (Layer 0b)  
✅ `command_counters` (Anti-replay)  
✅ `leases` (Time-bound)  
✅ `policy_versions` (Monotonic)  
✅ `execution_audit_log` (Layer +1)  

---

## What This Creates

### **7 Tables**
- **Layer -1**: `proposal_envelopes` (untrusted proposals)
- **Layer 0a**: `projected_commands` (deterministic projector)
- **Layer 0b**: `authorizations` (minimal authorizer)
- **Supporting**: `command_counters`, `leases`, `policy_versions`
- **Layer +1**: `execution_audit_log` (fail-closed executor)

### **3 Functions**
- `get_next_command_counter()` - Atomic counter (prevents replay)
- `is_lease_valid()` - Check lease expiration
- `expire_old_leases()` - Batch cleanup

### **3 Views**
- `pipeline_trace` - Complete audit trail
- `active_authorizations` - Valid authorizations
- `veto_log` - Vetoed projections

### **Security**
- ✅ Row Level Security (RLS) on all tables
- ✅ Service role policies for backend
- ✅ User-scoped read policies
- ✅ Unique constraint on counters (anti-replay)

### **Initial Data**
- ✅ Global counter = 0
- ✅ Bootstrap policy v0

---

## Quick Test

Run this in SQL Editor to verify:

```sql
-- Test 1: Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%proposal%' 
    OR table_name LIKE '%authorization%' 
    OR table_name LIKE '%projected%')
ORDER BY table_name;

-- Test 2: Check counter initialized
SELECT * FROM command_counters;

-- Test 3: Test counter function
SELECT get_next_command_counter('global', NULL);
SELECT get_next_command_counter('global', NULL);
SELECT get_next_command_counter('global', NULL);
-- Should return: 1, 2, 3

-- Test 4: Check bootstrap policy
SELECT policy_seq, kman_hash, effective_at 
FROM policy_versions;
```

---

## Troubleshooting

### ❌ **Error: "relation already exists"**
Tables already created! You're good to go.

### ❌ **Error: "permission denied"**
Make sure you're using an admin account.

### ❌ **Error: "syntax error"**
Copy the entire file including the first line.

---

## Next Steps

After schema is set up:

1. ✅ Verify tables in Table Editor
2. ✅ Run quick test queries above
3. 🔄 **Phase 2**: Refactor evaluation to write to `proposal_envelopes`
4. 🔄 **Phase 3**: Build projector to write to `projected_commands`
5. 🔄 **Phase 4**: Build authorizer to write to `authorizations`
6. 🔄 **Phase 5**: Wrap executor with verification

---

## Full Documentation

- **Production Review**: `docs/TSRC_SCHEMA_PRODUCTION_REVIEW.md` ⭐ **READ THIS FIRST**
- **Complete Setup Guide**: `docs/SUPABASE_TSRC_SETUP.md`
- **Production Schema**: `supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql` ✅ **USE THIS**
- **Integration Guide**: `docs/TSRC_BOWTAECORE_INTEGRATION.md`
- **Type Definitions**: `utils/tsrc/types.ts`

---

**Estimated Time**: ⏱️ 2 minutes  
**Difficulty**: 🟢 Easy (just copy & paste!)  

**Status**: ✅ Ready to Use

*Last Updated: January 10, 2026*

