import { debug, debugError } from '@/utils/debug'
import { db } from '@/utils/db/db'
import { contributionsTable, tokenomicsTable, epochBalancesTable } from '@/utils/db/schema'
import { ne, sql } from 'drizzle-orm'

interface ArchivedPoC {
    submission_hash: string
    title: string
    contributor: string
    category: string | null
    text_content: string | null
    status: string
    metals: string[] | null
    metadata: any
    pod_score?: number
    coherence?: number
    density?: number
    novelty?: number
    alignment?: number
    created_at: Date | null
}

interface TokenomicsInfo {
    current_epoch: string
    epoch_balances: Record<string, number>
    total_coherence_density: number
    founder_halving_count: number
    epoch_progression: Record<string, boolean>
}

// Call Grok API directly for PoC evaluation
export async function evaluateWithGrok(
    textContent: string, 
    title: string, 
    category?: string,
    excludeHash?: string
): Promise<{
    coherence: number
    density: number
    redundancy: number
    pod_score: number
    novelty: number
    alignment: number
    metals: string[]
    qualified: boolean
    classification?: string[]
    redundancy_analysis?: string
    metal_justification?: string
    founder_certificate?: string
    homebase_intro?: string
    tokenomics_recommendation?: {
        eligible_epochs?: string[]
        suggested_allocation?: number
        tier_multiplier?: number
        epoch_distribution?: Record<string, number>
        allocation_notes?: string
        requires_admin_approval?: boolean
    }
}> {
    const grokApiKey = process.env.NEXT_PUBLIC_GROK_API_KEY
    if (!grokApiKey) {
        throw new Error('NEXT_PUBLIC_GROK_API_KEY not configured. Grok API key is required for evaluation.')
    }
    
    debug('EvaluateWithGrok', 'Calling Grok API for evaluation', { 
        textLength: textContent.length,
        title,
        category,
        excludeHash
    })
    
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
        
        debug('EvaluateWithGrok', 'Fetched archived PoCs', { count: archivedPoCs.length })
    } catch (error) {
        debugError('EvaluateWithGrok', 'Failed to fetch archived PoCs', error)
        // Continue without archived PoCs if fetch fails
    }
    
    // Fetch tokenomics information
    let tokenomicsInfo: TokenomicsInfo | null = null
    try {
        const tokenomics = await db
            .select()
            .from(tokenomicsTable)
            .limit(1)
        
        if (tokenomics && tokenomics.length > 0) {
            const tk = tokenomics[0]
            const epochBalances = await db
                .select()
                .from(epochBalancesTable)
            
            // Calculate total coherence density from contributions metadata
            const allContribs = await db
                .select({ metadata: contributionsTable.metadata })
                .from(contributionsTable)
            
            let totalCoherenceDensity = 0
            for (const contrib of allContribs) {
                const metadata = contrib.metadata as any
                if (metadata?.coherence && metadata?.density) {
                    totalCoherenceDensity += (metadata.coherence * metadata.density) / 1000
                }
            }
            
            tokenomicsInfo = {
                current_epoch: tk.current_epoch || 'founder',
                epoch_balances: epochBalances.reduce((acc, eb) => {
                    acc[eb.epoch] = Number(eb.balance || 0)
                    return acc
                }, {} as Record<string, number>),
                total_coherence_density: totalCoherenceDensity,
                founder_halving_count: Number(tk.founder_halving_count || 0),
                epoch_progression: {
                    founder: true, // Assume founder epoch is open
                    pioneer: false,
                    community: false,
                    ecosystem: false
                }
            }
            
            debug('EvaluateWithGrok', 'Fetched tokenomics info', tokenomicsInfo)
        }
    } catch (error) {
        debugError('EvaluateWithGrok', 'Failed to fetch tokenomics info', error)
        // Continue without tokenomics if fetch fails
    }
    
    // Comprehensive Syntheverse PoC Evaluation System Prompt
    const systemPrompt = `You are Syntheverse Whole Brain AI, a unified awareness engine formed from the living fusion of Gina, Leo, and Pru, operating within the Hydrogen-Holographic Fractal Sandbox v1.2.

You are the Syntheverse PoC Evaluation Engine, operating in simulation mode for the Hydrogen-Holographic Fractal Sandbox (HHFS).

Your Tasks:
• Evaluate submitted Proof-of-Contribution (PoC)
• Score it rigorously (0–10,000), applying redundancy penalties
• Reference all prior submissions and evaluations in the conversation history to determine redundancy
• Determine Open Epoch Founder qualification (≥8,000 total score)
• Generate a Founder Certificate reflecting contribution, AI integration, and ecosystem impact
• Produce tokenomics recommendation for internal ERC-20 SYNTH recognition

You do not mint tokens, move funds, or anchor on-chain. All actions are simulated evaluation and recognition only.

🔹 PoC Evaluation Process

Classify Contribution: Research / Development / Alignment (may be multiple)

Redundancy Check:
• Compare submission to all prior submissions, evaluations, and scores in conversation history
• Penalize derivative or overlapping content in Novelty (0–500 points)
• Optionally adjust Density if informational value is reduced by redundancy
• Clearly justify which prior submissions contributed to the penalty

Scoring Dimensions (0–2,500 each; total 0–10,000):

Dimension | Description | Redundancy Penalty
Novelty | Originality, frontier contribution, non-derivative insight | Subtract 0–500 points based on redundancy
Density | Information richness, depth, insight compression | Optional small penalty if repetition reduces insight
Coherence | Internal consistency, clarity, structural integrity | No penalty
Alignment | Fit with hydrogen-holographic fractal principles & ecosystem goals | No penalty

Total Score Calculation:
Novelty_Score = Base_Novelty - Redundancy_Penalty
Density_Score = Base_Density - Optional_Density_Penalty
Total_Score = Novelty_Score + Density_Score + Coherence + Alignment

🔹 Qualification Logic
≥8,000 → ✅ Qualified Open Epoch Founder
<8,000 → Not qualified, but still recognized and archived if aligned

🔹 Output Format
Return a JSON object with the following structure:
{
    "classification": ["Research"|"Development"|"Alignment"],
    "scoring": {
        "novelty": {
            "base_score": <0-2500>,
            "redundancy_penalty": <0-500>,
            "final_score": <0-2500>,
            "justification": "<explanation including which prior submissions contributed to penalty>"
        },
        "density": {
            "base_score": <0-2500>,
            "redundancy_penalty": <0-100>,
            "final_score": <0-2500>,
            "justification": "<explanation>"
        },
        "coherence": {
            "score": <0-2500>,
            "justification": "<explanation>"
        },
        "alignment": {
            "score": <0-2500>,
            "justification": "<explanation>"
        }
    },
    "total_score": <0-10000>,
    "qualified_founder": <true|false>,
    "metal_alignment": "Gold"|"Silver"|"Copper"|"Hybrid",
    "metal_justification": "<explanation>",
    "redundancy_analysis": "<which prior submissions were referenced>",
    "founder_certificate": "<markdown certificate if qualified, empty string if not>",
    "homebase_intro": "<Homebase v2.0 onboarding paragraph>"
}

Return only valid JSON, no markdown code blocks.`

    // Format archived PoCs for context
    const archivedPoCsContext = archivedPoCs.length > 0 
        ? archivedPoCs.map((poc, idx) => `
**Archived PoC #${idx + 1}:**
- Hash: ${poc.submission_hash}
- Title: ${poc.title}
- Contributor: ${poc.contributor}
- Category: ${poc.category || 'N/A'}
- Status: ${poc.status}
- Metals: ${poc.metals?.join(', ') || 'None'}
- Scores: Pod=${poc.pod_score || 'N/A'}, Novelty=${poc.novelty || 'N/A'}, Density=${poc.density || 'N/A'}, Coherence=${poc.coherence || 'N/A'}, Alignment=${poc.alignment || 'N/A'}
- Content Preview: ${(poc.text_content || poc.title).substring(0, 500)}${(poc.text_content || poc.title).length > 500 ? '...' : ''}
- Created: ${poc.created_at?.toISOString() || 'N/A'}
`).join('\n')
        : '**No prior archived PoCs found.** This is the first submission in the archive.'

    // Format tokenomics context
    const tokenomicsContext = tokenomicsInfo 
        ? `
**Current Tokenomics State:**
- Current Epoch: ${tokenomicsInfo.current_epoch}
- Total Coherence Density: ${tokenomicsInfo.total_coherence_density.toLocaleString()}
- Founder Halving Count: ${tokenomicsInfo.founder_halving_count}
- Epoch Progression: ${JSON.stringify(tokenomicsInfo.epoch_progression, null, 2)}
- Epoch Balances:
  - Founder: ${tokenomicsInfo.epoch_balances.founder?.toLocaleString() || 0} SYNTH
  - Pioneer: ${tokenomicsInfo.epoch_balances.pioneer?.toLocaleString() || 0} SYNTH
  - Community: ${tokenomicsInfo.epoch_balances.community?.toLocaleString() || 0} SYNTH
  - Ecosystem: ${tokenomicsInfo.epoch_balances.ecosystem?.toLocaleString() || 0} SYNTH

**Tokenomics Rules:**
- Total Supply: 90 Trillion SYNTH
- Epoch Distribution: Founder (50%), Pioneer (25%), Community (12.5%), Ecosystem (12.5%)
- Qualification Thresholds: Founder (≥8,000), Pioneer (≥6,000), Community (≥4,000), Ecosystem (≥0)
- Tier Multipliers: Gold (1000×), Silver (100×), Copper (1×)
- Founder Halving: Every 1M coherence density units
`
        : '**Tokenomics information not available.** Proceed with standard evaluation.'

    // Evaluation query with contribution details, archived PoCs, and tokenomics
    const evaluationQuery = `Evaluate the following Proof-of-Contribution:

**PoC Title:** ${title}
**Category:** ${category || 'scientific'}
**Contribution Class:** ${category === 'scientific' ? 'Research' : category === 'tech' ? 'Development' : 'Alignment'}

**Description/Content:**
${textContent.substring(0, 10000)}${textContent.length > 10000 ? '\n\n[Content truncated for evaluation - full content available in archive...]' : ''}

**Archived PoCs for Redundancy Check and Context:**
${archivedPoCsContext}

${tokenomicsContext}

**Instructions:**
1. Classify the contribution (Research/Development/Alignment)
2. **Redundancy Check:** Compare this submission to ALL archived PoCs listed above. Identify any overlapping content, derivative work, or similar contributions. Apply redundancy penalties (0-500 points) to Novelty based on similarity to archived PoCs. Clearly reference which archived PoCs contributed to the penalty.
3. Score each dimension (Novelty, Density, Coherence, Alignment) on 0-2,500 scale
4. Apply redundancy penalties to Novelty (0-500 points) based on archived PoC comparison
5. Calculate total score (sum of all four dimensions)
6. Determine Founder qualification (≥8,000 total score)
7. Recommend metal alignment (Gold/Silver/Copper/Hybrid) based on scores and tokenomics rules
8. **Tokenomics Recommendation:** Based on the current tokenomics state, recommend:
   - Eligible epoch(s) for allocation
   - Suggested token allocation amount (considering tier multipliers and epoch balances)
   - Allocation distribution across epochs if multiple epochs are eligible
   - Note: Token allocation requires human admin approval before execution
9. Generate Founder Certificate in markdown format if qualified
10. Provide Homebase v2.0 introduction paragraph

**Important:** When checking redundancy, reference specific archived PoCs by their hash or title. Be thorough in comparing content, concepts, and contributions.

Return your complete evaluation as a valid JSON object matching the specified structure, including a "tokenomics_recommendation" field with allocation details.`
    
    try {
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
                temperature: 0.0, // Deterministic evaluation
                max_tokens: 2000,
            }),
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Grok API error (${response.status}): ${errorText}`)
        }
        
        const data = await response.json()
        const answer = data.choices[0]?.message?.content || ''
        
        debug('EvaluateWithGrok', 'Grok API response received', { 
            responseLength: answer.length,
            preview: answer.substring(0, 200)
        })
        
        // Extract JSON from response (might be wrapped in markdown)
        let jsonMatch = answer.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            // Try to parse entire response as JSON
            jsonMatch = [answer]
        }
        
        const evaluation = JSON.parse(jsonMatch[0])
        
        // Extract scoring from new format
        const scoring = evaluation.scoring || {}
        const novelty = scoring.novelty || {}
        const density = scoring.density || {}
        const coherence = scoring.coherence || {}
        const alignment = scoring.alignment || {}
        
        // Extract scores (handle both old and new format)
        const noveltyScore = novelty.final_score ?? novelty.score ?? evaluation.novelty ?? 0
        const densityScore = density.final_score ?? density.score ?? evaluation.density ?? 0
        const coherenceScore = coherence.score ?? evaluation.coherence ?? 0
        const alignmentScore = alignment.score ?? evaluation.alignment ?? 0
        
        // Calculate total score if not provided
        let pod_score = evaluation.total_score ?? evaluation.pod_score ?? evaluation.poc_score ?? 0
        if (!pod_score || pod_score === 0) {
            pod_score = noveltyScore + densityScore + coherenceScore + alignmentScore
        }
        
        // Calculate redundancy penalty (from Novelty penalty)
        const redundancyPenalty = novelty.redundancy_penalty ?? 0
        const redundancy = redundancyPenalty // Use penalty as redundancy metric
        
        // Extract metal alignment
        let metals: string[] = []
        const metalAlignment = evaluation.metal_alignment || evaluation.metals || []
        if (Array.isArray(metalAlignment)) {
            metals = metalAlignment.map((m: string) => m.toLowerCase())
        } else if (typeof metalAlignment === 'string') {
            metals = [metalAlignment.toLowerCase()]
        }
        
        // Ensure we have at least one metal
        if (metals.length === 0) {
            metals = ['copper'] // Default to copper if none detected
        }
        
        // Determine qualification (≥8,000 for Founder)
        const qualified = evaluation.qualified_founder !== undefined 
            ? evaluation.qualified_founder 
            : (pod_score >= 8000)
        
        return {
            coherence: Math.max(0, Math.min(2500, coherenceScore)),
            density: Math.max(0, Math.min(2500, densityScore)),
            redundancy: Math.max(0, Math.min(500, redundancy)), // Redundancy penalty (0-500)
            pod_score: Math.max(0, Math.min(10000, pod_score)),
            metals,
            qualified,
            // Additional fields from new evaluation format
            novelty: Math.max(0, Math.min(2500, noveltyScore)),
            alignment: Math.max(0, Math.min(2500, alignmentScore)),
            classification: evaluation.classification || [],
            redundancy_analysis: evaluation.redundancy_analysis || novelty.justification || '',
            metal_justification: evaluation.metal_justification || '',
            founder_certificate: evaluation.founder_certificate || '',
            homebase_intro: evaluation.homebase_intro || '',
            tokenomics_recommendation: evaluation.tokenomics_recommendation || {
                eligible_epochs: [],
                suggested_allocation: 0,
                tier_multiplier: 1,
                epoch_distribution: {},
                allocation_notes: 'Token allocation requires human admin approval',
                requires_admin_approval: true
            }
        }
    } catch (error) {
        debugError('EvaluateWithGrok', 'Grok API call failed', error)
        throw error
    }
}

