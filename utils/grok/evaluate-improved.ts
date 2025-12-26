/**
 * IMPROVED Grok API Integration
 * Better data exchange and capture with structured outputs, validation, and retry logic
 */

// JSON Schema for expected evaluation response
const EVALUATION_JSON_SCHEMA = {
    type: "object",
    required: ["novelty", "density", "coherence", "alignment", "pod_score", "metals"],
    properties: {
        novelty: {
            oneOf: [
                { type: "number", minimum: 0, maximum: 2500 },
                {
                    type: "object",
                    properties: {
                        base_score: { type: "number", minimum: 0, maximum: 2500 },
                        final_score: { type: "number", minimum: 0, maximum: 2500 },
                        score: { type: "number", minimum: 0, maximum: 2500 }
                    }
                }
            ]
        },
        density: {
            oneOf: [
                { type: "number", minimum: 0, maximum: 2500 },
                {
                    type: "object",
                    properties: {
                        base_score: { type: "number", minimum: 0, maximum: 2500 },
                        final_score: { type: "number", minimum: 0, maximum: 2500 },
                        score: { type: "number", minimum: 0, maximum: 2500 }
                    }
                }
            ]
        },
        coherence: {
            oneOf: [
                { type: "number", minimum: 0, maximum: 2500 },
                {
                    type: "object",
                    properties: {
                        base_score: { type: "number", minimum: 0, maximum: 2500 },
                        final_score: { type: "number", minimum: 0, maximum: 2500 },
                        score: { type: "number", minimum: 0, maximum: 2500 }
                    }
                }
            ]
        },
        alignment: {
            oneOf: [
                { type: "number", minimum: 0, maximum: 2500 },
                {
                    type: "object",
                    properties: {
                        base_score: { type: "number", minimum: 0, maximum: 2500 },
                        final_score: { type: "number", minimum: 0, maximum: 2500 },
                        score: { type: "number", minimum: 0, maximum: 2500 }
                    }
                }
            ]
        },
        pod_score: { type: "number", minimum: 0, maximum: 10000 },
        metals: { type: "array", items: { type: "string", enum: ["gold", "silver", "copper"] } },
        classification: { type: "array", items: { type: "string" } },
        redundancy_analysis: { type: "string" },
        metal_justification: { type: "string" },
        tokenomics_recommendation: { type: "object" }
    }
}

// Example JSON response to guide Grok
const EXAMPLE_JSON_RESPONSE = `{
  "novelty": {
    "base_score": 2000,
    "final_score": 1800,
    "redundancy_penalty_percent": 10
  },
  "density": {
    "base_score": 2200,
    "final_score": 2200,
    "score": 2200
  },
  "coherence": {
    "base_score": 2100,
    "final_score": 2100,
    "score": 2100
  },
  "alignment": {
    "base_score": 1900,
    "final_score": 1900,
    "score": 1900
  },
  "pod_score": 8000,
  "metals": ["gold", "silver"],
  "classification": ["Research", "Scientific"],
  "redundancy_analysis": "Low redundancy compared to archive",
  "metal_justification": "Contains both scientific discovery and technology",
  "tokenomics_recommendation": {
    "eligible_epochs": ["founder"],
    "suggested_allocation": 1000,
    "tier_multiplier": 1.5
  }
}`

/**
 * Parse JSON from Grok response with multiple strategies
 */
function parseGrokResponse(responseText: string): any {
    const strategies = [
        // Strategy 1: Direct JSON parse
        () => {
            try {
                return JSON.parse(responseText.trim())
            } catch {
                return null
            }
        },
        
        // Strategy 2: Extract JSON from markdown code block (```json ... ```)
        () => {
            const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/i)
            if (jsonBlockMatch) {
                try {
                    return JSON.parse(jsonBlockMatch[1].trim())
                } catch {
                    return null
                }
            }
            return null
        },
        
        // Strategy 3: Extract JSON from generic code block (``` ... ```)
        () => {
            const codeBlockMatch = responseText.match(/```\s*([\s\S]*?)\s*```/)
            if (codeBlockMatch) {
                try {
                    return JSON.parse(codeBlockMatch[1].trim())
                } catch {
                    return null
                }
            }
            return null
        },
        
        // Strategy 4: Find first JSON object in text
        () => {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0])
                } catch {
                    return null
                }
            }
            return null
        },
        
        // Strategy 5: Find JSON between specific markers
        () => {
            const startMarker = responseText.indexOf('{')
            const endMarker = responseText.lastIndexOf('}')
            if (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
                try {
                    return JSON.parse(responseText.substring(startMarker, endMarker + 1))
                } catch {
                    return null
                }
            }
            return null
        }
    ]
    
    for (const strategy of strategies) {
        const result = strategy()
        if (result) {
            return result
        }
    }
    
    throw new Error('Failed to parse JSON from Grok response using all strategies')
}

/**
 * Validate evaluation response structure
 */
