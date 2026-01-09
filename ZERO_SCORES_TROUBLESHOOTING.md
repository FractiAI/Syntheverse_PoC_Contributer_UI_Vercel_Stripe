# Zero Scores Issue - Troubleshooting Guide

**Issue**: Evaluations return 0 scores after the 6th successful submission  
**Date Reported**: January 9, 2026  
**Status**: Under Investigation

## Symptoms

- First 5-6 submissions work correctly with proper scores
- After the 6th submission, all evaluations return zero scores
- Pattern suggests rate limiting or API quota issue

## Potential Causes

### 1. **Groq API Rate Limiting** (Most Likely)
Groq has rate limits on their free tier:
- **Requests per minute**: 30 RPM
- **Tokens per minute**: 6,000 TPM
- **Requests per day**: 14,400 RPD

After 6 submissions, cumulative token usage might exceed limits.

**Solution**: 
- Add retry logic with exponential backoff
- Implement request queuing
- Consider upgrading to paid tier for higher limits

### 2. **Token Budget Exhaustion**
Each evaluation request includes:
- System prompt (~2,200 tokens)
- User content (~2,500 tokens)
- Response (~2,000 tokens)
- Total: ~6,700 tokens per request

After 6 requests: ~40,200 tokens consumed

**Solution**:
- Reduce system prompt size
- Implement token usage tracking
- Add delays between requests

### 3. **Environment Variable Issues**
- API key might not be properly cached
- Key rotation or expiration

**Solution**:
- Verify API key in environment variables
- Test with diagnostic endpoint: `/api/debug/groq-test`

### 4. **Response Parsing Failures**
- Groq API might return incomplete JSON after multiple requests
- Parser fails silently, defaulting to 0 scores

**Solution**:
- Enhanced error logging in evaluate.ts
- Capture raw Groq responses
- Validate JSON structure before parsing

## Diagnostic Steps

### Step 1: Check Groq API Status
```bash
curl https://syntheverse-poc.vercel.app/api/debug/groq-test
```

### Step 2: Review Evaluation Logs
Check Vercel function logs for:
- `[EvaluateWithGroq] CRITICAL ERROR: All scores are 0`
- Groq API error responses
- Rate limit messages

### Step 3: Test with Single Submission
1. Clear recent submissions
2. Submit one test PoC
3. Check if it evaluates correctly
4. Repeat 6 times to reproduce issue

### Step 4: Check Environment Variables
```bash
# In Vercel Dashboard
vercel env ls
```

Verify:
- `NEXT_PUBLIC_GROQ_API_KEY` is set
- Key has not expired
- Key has proper permissions

## Immediate Fixes

### Fix 1: Add Rate Limit Delay
Add 2-second delay between evaluation requests:

```typescript
// In app/api/evaluate/[hash]/route.ts
await new Promise(resolve => setTimeout(resolve, 2000));
```

### Fix 2: Implement Retry Logic
Add retry with exponential backoff in `utils/grok/evaluate.ts`:

```typescript
for (let retry = 0; retry < 3; retry++) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', ...);
    if (response.ok) break;
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retry)));
  } catch (error) {
    if (retry === 2) throw error;
  }
}
```

### Fix 3: Enhanced Error Logging
Already implemented in evaluate.ts lines 1738-1811. Logs include:
- Full evaluation object
- Raw Groq response
- JSON parsing candidates
- Timestamp for correlation

## Monitoring

### Key Metrics to Track
1. Groq API success rate
2. Average response time
3. Token usage per request
4. Number of 429 (rate limit) errors
5. Number of 0-score evaluations

### Alert Thresholds
- More than 2 consecutive 0-score evaluations
- Groq API error rate > 10%
- Average response time > 15 seconds

## Resolution Status

**Current Status**: 🔍 Investigating

**Next Steps**:
1. Deploy diagnostic endpoint
2. Monitor Groq API responses for next 24 hours
3. Implement rate limit handling if confirmed
4. Consider upgrading Groq API tier if free tier limits are the cause

## Contact

For questions or additional information:
- GitHub Issues: https://github.com/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe/issues
- Email: info@fractiai.com

---

**Last Updated**: January 9, 2026  
**Next Review**: January 10, 2026

