# Improved Grok Data Exchange & Capture

## Current Issues

1. **Inconsistent JSON Format**: Grok sometimes returns JSON wrapped in markdown code blocks
2. **Missing Scores**: Density, Coherence, and Alignment sometimes return as 0
3. **Parsing Failures**: Single parsing strategy fails when Grok returns unexpected formats
4. **No Validation**: Responses aren't validated before use
5. **No Retry Logic**: Single failure causes complete evaluation failure

## Improvements

### 1. **Multi-Strategy JSON Parsing**

Instead of a single regex match, use multiple parsing strategies:

````typescript
// Strategy 1: Direct JSON parse
// Strategy 2: Extract from ```json ... ``` blocks
// Strategy 3: Extract from ``` ... ``` blocks
// Strategy 4: Find first JSON object
// Strategy 5: Find JSON between markers
````

### 2. **Explicit JSON Schema in Prompt**

Provide Grok with:

- **Exact JSON schema** showing required structure
- **Example response** showing correct format
- **Explicit instructions** to return ONLY JSON (no markdown)

### 3. **Response Validation**

Validate responses before use:

- Check required fields exist
- Verify scores are numbers (not strings)
- Ensure arrays are properly formatted
- Validate score ranges (0-2500 for dimensions, 0-10000 for total)

### 4. **Robust Score Extraction**

Extract scores from multiple formats:

- Direct numbers: `"density": 2000`
- Score objects: `"density": { "base_score": 2000, "final_score": 1800 }`
- Nested structures: `"scoring": { "density": { "score": 2000 } }`
- String numbers: `"density": "2000"` → parse to number

### 5. **Retry Logic with Exponential Backoff**

Retry failed requests:

- Up to 3 attempts
- Exponential backoff (1s, 2s, 3s delays)
- Different parsing strategies on each retry

### 6. **Better Error Handling**

- Log full response for debugging
- Provide specific error messages
- Store raw evaluation for troubleshooting

## Implementation

### Enhanced Prompt Structure

```typescript
const systemPrompt = `You are an expert evaluator.

**CRITICAL: Return ONLY valid JSON. No markdown, no explanations.**

**Required JSON Structure:**
{
  "novelty": { "base_score": 2000, "final_score": 1800, "score": 1800 },
  "density": { "base_score": 2200, "final_score": 2200, "score": 2200 },
  "coherence": { "score": 2100, "final_score": 2100 },
  "alignment": { "score": 1900, "final_score": 1900 },
  "pod_score": 8000,
  "metals": ["gold", "silver"]
}

**Rules:**
- All scores must be NUMBERS (0-2500 for dimensions, 0-10000 for total)
- Return ONLY the JSON object - no markdown code blocks
- Verify JSON is valid before returning`;
```

### Multi-Strategy Parser

````typescript
function parseGrokResponse(responseText: string): any {
    // Try 5 different parsing strategies
    const strategies = [
        () => JSON.parse(responseText.trim()),
        () => JSON.parse(responseText.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] || '{}')),
        () => JSON.parse(responseText.match(/```\s*([\s\S]*?)\s*```/)?.[1] || '{}')),
        () => JSON.parse(responseText.match(/\{[\s\S]*\}/)?.[0] || '{}'),
        () => {
            const start = responseText.indexOf('{')
            const end = responseText.lastIndexOf('}')
            return JSON.parse(responseText.substring(start, end + 1))
        }
    ]

    for (const strategy of strategies) {
        try {
            return strategy()
        } catch {
            continue
        }
    }
    throw new Error('Failed to parse JSON')
}
````

### Score Extraction with Fallbacks

```typescript
function extractScore(value: any, maxValue: number = 2500): number {
  // Direct number
  if (typeof value === 'number') {
    return Math.max(0, Math.min(maxValue, value));
  }

  // Score object
  if (typeof value === 'object' && value !== null) {
    const score = value.final_score ?? value.score ?? value.base_score ?? value.value ?? 0;
    return typeof score === 'number'
      ? Math.max(0, Math.min(maxValue, score))
      : typeof score === 'string'
        ? parseFloat(score) || 0
        : 0;
  }

  // String number
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(maxValue, parsed));
  }

  return 0;
}
```

### Validation

```typescript
function validateEvaluation(evaluation: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  const required = ['novelty', 'density', 'coherence', 'alignment', 'pod_score', 'metals'];
  for (const field of required) {
    if (!(field in evaluation)) {
      errors.push(`Missing: ${field}`);
    }
  }

  // Validate scores are numbers
  const scores = ['novelty', 'density', 'coherence', 'alignment', 'pod_score'];
  for (const field of scores) {
    const value = evaluation[field];
    if (value !== undefined) {
      if (typeof value === 'object') {
        const score = value.base_score ?? value.final_score ?? value.score;
        if (typeof score !== 'number' || isNaN(score)) {
          errors.push(`${field} is not a valid number`);
        }
      } else if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field} is not a valid number`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

## Usage

### Option 1: Update Existing Code

Update `utils/grok/evaluate.ts` with the improved parsing and validation logic.

### Option 2: Use Improved Version

Replace calls to `evaluateWithGrok` with `evaluateWithGrokImproved` from `utils/grok/evaluate-improved.ts`.

## Benefits

1. **Higher Success Rate**: Multiple parsing strategies catch more response formats
2. **Better Data Quality**: Validation ensures all required fields are present
3. **More Reliable**: Retry logic handles transient failures
4. **Easier Debugging**: Full response logging helps troubleshoot issues
5. **Consistent Scores**: Robust extraction handles various formats

## Testing

Test with various Grok response formats:

- JSON wrapped in markdown
- Plain JSON
- JSON with extra text
- Malformed JSON (should retry)
- Missing fields (should validate and error clearly)

## Next Steps

1. Integrate improved parsing into `evaluate.ts`
2. Add response validation
3. Implement retry logic
4. Update error logging
5. Test with real submissions