function validateEvaluation(evaluation: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check required fields
    const requiredFields = ['novelty', 'density', 'coherence', 'alignment', 'pod_score', 'metals']
    for (const field of requiredFields) {
        if (!(field in evaluation)) {
            errors.push(`Missing required field: ${field}`)
        }
    }
    
    // Validate scores are numbers
    const scoreFields = ['novelty', 'density', 'coherence', 'alignment', 'pod_score']
    for (const field of scoreFields) {
        const value = evaluation[field]
        if (value !== undefined) {
            if (typeof value === 'object' && value !== null) {
                // Check if it's a score object
                const scoreValue = value.base_score ?? value.final_score ?? value.score
                if (scoreValue !== undefined && (typeof scoreValue !== 'number' || isNaN(scoreValue))) {
                    errors.push(`${field} score is not a valid number`)
                }
            } else if (typeof value !== 'number' || isNaN(value)) {
                errors.push(`${field} is not a valid number`)
            }
        }
    }
    
    // Validate metals array
    if (evaluation.metals && !Array.isArray(evaluation.metals)) {
        errors.push('metals must be an array')
    }
    
    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Extract numeric score from various formats
 */
function extractScore(value: any, fieldName: string): number {
    if (typeof value === 'number') {
        return isNaN(value) ? 0 : Math.max(0, Math.min(2500, value))
    }
    
    if (typeof value === 'object' && value !== null) {
        const score = value.final_score ?? value.score ?? value.base_score ?? value.value ?? 0
        if (typeof score === 'number' && !isNaN(score)) {
            return Math.max(0, Math.min(2500, score))
        }
        if (typeof score === 'string') {
            const parsed = parseFloat(score)
            return isNaN(parsed) ? 0 : Math.max(0, Math.min(2500, parsed))
        }
    }
    
    if (typeof value === 'string') {
        const parsed = parseFloat(value)
        return isNaN(parsed) ? 0 : Math.max(0, Math.min(2500, parsed))
    }
    
    return 0
}

/**
 * Improved Grok API call with retry logic and better error handling
 */
export async function evaluateWithGrokImproved(
    textContent: string,
    title: string,
    category?: string,
    excludeHash?: string,
    maxRetries: number = 2
): Promise<any> {
    const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY || process.env.GROK_API_KEY
    if (!grokApiKey) {
        throw new Error('GROK_API_KEY environment variable is not set')
    }
    
    // Enhanced system prompt with explicit JSON schema
    const systemPrompt = `You are an expert evaluator for Proof-of-Contribution submissions.

**CRITICAL: You MUST return ONLY valid JSON. No markdown, no explanations, no text before or after the JSON.**

**Required JSON Structure:**
${JSON.stringify(EVALUATION_JSON_SCHEMA, null, 2)}

**Example Response Format:**
${EXAMPLE_JSON_RESPONSE}

**Scoring Rules:**
- All scores must be NUMBERS (0-2500 for dimensions, 0-10000 for total)
- Each dimension (novelty, density, coherence, alignment) can be:
  - A number directly: 2000
  - An object with base_score, final_score, and score: { "base_score": 2000, "final_score": 1800, "score": 1800 }
- pod_score must be a number (0-10000)
- metals must be an array of strings: ["gold", "silver", "copper"]
- All numeric values must be valid numbers, never strings, null, or undefined`

    // Enhanced evaluation query with explicit format requirements
    const evaluationQuery = `Evaluate this Proof-of-Contribution:

**Title:** ${title}
**Category:** ${category || 'scientific'}
**Content:** ${textContent.substring(0, 5000)}

**REQUIRED OUTPUT FORMAT:**
Return ONLY a valid JSON object matching this exact structure:
${EXAMPLE_JSON_RESPONSE}

**CRITICAL REQUIREMENTS:**
1. Return ONLY the JSON object - no markdown code blocks, no text before/after
2. All scores must be NUMBERS (not strings)
3. Ensure all required fields are present
4. Verify the JSON is valid before returning

Return your evaluation now as valid JSON:`

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${grokApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: evaluationQuery }
                    ],
                    temperature: 0.0, // Deterministic
                    max_tokens: 2000, // Increased for complete responses
                    // Note: Grok API may not support response_format yet, but we request it
                    // response_format: { type: "json_object" } // Uncomment when supported
                }),
                signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Grok API error (${response.status}): ${errorText}`)
            }
            
            const data = await response.json()
            const answer = data.choices[0]?.message?.content || ''
            
            // Parse with multiple strategies
            const evaluation = parseGrokResponse(answer)
            
            // Validate structure
            const validation = validateEvaluation(evaluation)
            if (!validation.valid) {
                throw new Error(`Invalid evaluation structure: ${validation.errors.join(', ')}`)
            }
            
            // Extract scores with improved logic
            const result = {
                novelty: extractScore(evaluation.novelty, 'novelty'),
                density: extractScore(evaluation.density, 'density'),
                coherence: extractScore(evaluation.coherence, 'coherence'),
                alignment: extractScore(evaluation.alignment, 'alignment'),
                pod_score: typeof evaluation.pod_score === 'number' 
                    ? Math.max(0, Math.min(10000, evaluation.pod_score))
                    : 0,
                metals: Array.isArray(evaluation.metals) 
                    ? evaluation.metals.map((m: string) => m.toLowerCase())
                    : ['copper'],
                classification: Array.isArray(evaluation.classification) 
                    ? evaluation.classification 
                    : [],
                redundancy_analysis: evaluation.redundancy_analysis || '',
                metal_justification: evaluation.metal_justification || '',
                tokenomics_recommendation: evaluation.tokenomics_recommendation || {},
                // Store raw evaluation for debugging
                _raw_evaluation: evaluation
            }
            
            return result
            
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
            
            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
                continue
            }
        }
    }
    
    throw lastError || new Error('Failed to evaluate after all retries')
}

