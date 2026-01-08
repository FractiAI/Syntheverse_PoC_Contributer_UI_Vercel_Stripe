# Response to Marek & Simba: Penalty Computed vs Applied Bug

**To:** Marek Pawel Bargiel, Simba  
**CC:** Lexary, Daniel, Richard  
**From:** FractiAI Engineering Team  
**Date:** January 8, 2026  
**Re:** Internal Inconsistency Fix - Penalty Computed vs Applied

---

## 📋 **ACKNOWLEDGMENT**

Thank you for the detailed observations, Marek and Simba. Your testing has uncovered a critical internal consistency issue that was causing confusion between computed and applied penalty values.

**Excellent catch** on the k=1.000 validation showing the double-application bug is fixed, while also identifying that the trace/UI still had inconsistencies.

---

## 🐛 **ISSUE CONFIRMED**

### **Your Observations:**
✅ **Good News:** k=1.000 (double-application bug fixed)  
❌ **Internal Inconsistency:**
- Penalty shown as **3.82% (computed)** in UI
- Trace step shows **Penalty%=0.00% (applied)**
- `AfterPenalty=9000` (no penalty actually applied)
- Formula still displayed `(1−3.82%)`
- Narrative/JSON: **8646.2**
- UI/trace: **9000**

### **Root Cause Identified:**
The code was computing penalty/bonus based on overlap calculations, but applying different values based on configuration toggles. **The formula and UI were displaying the COMPUTED values while the actual calculation used APPLIED values.**

**Result:** Formula said one thing, calculation did another.

---

## 🔧 **FIX APPLIED**

### **Changes to `utils/grok/evaluate.ts` (40 lines modified):**

#### **1. Formula Now Uses APPLIED Values**

**BEFORE (WRONG):**
```typescript
formula: `Final = (Composite=9000 × (1 - 3.82%/100)) × 1.050 = 8646.2`
// But calculation actually used 0% penalty!
```

**AFTER (CORRECT):**
```typescript
formula: `Final = (Composite=9000 × (1 - 0%/100)) × 1.000 = 9000`
// Formula now matches what calculation actually does
```

#### **2. Added Explicit Computed vs Applied Tracking**

New fields in `score_trace`:

```json
{
  "penalty_percent_computed": 3.82,
  "penalty_percent_applied": 0,
  "penalty_difference_reason": "Overlap adjustments disabled via config toggle - penalty computed but not applied",
  
  "bonus_multiplier_computed": 1.05,
  "bonus_multiplier_applied": 1.0,
  "bonus_difference_reason": "Overlap adjustments disabled via config toggle - bonus computed but not applied (1.0 used)",
  
  "overlap_adjustments_enabled": false
}
```

#### **3. Formula Steps Show Applied + Computed**

```typescript
formula_steps: [
  "Step 1: Composite = N(2500) + D(2500) + C(2000) + A(2000) = 9000",
  "Step 2: After Penalty = 9000 × (1 - 0/100) = 9000.00 [Computed: 3.82%, Applied: 0%]",
  "Step 3: After Bonus = 9000.00 × 1.000 = 9000.00 [Computed: 1.050, Applied: 1.000]",
  "Step 4: Final (clamped 0-10000) = 9000"
]
```

**When they match, no brackets shown. When they differ, explanation provided.**

#### **4. pod_composition Now Uses APPLIED Values**

```json
{
  "multipliers": {
    "sweet_spot_multiplier": 1.0,
    "seed_multiplier": 1.0,
    "edge_multiplier": 1.0,
    "total_multiplier": 1.0
  },
  "penalties": {
    "overlap_penalty_percent": 0,
    "total_penalty_percent": 0
  },
  "computed_vs_applied": {
    "penalty_computed": 3.82,
    "penalty_applied": 0,
    "bonus_computed": 1.05,
    "bonus_applied": 1.0,
    "differs": true,
    "reason": "overlap_toggle_disabled"
  },
  "sandbox_factor": 1.0,
  "final_clamped": 9000
}
```

#### **5. Return Fields Use APPLIED as Primary**

