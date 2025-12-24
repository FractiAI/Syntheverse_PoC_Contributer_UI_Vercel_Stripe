# Archived PoCs Integration with Grok API

This document explains how archived PoC submissions are fetched from the database and integrated into the Grok API call for redundancy checking.

## Data Flow

### 1. Function Entry Point

**File:** `utils/grok/evaluate.ts`  
**Function:** `evaluateWithGrok(textContent, title, category, excludeHash)`

The function is called from:
- `app/api/submit/route.ts` (line 230) - when a new submission is created
- `app/api/evaluate/[hash]/route.ts` (line 70) - when re-evaluating an existing submission

The `excludeHash` parameter excludes the current submission from the archived list to avoid comparing it to itself.

### 2. Database Query for Archived PoCs

**Location:** `utils/grok/evaluate.ts` lines 76-106

```typescript
// Fetch archived PoCs for redundancy checking and context
let archivedPoCs: ArchivedPoC[] = []
try {
    const allContributions = await db
        .select()
        .from(contributionsTable)
        .where(excludeHash ? ne(contributionsTable.submission_hash, excludeHash) : undefined)
        .orderBy(contributionsTable.created_at)
    
    archivedPoCs = allContributions.map(contrib => ({
        submission_hash: contrib.submission_hash,
        title: contrib.title,
        contributor: contrib.contributor,
        category: contrib.category,
        text_content: contrib.text_content,
        status: contrib.status,
        metals: contrib.metals as string[] | null,
        metadata: contrib.metadata || {},
        pod_score: (contrib.metadata as any)?.pod_score,
        coherence: (contrib.metadata as any)?.coherence,
        density: (contrib.metadata as any)?.density,
        novelty: (contrib.metadata as any)?.novelty,
        alignment: (contrib.metadata as any)?.alignment,
        created_at: contrib.created_at
    }))
} catch (error) {
    // Continue without archived PoCs if fetch fails
}
```

**What it does:**
- Queries the `contributions` table for all prior submissions
- Excludes the current submission (using `excludeHash` parameter)
- Maps database records to `ArchivedPoC` interface
- Extracts evaluation scores from metadata (pod_score, coherence, density, novelty, alignment)

### 3. Formatting Archived PoCs for Context

**Location:** `utils/grok/evaluate.ts` lines 863-881

The archived PoCs are formatted into a readable context string that describes them as 3D vectors in the holographic hydrogen fractal sandbox:

```typescript
const archivedPoCsContext = archivedPoCs.length > 0 
    ? `**Archived PoC Vectors (3D Representations in Hydrogen-Holographic Fractal Sandbox):**

${archivedPoCs.map((poc, idx) => `
**Archived PoC Vector #${idx + 1} (3D Position in Holographic Space):**
- Vector Hash (Submission Hash): ${poc.submission_hash}
- Title: ${poc.title}
- Contributor: ${poc.contributor}
- Category: ${poc.category || 'N/A'}
- Status: ${poc.status}
- Metals: ${poc.metals?.join(', ') || 'None'}
- Vector Coordinates (Scores): Pod=${poc.pod_score || 'N/A'}, Novelty=${poc.novelty || 'N/A'}, Density=${poc.density || 'N/A'}, Coherence=${poc.coherence || 'N/A'}, Alignment=${poc.alignment || 'N/A'}
- Content Preview (Vector Content): ${(poc.text_content || poc.title).substring(0, 500)}...
- Vector Creation Time: ${poc.created_at?.toISOString() || 'N/A'}

*This PoC exists as a 3D vector representation within the Hydrogen-Holographic Fractal Sandbox...*
`).join('\n')}`
    : '**No prior archived PoC vectors found.** This is the first submission in the archive and will establish the initial 3D vector space.'
```

**What it includes:**
- Each archived PoC's hash, title, contributor, category, status, metals
- Evaluation scores (pod_score, novelty, density, coherence, alignment)
- Content preview (first 500 characters of text_content or title)
- Creation timestamp
- Framed as 3D vectors in the holographic hydrogen fractal sandbox

### 4. Integration into Evaluation Query

**Location:** `utils/grok/evaluate.ts` lines 906-958

The `archivedPoCsContext` is embedded directly into the `evaluationQuery` string that is sent to Grok:

```typescript
const evaluationQuery = `Evaluate the following Proof-of-Contribution:

**PoC Title:** ${title}
**Category:** ${category || 'scientific'}
**Contribution Class:** ${category === 'scientific' ? 'Research' : category === 'tech' ? 'Development' : 'Alignment'}

**Description/Content:**
${textContent.substring(0, 10000)}...

**Archived PoC Vectors (3D Representations in Hydrogen-Holographic Fractal Sandbox) for Redundancy Comparison:**
${archivedPoCsContext}  // <-- ARCHIVED POCs INSERTED HERE

${tokenomicsContext}

**Instructions:**
1. Classify the contribution (Research/Development/Alignment)
2. **Redundancy Check (3D Vector Comparison in Holographic Space):** 
   - Map the current submission to its 3D vector representation
   - Compare this submission's 3D vector to ALL archived PoC vectors listed above
   - Calculate vector similarity/distance using HHF geometry
   - Apply redundancy penalties based on 3D vector similarity
   ...
`
```

### 5. Sending to Grok API

**Location:** `utils/grok/evaluate.ts` lines 967-982

The evaluation query (containing all archived PoCs) is sent to Grok API as the user message:

```typescript
response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: systemPrompt },  // System prompt with evaluation instructions
            { role: 'user', content: evaluationQuery }  // User message containing current submission + ALL archived PoCs
        ],
        temperature: 0.0,
        max_tokens: 2000,
    })
})
```

## Key Points

1. **Complete Archive Access:** Grok receives ALL archived PoCs in the evaluation query, not just a summary
2. **Rich Context:** Each archived PoC includes:
   - Full metadata (hash, title, contributor, category, status, metals)
   - Evaluation scores (pod_score, novelty, density, coherence, alignment)
   - Content preview (first 500 characters)
   - Creation timestamp
3. **3D Vector Framework:** All archived PoCs are framed as 3D vector representations in the holographic hydrogen fractal sandbox
4. **Current Submission Exclusion:** The current submission is excluded from the archive list via `excludeHash` parameter
5. **Error Handling:** If fetching archived PoCs fails, the evaluation continues without them (empty archive message)

## Limitations

1. **Content Truncation:** Archived PoC content is truncated to 500 characters in the context
2. **Current Submission Content:** Current submission content is truncated to 10,000 characters
3. **Token Limits:** Grok API has a `max_tokens: 2000` limit, which may constrain the total context size
4. **No Vector Embeddings:** Currently, redundancy is determined by text similarity via Grok's understanding, not by computed vector embeddings

## Future Improvements

- Use actual vector embeddings (e.g., OpenAI embeddings) to compute 3D vector positions
- Implement vector similarity calculations using HHF geometry (Λᴴᴴ ≈ 1.12 × 10²²)
- Store vector embeddings in the database for faster similarity searches
- Limit archived PoCs to most relevant ones based on category or similarity score to reduce token usage

