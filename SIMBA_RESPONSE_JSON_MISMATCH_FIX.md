# Response to Simba: JSON Mismatch Root Cause Resolution

**Date:** January 13, 2026  
**Issue:** Zero-Delta / Split-Brain Breach - UI displaying 0 while JSON has 8600  
**Exam ID:** bc460b3b446cb9bb9b5b4fa3500937940bed28c81e8b80421f31914b6b658d73  
**Status:** ✅ **ROOT CAUSE IDENTIFIED AND FIXED**

---

## Executive Summary

The split-brain issue has been **resolved at the root cause**. The problem was in the UI's score extraction logic which:
1. Only checked `metadata.atomic_score` but not the top-level `atomic_score` field
2. Silently fell back to `0` when validation failed instead of failing-hard
3. Did not enforce Zero-Delta mismatch detection
4. Allowed epoch qualification based on status flags instead of `atomic_score.final`

All fixes have been deployed to ensure **atomic_score.final is the single sovereign source of truth** with fail-hard enforcement.

---

## Root Cause Analysis

### The Problem

The archive endpoint (`/api/archive/contributions/[hash]`) returns `atomic_score` at **both**:
- Top level: `submission.atomic_score`
- Nested in metadata: `submission.metadata.atomic_score`

However, the UI polling logic in `SubmitContributionForm.tsx` was only checking `metadata.atomic_score`. If validation failed (due to integrity hash mismatch, missing fields, or structural issues), it would silently catch the error and default `pocScore = 0`, creating the split-brain breach.

### Why This Happened

When toggles were added mid-stream to disable UI bonuses, the validation path was not updated to handle both data locations. Additionally, the fail-hard enforcement was missing, allowing silent fallbacks that masked the real issue.

---

## Fixes Applied

### ✅ Fix #1: UI Always Displays `atomic_score.final`

**File:** `components/SubmitContributionForm.tsx` (Lines 140-220)

**Changes:**
- Now checks **both** `submission.atomic_score` AND `submission.metadata.atomic_score`
- Score display **always** uses `atomic_score.final` when present
- No fallbacks, no parallel "poc_score" source when atomic exists
- Added trace header showing `atomic_score.final` with integrity hash for audit

**Code:**
```typescript
// SOVEREIGN SOURCE: atomic_score.final is the ONLY source of truth
const atomicScore = submission.atomic_score || metadata.atomic_score;
if (atomicScore) {
  pocScore = IntegrityValidator.getValidatedScore(atomicScore);
  // Always use atomic_score.final for display
}
```

### ✅ Fix #2: Mismatch Detection with Fail-Hard Enforcement

**File:** `components/SubmitContributionForm.tsx` (Lines 170-185)

**Changes:**
- **Zero-Delta Check:** Verifies `metadata.pod_score === atomic_score.final`
- **Mismatch Detection:** If UI score ≠ atomic_score.final, triggers fail-hard state
- **Visual Blocking:** Red FAIL state displayed with detailed error message
- **Registration Blocked:** `handleRegisterQualifiedPoC` now checks for mismatch and blocks registration

**Implementation:**
```typescript
// ZERO-DELTA CHECK: Verify pod_score matches atomic_score.final
const metadataPodScore = metadata.pod_score ?? submission.pod_score ?? null;
if (metadataPodScore !== null && Math.abs(metadataPodScore - pocScore) > 0.01) {
  scoreMismatch = true;
  mismatchDetails = `Split-brain breach detected: UI pod_score (${metadataPodScore}) ≠ atomic_score.final (${pocScore}). This violates Zero-Delta protocol.`;
  // Registration is BLOCKED
}
```

### ✅ Fix #3: Epoch Qualification Derived from `atomic_score.final` Only

**File:** `components/SubmitContributionForm.tsx` (Lines 857-947)

**Changes:**
- Qualification logic now checks `atomic_score.final >= 8000`
- If status shows "qualified" but `atomic_score.final < 8000`, displays error and blocks registration
- **Never** shows "Founder with score 0" if atomic final is 8600
- Qualification display shows `atomic_score.final` in parentheses, not metadata.pod_score

