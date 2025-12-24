/**
 * Redundancy Calculation Using Vector Similarity
 * 
 * Calculates redundancy between submissions using 3D vector coordinates
 * and embedding similarity in the holographic hydrogen fractal sandbox.
 */

import { cosineSimilarity, euclideanDistance } from './embeddings'
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
    
    // Calculate similarities to all archived vectors
    for (const archived of archivedVectors) {
        let embeddingSimilarity = 0
        let vectorDistance = Infinity
        let vectorSimilarity = 0
        
        // Calculate embedding similarity if available
        if (archived.embedding && archived.embedding.length > 0) {
            try {
                embeddingSimilarity = cosineSimilarity(currentEmbedding, archived.embedding)
            } catch (error) {
                debug('CalculateRedundancy', 'Error calculating embedding similarity', error)
            }
        }
        
        // Calculate 3D vector distance if available
        if (archived.vector) {
            vectorDistance = distance3D(currentVector, archived.vector)
            vectorSimilarity = similarityFromDistance(vectorDistance)
        }
        
        // Combined similarity: average of embedding and vector similarity
        // Weight embedding similarity more if both are available
        const combinedSimilarity = archived.embedding && archived.vector
            ? (embeddingSimilarity * 0.7 + vectorSimilarity * 0.3)
            : embeddingSimilarity > 0
                ? embeddingSimilarity
                : vectorSimilarity
        
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
    
    // Map similarity to redundancy percentage
    // Similarity 0.0-0.3: 0-25% penalty (low similarity)
    // Similarity 0.3-0.6: 25-50% penalty (moderate similarity)
    // Similarity 0.6-0.8: 50-75% penalty (high similarity)
    // Similarity 0.8-1.0: 75-100% penalty (very high similarity/duplicate)
    let redundancyPercent = 0
    if (maxSimilarity >= 0.8) {
        redundancyPercent = 75 + (maxSimilarity - 0.8) * 125 // 75-100%
    } else if (maxSimilarity >= 0.6) {
        redundancyPercent = 50 + (maxSimilarity - 0.6) * 125 // 50-75%
    } else if (maxSimilarity >= 0.3) {
        redundancyPercent = 25 + (maxSimilarity - 0.3) * 83.33 // 25-50%
    } else {
        redundancyPercent = maxSimilarity * 83.33 // 0-25%
    }
    
    redundancyPercent = Math.min(100, Math.max(0, redundancyPercent))
    
    // Generate analysis text
    const closestVectors = topSimilar.map(sim => ({
        hash: sim.hash,
        title: sim.title,
        similarity: sim.combinedSimilarity,
        distance: sim.vectorDistance || 0,
    }))
    
    let analysis = `Redundancy analysis based on 3D vector similarity in holographic hydrogen fractal sandbox:\n`
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

