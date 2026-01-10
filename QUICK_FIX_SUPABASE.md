# 🔧 Quick Fix: Supabase Schema Error

## ❌ Error You're Seeing

```
Error: Failed to run sql query: ERROR: 42P01: relation "submissions" does not exist
```

## ✅ Solution

The schema has been updated to **remove foreign key constraints** to external tables (`submissions`, `auth.users`) that may not exist yet.

---

## 🚀 New Setup (Fixed)

### **Step 1: Get Latest Schema**

The schema file has been updated:
- **File**: `supabase/migrations/tsrc_bowtaecore_schema.sql`
- **Status**: ✅ Fixed (no external FK dependencies)

### **Step 2: Copy & Paste into Supabase**

1. Open: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** → **New Query**
4. Copy: The **entire** `supabase/migrations/tsrc_bowtaecore_schema.sql` file
5. Paste: Into SQL Editor
6. Run: Click **"Run"** button

### **Step 3: Verify**

Go to **Table Editor** and confirm these tables exist:

✅ `proposal_envelopes`  
✅ `projected_commands`  
✅ `authorizations`  
✅ `command_counters`  
✅ `leases`  
✅ `policy_versions`  
✅ `execution_audit_log`  

---

## 🔍 What Was Changed

### **Before** (caused error):
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
```

### **After** (fixed):
```sql
user_id UUID, -- No FK constraint
submission_id UUID, -- No FK constraint
```

### **Optional FK Constraints**

If you **already have** `submissions` and `auth.users` tables, you can add FK constraints later:

```sql
-- Run this AFTER the main schema if you have submissions table:
ALTER TABLE proposal_envelopes 
  ADD CONSTRAINT fk_proposal_envelopes_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE proposal_envelopes 
  ADD CONSTRAINT fk_proposal_envelopes_submission_id 
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE;
```

---

## ✅ Why This Works

1. **Standalone Schema**: TSRC tables can now be created independently
2. **No Dependencies**: Doesn't require existing tables
3. **Still Functional**: `user_id` and `submission_id` are still stored as UUIDs
4. **Referential Integrity**: Can be added later with ALTER TABLE

---

## 🧪 Quick Test

After running the fixed schema, test with:

```sql
-- Test 1: Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'proposal_envelopes',
    'projected_commands', 
    'authorizations',
    'command_counters',
    'leases',
    'policy_versions',
    'execution_audit_log'
  )
ORDER BY table_name;
-- Should return 7 rows

-- Test 2: Test counter function
SELECT get_next_command_counter('global', NULL);
-- Should return: 1

-- Test 3: Insert test proposal (should work now!)
INSERT INTO proposal_envelopes (
  proposal_id,
  timestamp,
  intent,
  action_type,
  params,
  run_id,
  inputs_hash,
  provider,
  model,
  temperature,
  prompt_hash,
  score_config_id,
  archive_snapshot_id
)
VALUES (
  gen_random_uuid(),
  NOW(),
  'Test proposal',
  'score_poc_proposal',
  '{"test": true}'::jsonb,
  'test_run_001',
  'test_hash_123',
  'groq',
  'llama-3.3-70b-versatile',
  0.0,
  'prompt_hash_456',
  'v2.0.13',
  'snapshot_test_001'
)
RETURNING proposal_id, intent, action_type;
-- Should return the inserted row
```

---

## 📊 Status

**Issue**: ❌ Foreign key reference to non-existent table  
**Fix**: ✅ Removed FK constraints, made fields standalone  
**Schema**: ✅ Updated and pushed to GitHub  
**Commit**: `b7c025b` (with fix)  

---

## 🎯 Next Steps

1. ✅ **Re-run the schema** (with fixed version)
2. ✅ **Verify 7 tables created**
3. ✅ **Run test queries above**
4. 🔄 **Proceed with Phase 2** implementation

---

## 💡 Pro Tip

If you **do** have existing `submissions` and `auth.users` tables in your database, you can add the foreign key constraints after running the main schema. This is optional and doesn't affect TSRC functionality.

---

**Status**: ✅ **Fixed and Ready**  
**Time to Run**: ⏱️ 1 minute  

*Last Updated: January 10, 2026*