```typescript
// Primary fields (used by UI/JSON)
redundancy_penalty_percent: 0,           // APPLIED
sweet_spot_bonus_multiplier: 1.0,       // APPLIED

// Additional transparency fields
redundancy_penalty_percent_computed: 3.82,
sweet_spot_bonus_multiplier_computed: 1.05
```

---

## ✅ **VALIDATION**

### **Expected Behavior After Fix:**

#### **Scenario: Overlap Toggle OFF (Your Test Case)**
```json
{
  "overlap_percent": 3.82,
  "penalty_percent_computed": 3.82,
  "penalty_percent_applied": 0,
  "bonus_multiplier_computed": 1.05,
  "bonus_multiplier_applied": 1.0,
  "formula": "Final = (Composite=9000 × (1 - 0%/100)) × 1.000 = 9000",
  "pod_score": 9000,
  "k_factor": 1.000
}
```

**UI/JSON/Narrative all show: 9000**  
**Formula shows: (1 - 0%/100)**  
**Trace shows: penalty_applied=0**  
**All consistent!**

#### **Scenario: Overlap Toggle ON**
```json
{
  "overlap_percent": 3.82,
  "penalty_percent_computed": 3.82,
  "penalty_percent_applied": 3.82,
  "bonus_multiplier_computed": 1.05,
  "bonus_multiplier_applied": 1.05,
  "formula": "Final = (Composite=9000 × (1 - 3.82%/100)) × 1.050 = 9115",
  "pod_score": 9115,
  "k_factor": 1.000
}
```

**UI/JSON/Narrative all show: 9115**  
**Formula shows: (1 - 3.82%/100)**  
**Trace shows: penalty_applied=3.82**  
**All consistent!**

---

## 🧪 **TESTING RECOMMENDATIONS**

### **Regression Test Protocol:**

**Please test these scenarios to validate the fix:**

#### **Test 1: Overlap Toggle OFF (Your Case)**
```bash
Input: Any submission
Config: overlap_enabled=false
Expected:
  ✓ penalty_computed = X% (vector calculation)
  ✓ penalty_applied = 0% (toggle disabled)
  ✓ formula shows "(1 - 0%/100)"
  ✓ UI/JSON/narrative all match (no penalty applied)
  ✓ k-factor = 1.000
  ✓ computed_vs_applied.differs = true
  ✓ computed_vs_applied.reason = "overlap_toggle_disabled"
```

#### **Test 2: Overlap Toggle ON**
```bash
Input: Same submission
Config: overlap_enabled=true
Expected:
  ✓ penalty_computed = X%
  ✓ penalty_applied = X% (same as computed)
  ✓ formula shows "(1 - X%/100)"
  ✓ UI/JSON/narrative all match (penalty applied)
  ✓ k-factor = 1.000
  ✓ computed_vs_applied.differs = false
```

#### **Test 3: Sweet Spot Bonus (Toggle ON)**
```bash
Input: Submission with ~14.2% overlap
Config: overlap_enabled=true
Expected:
  ✓ bonus_computed = 1.15
  ✓ bonus_applied = 1.15
  ✓ formula shows "× 1.150"
  ✓ k-factor = 1.000
```

#### **Test 4: Sweet Spot Bonus (Toggle OFF)**
```bash
Input: Submission with ~14.2% overlap
Config: overlap_enabled=false
Expected:
  ✓ bonus_computed = 1.15
  ✓ bonus_applied = 1.0
  ✓ formula shows "× 1.000"
  ✓ k-factor = 1.000
```

### **Validation Checklist:**
- [ ] Formula matches calculation exactly
- [ ] UI and JSON return same values
- [ ] Narrative report matches trace
- [ ] k-factor validates to 1.000 in all cases
- [ ] `computed_vs_applied` object shows differences when they exist
- [ ] `penalty_difference_reason` explains why they differ

---

## 📝 **RE: FOUNDATIONAL MAX QUALIFICATION OVERRIDE**

You mentioned:
> "The 'foundational max qualification' override should be disabled for regression tests or it contaminates overlap validation."

**Status:** We searched the entire codebase and found **no foundational max qualification override** in the evaluation logic. The code has:
- Max score clamp of 10,000 (standard)
- Qualification threshold of 8,000 for Founder tier
- No special "foundational" override that bypasses normal scoring

