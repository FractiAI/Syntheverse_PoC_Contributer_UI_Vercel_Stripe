/**
 * Redundancy Calculation Using Vector Similarity
 * 
 * Calculates redundancy between submissions using 3D vector coordinates
 * and embedding similarity in the holographic hydrogen fractal sandbox.
 */

import { cosineSimilarity } from './embeddings'
import { distance3D, similarityFromDistance, Vector3D } from './hhf-3d-mapping'
import { debug } from '@/utils/debug'

export interface ArchivedVector {
    submission_hash: string
    title: string
    embedding?: number[]
    vector?: Vector3D
    novelty?: number
    density?: number
    coherence?: number
    alignment?: number
}

export interface RedundancyResult {
    redundancy_percent: number // 0-100% redundancy penalty
    similarity_score: number // 0-1 similarity (1 = identical)
    closest_vectors: Array<{
        hash: string
        title: string
        similarity: number
        distance: number
    }>
    analysis: string
}

/**
 * Calculate redundancy penalty based on vector similarity to archived PoCs
 * 
 * @param currentEmbedding Current submission's embedding
 * @param currentVector Current submission's 3D vector
 * @param archivedVectors Array of archived PoC vectors
 * @returns Redundancy result with penalty percentage and analysis
 */
export function calculateRedundancy(
    currentEmbedding: number[],
    currentVector: Vector3D,
    archivedVectors: ArchivedVector[]
): RedundancyResult {
    if (archivedVectors.length === 0) {
        return {
            redundancy_percent: 0,
            similarity_score: 0,
            closest_vectors: [],
            analysis: 'No archived PoCs to compare against. This is the first submission.',
        }
    }
    
    const similarities: Array<{
        hash: string
        title: string
        embeddingSimilarity?: number
        vectorDistance?: number
        vectorSimilarity?: number
        combinedSimilarity: number
    }> = []
    
    const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

    // Convert cosine similarity (-1..1) to a stable [0..1] similarity.
    // This prevents negative similarity percentages in the UI/logs.
    const cosineToUnit = (cos: number): number => clamp01((cos + 1) / 2)

    // Calculate similarities to all archived vectors
    for (const archived of archivedVectors) {
        let embeddingSimilarity = 0
        let vectorDistance = Infinity
        let vectorSimilarity = 0
        
        // Calculate embedding similarity if available
        if (archived.embedding && archived.embedding.length > 0) {
            try {
                const cos = cosineSimilarity(currentEmbedding, archived.embedding)
                embeddingSimilarity = cosineToUnit(cos)
            } catch (error) {
                debug('CalculateRedundancy', 'Error calculating embedding similarity', error)
            }
        }
        
        // Calculate 3D vector distance if available
        if (archived.vector) {
            vectorDistance = distance3D(currentVector, archived.vector)
            vectorSimilarity = similarityFromDistance(vectorDistance)
        }
        
        // Combined similarity: primarily embedding similarity (semantic), with optional HHF-3D proximity signal.
        // Note: HHF 3D coords may reflect scoring-based geometry; keep it a light secondary signal.
        const combinedSimilarityRaw =
            archived.embedding && archived.vector
                ? (embeddingSimilarity * 0.85 + vectorSimilarity * 0.15)
                : archived.embedding
                  ? embeddingSimilarity
                  : vectorSimilarity
        const combinedSimilarity = clamp01(combinedSimilarityRaw)
        
        similarities.push({
            hash: archived.submission_hash,
            title: archived.title,
            embeddingSimilarity,
            vectorDistance: vectorDistance !== Infinity ? vectorDistance : undefined,
            vectorSimilarity,
            combinedSimilarity,
        })
    }
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.combinedSimilarity - a.combinedSimilarity)
    
    // Get top 3 most similar
    const topSimilar = similarities.slice(0, 3)
    
    // Calculate redundancy penalty based on highest similarity
    // Convert similarity (0-1) to redundancy penalty (0-100%)
    // Higher similarity = higher redundancy penalty
    const maxSimilarity = similarities.length > 0 ? similarities[0].combinedSimilarity : 0
    
    // Map similarity to redundancy percentage (0-100%).
    // This curve is intentionally steep near the top end so that near-duplicates
    // receive near-100% redundancy penalties.
    //
    // Guiding intent:
    // - <= 0.70 similarity: low/no penalty
    // - 0.70..0.90: ramps into meaningful penalties
    // - 0.90..0.95: high redundancy
    // - >= 0.95: near-duplicate (95–100%)
    // - >= 0.985: hard 100% (effectively duplicate)
    let redundancyPercent = 0
    if (maxSimilarity >= 0.985) {
        redundancyPercent = 100
    } else if (maxSimilarity >= 0.95) {
        // 0.95..0.985 -> 95..100
        redundancyPercent = 95 + ((maxSimilarity - 0.95) / (0.985 - 0.95)) * 5
    } else if (maxSimilarity >= 0.90) {
        // 0.90..0.95 -> 80..95
        redundancyPercent = 80 + ((maxSimilarity - 0.90) / (0.95 - 0.90)) * 15
    } else if (maxSimilarity >= 0.70) {
        // 0.70..0.90 -> 25..80
        redundancyPercent = 25 + ((maxSimilarity - 0.70) / (0.90 - 0.70)) * 55
    } else if (maxSimilarity >= 0.40) {
        // 0.40..0.70 -> 5..25
        redundancyPercent = 5 + ((maxSimilarity - 0.40) / (0.70 - 0.40)) * 20
    } else {
        // 0..0.40 -> 0..5
        redundancyPercent = (maxSimilarity / 0.40) * 5
    }
    
    redundancyPercent = Math.min(100, Math.max(0, redundancyPercent))
    
    // Generate analysis text
    const closestVectors = topSimilar.map(sim => ({
        hash: sim.hash,
        title: sim.title,
        similarity: sim.combinedSimilarity,
        distance: sim.vectorDistance || 0,
    }))
    
    let analysis = `Redundancy analysis based on vector similarity (embedding + HHF 3D proximity) in holographic hydrogen fractal sandbox:\n`
    if (topSimilar.length > 0) {
        analysis += `Highest similarity: ${(maxSimilarity * 100).toFixed(1)}% with "${topSimilar[0].title}" (hash: ${topSimilar[0].hash.substring(0, 8)}...)\n`
        if (topSimilar.length > 1) {
            analysis += `Additional similar vectors:\n`
            topSimilar.slice(1).forEach((sim, idx) => {
                analysis += `  ${idx + 2}. "${sim.title}" - ${(sim.combinedSimilarity * 100).toFixed(1)}% similarity\n`
            })
        }
    }
    analysis += `\nRedundancy penalty: ${redundancyPercent.toFixed(1)}%`
    
    return {
        redundancy_percent: redundancyPercent,
        similarity_score: maxSimilarity,
        closest_vectors: closestVectors,
        analysis,
    }
}