**Code:**
```typescript
const atomicFinal = evaluationStatus.evaluation?.atomic_score?.final;
const qualifiesByAtomicScore = atomicFinal !== undefined && atomicFinal >= 8000;

// If qualified status doesn't match atomic_score.final, show error
if (!qualifiesByAtomicScore && atomicFinal !== undefined) {
  // Display error: "Qualification Mismatch Detected"
  // Registration BLOCKED
}
```

### ✅ Fix #4: Download JSON Button Added

**File:** `components/SubmitContributionForm.tsx` (Lines 681-705)

**Changes:**
- Added "💾 Download JSON" button next to "📊 View JSON"
- Downloads raw backend payload as `application/json` file
- File name includes submission hash for audit traceability
- Prevents copy/paste corruption (escaping/whitespace/encoding issues)

**Implementation:**
```typescript
<button onClick={async () => {
  const response = await fetch(`/api/archive/contributions/${submissionHash}`);
  const data = await response.json();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  // Download as syntheverse-evaluation-{hash}.json
}}>
  💾 Download JSON
</button>
```

### ✅ Fix #5: Archive Snapshot + Item Count Display

**File:** `components/SubmitContributionForm.tsx` (Lines 949-976)

**Changes:**
- Displays `archive_snapshot.item_count` from TSRC metadata
- Shows explicit message when `item_count === 0`: "Empty Archive: No redundancy detected yet. This is normal for early submissions."
- Displays snapshot ID for audit traceability
- Clear framing: "empty archive / not meaningful yet" instead of reading like a subsystem pass

**Display:**
```
Archive Snapshot (TSRC)
Item Count: 0

⚠️ Empty Archive: No redundancy detected yet. This is normal for early submissions. 
The archive will populate as more contributions are evaluated.
```

---

## Additional Fixes Applied

### ✅ FrontierModule & PoCArchive Components

Updated both components to check **both** top-level and metadata `atomic_score`:
- `components/FrontierModule.tsx` (Line 829)
- `components/PoCArchive.tsx` (Line 1120)

**Before:**
```typescript
if (selectedSubmission.metadata?.atomic_score) {
  return IntegrityValidator.getValidatedScore(selectedSubmission.metadata.atomic_score);
}
```

**After:**
```typescript
const atomicScore = selectedSubmission.atomic_score || selectedSubmission.metadata?.atomic_score;
if (atomicScore) {
  return IntegrityValidator.getValidatedScore(atomicScore);
}
```

---

## Verification Steps

1. **Test with Exam ID:** `bc460b3b446cb9bb9b5b4fa3500937940bed28c81e8b80421f31914b6b658d73`
   - UI should display **8600** (not 0)
   - Trace header should show "Final Score (clamped): 8600"
   - Integrity hash should be visible

2. **Mismatch Detection Test:**
   - If `pod_score !== atomic_score.final`, red FAIL state appears
   - Registration button is disabled
   - Error message explains the violation

3. **Empty Archive Test:**
   - When `item_count === 0`, displays explicit "Empty Archive" message
   - Not framed as a pass/fail, but as informational

4. **Download JSON Test:**
   - Click "Download JSON" button
   - File downloads as `application/json`
   - Contains raw backend payload with `atomic_score.final = 8600`

---

## Protocol Compliance

✅ **Zero-Delta Invariant:** Enforced - UI score MUST equal atomic_score.final  
✅ **Fail-Hard Enforcement:** Implemented - Mismatches block registration  
✅ **Single Source of Truth:** atomic_score.final is sovereign  
✅ **Epoch Qualification:** Derived from atomic_score.final only  
✅ **Audit Trail:** Download JSON button provides stable artifact for audit packets (Pablo/Lexary)

---

## Next Steps

Once this fix is verified:
1. **Rerun Test 2** (all 6 tests) with the fixed UI
2. **If all green:** Flip next switch and begin RunT3
3. **Monitor:** All future evaluations should show atomic_score.final in UI (no more 0 scores)

---

## Files Modified

1. `components/SubmitContributionForm.tsx` - Primary fixes
2. `components/FrontierModule.tsx` - atomic_score location fix
3. `components/PoCArchive.tsx` - atomic_score location fix

---

**Status:** ✅ **READY FOR TESTING**

The root cause has been fixed. UI now enforces Zero-Delta protocol with fail-hard mismatch detection. All score displays use `atomic_score.final` as the single sovereign source of truth.