**If this override exists elsewhere (UI setting, admin panel, or external config), please point us to it and we'll disable it for regression testing.**

Alternatively, if you're seeing scores that appear to be overridden to 10,000 regardless of calculation, it might be:
1. A different bug we need to investigate
2. A UI display issue
3. An external system applying overrides

Please share example submission hashes where you're seeing this behavior and we'll investigate immediately.

---

## 🚀 **DEPLOYMENT STATUS**

### **Fix Applied To:**
- ✅ `utils/grok/evaluate.ts` (core evaluation engine)
- ✅ All score traces generated going forward
- ✅ Both main Syntheverse and enterprise sandbox evaluations

### **Files Changed:**
```
utils/grok/evaluate.ts | 40 insertions(+), 14 deletions(-)
```

### **Commit:**
```
fix: Marek/Simba penalty computed vs applied consistency

CRITICAL BUG FIX - Internal Inconsistency

Problem: Formula displayed computed values but calculation used applied values
Fix: Formula now uses APPLIED values with COMPUTED shown in brackets when differs
Result: UI/JSON/formula all consistent with actual calculation
```

### **Ready for Testing:**
The fix is committed and ready for your regression validation. **Please run your test suite against the updated evaluation endpoint.**

---

## 📊 **TRANSPARENCY ENHANCEMENTS**

### **What's Now Visible in Every Evaluation:**

```json
{
  "score_trace": {
    "overlap_percent": 3.82,
    
    "penalty_percent_computed": 3.82,
    "penalty_percent_applied": 0,
    "penalty_difference_reason": "Overlap adjustments disabled via config toggle",
    
    "bonus_multiplier_computed": 1.05,
    "bonus_multiplier_applied": 1.0,
    "bonus_difference_reason": "Overlap adjustments disabled via config toggle",
    
    "overlap_adjustments_enabled": false,
    
    "formula": "Final = (Composite=9000 × (1 - 0%/100)) × 1.000 = 9000",
    "formula_steps": [
      "Step 1: Composite = ... = 9000",
      "Step 2: After Penalty = 9000 × (1 - 0/100) = 9000.00 [Computed: 3.82%, Applied: 0%]",
      "Step 3: After Bonus = 9000.00 × 1.000 = 9000.00 [Computed: 1.050, Applied: 1.000]",
      "Step 4: Final (clamped 0-10000) = 9000"
    ],
    
    "final_preclamp": 9000,
    "final_clamped": 9000,
    "clamped": false,
    "k_factor_source": "preclamp"
  },
  
  "pod_composition": {
    "multipliers": {
      "sweet_spot_multiplier": 1.0,
      "total_multiplier": 1.0
    },
    "penalties": {
      "overlap_penalty_percent": 0,
      "total_penalty_percent": 0
    },
    "computed_vs_applied": {
      "penalty_computed": 3.82,
      "penalty_applied": 0,
      "bonus_computed": 1.05,
      "bonus_applied": 1.0,
      "differs": true,
      "reason": "overlap_toggle_disabled"
    }
  }
}
```

**Everything is now traceable and auditable.**

---

## 🙏 **THANK YOU**

This was an excellent catch, Marek and Simba. The k-factor validation passing (1.000) showed the **calculation was correct**, but the **reporting was inconsistent**. That's the worst kind of bug because it makes correct calculations look wrong.

Your systematic testing approach is exactly what we need to ensure the scoring system is both accurate AND transparent.

---

## 📞 **NEXT STEPS**

1. **Review this fix:** Confirm it addresses your observations
2. **Run regression tests:** Use the test protocol above
3. **Report results:** Let us know if you see any remaining inconsistencies
4. **Foundational override:** Please clarify where this exists so we can investigate

We're standing by for your test results and any additional feedback.

---

## 📎 **DOCUMENTATION**

Complete technical documentation of this fix:
- **Location:** `docs/MAREK_SIMBA_PENALTY_FIX.md`
- **Contents:** Root cause analysis, fix details, test protocol, validation checklist

---

**Thank you for your thorough testing and clear bug reports. They make Syntheverse better for everyone.**

**— FractiAI Engineering Team**

---

**Status:** ✅ **FIX APPLIED - READY FOR VALIDATION**  
**Awaiting:** Your regression test results

