# Groq API Key Configuration Fix

**Date:** January 18, 2026  
**Issue:** Submissions hanging at evaluation step  
**Status:** ✅ FRONTEND FIX DEPLOYED - BACKEND CONFIG REQUIRED

---

## Problem

Submissions were hanging indefinitely at the "Evaluating" step because:

1. **Backend Error:** Groq API returning 401 Unauthorized (Invalid API Key)
2. **Frontend Issue:** UI polling didn't handle `error` status, kept polling forever

### Error Log:
```
POST /api/evaluate/3266b3bf... → 500 ERROR
Groq API error (401): {"error":{"message":"Invalid API Key"}}
```

---

## Root Cause

The `GROQ_API_KEY` environment variable in Vercel production is either:
- ❌ Missing
- ❌ Invalid/expired  
- ❌ Not configured for production environment

---

## Fix Applied

### ✅ Frontend Fix (Deployed)

Updated polling logic in `ProfessionalSubmissionExperience.tsx`:

```typescript
// Now handles error and evaluation_failed status
if (submission.status === 'error' || submission.status === 'evaluation_failed') {
  clearInterval(pollInterval);
  const errorMessage = submission.metadata?.evaluation_error || 
    'Evaluation failed. Please try again or contact support.';
  setEvaluationStatus({ completed: false, error: errorMessage });
  setCurrentStep('form');
  setError(errorMessage);
  return;
}
```

**Result:** Users now see clear error messages instead of infinite loading.

---

## Required: Backend Configuration

### Step 1: Get Groq API Key

1. Go to https://console.groq.com/
2. Sign in or create account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `gsk_...`)

### Step 2: Configure Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update variable:
   ```
   Name: GROQ_API_KEY
   Value: gsk_... (paste your actual key)
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
4. Click **Save**

### Step 3: Redeploy (Optional)

Vercel will use the new key on the next function invocation. No redeploy needed, but you can trigger one to be sure:

```bash
git commit --allow-empty -m "Trigger redeploy for Groq API key"
git push origin main
```

---

## Testing

After configuring the API key, test with a new submission:

1. Submit a test case as creator/operator
2. Should see evaluation complete successfully
3. Check Vercel logs - should see no 401 errors

---

## Technical Details

### API Flow:
```
Submit → /api/submit (200 OK)
       → /api/evaluate/[hash] (calls Groq API)
       → Groq API (requires GROQ_API_KEY)
       → Update DB with results
       → UI polls /api/archive/contributions/[hash]
       → UI displays results
```

### Error Handling:
- **401 from Groq:** Sets submission status to `error`
- **Other errors:** Sets status to `evaluation_failed`
- **Frontend:** Now catches both and displays clear message

### Polling Logic:
- Polls every 2 seconds
- Max 60 polls (2 minutes timeout)
- Now stops immediately on `error` or `evaluation_failed`

---

## Environment Variables Reference

Required for evaluation:
```bash
GROQ_API_KEY=gsk_...              # Groq AI API key
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions  # Optional, uses default
```

---

## Status

- ✅ **Frontend Fix:** Deployed (handles error status)
- ⏳ **Backend Config:** Required (add GROQ_API_KEY to Vercel)
- 📝 **Testing:** Pending backend configuration

---

## Next Steps

1. Configure `GROQ_API_KEY` in Vercel (see Step 2 above)
2. Test with new submission
3. Verify evaluation completes successfully
4. Monitor logs for any remaining issues

---

**Prepared by:** Senior Research Scientist & Full Stack Engineer  
**Date:** January 18, 2026 06:59 UTC
