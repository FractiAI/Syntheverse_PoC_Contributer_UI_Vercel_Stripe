import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { debug, debugError } from '@/utils/debug'
import { distance3D, similarityFromDistance } from '@/utils/vectors/hhf-3d-mapping'

export async function GET(request: NextRequest) {
    debug('SandboxMap', 'Fetching sandbox map data with 3D vectors')
    
    try {
        // Get all contributions with vector data
        const contributions = await db
            .select({
                submission_hash: contributionsTable.submission_hash,
                title: contributionsTable.title,
                contributor: contributionsTable.contributor,
                status: contributionsTable.status,
                category: contributionsTable.category,
                metals: contributionsTable.metals,
                metadata: contributionsTable.metadata,
                vector_x: contributionsTable.vector_x,
                vector_y: contributionsTable.vector_y,
                vector_z: contributionsTable.vector_z,
                embedding: contributionsTable.embedding,
                created_at: contributionsTable.created_at,
            })
            .from(contributionsTable)
        
        // Generate nodes from contributions with 3D vector coordinates
        const nodes = contributions.map(contrib => ({
            id: contrib.submission_hash,
            submission_hash: contrib.submission_hash,
            title: contrib.title,
            contributor: contrib.contributor,
            status: contrib.status,
            category: contrib.category,
            metals: (contrib.metals as string[]) || [],
            // 3D vector coordinates for visualization
            vector: contrib.vector_x !== null && contrib.vector_y !== null && contrib.vector_z !== null
                ? {
                    x: Number(contrib.vector_x),
                    y: Number(contrib.vector_y),
                    z: Number(contrib.vector_z),
                }
                : null,
            // Evaluation scores
            scores: {
                coherence: (contrib.metadata as any)?.coherence,
                density: (contrib.metadata as any)?.density,
                novelty: (contrib.metadata as any)?.novelty,
                alignment: (contrib.metadata as any)?.alignment,
                pod_score: (contrib.metadata as any)?.pod_score,
                redundancy: (contrib.metadata as any)?.redundancy,
            },
            created_at: contrib.created_at?.toISOString(),
        }))
        
        // Generate edges based on 3D vector similarity
        const edges: Array<{
            source: string
            target: string
            similarity_score: number
            distance: number
            overlap_type: string
        }> = []
        
        // Calculate edges based on 3D vector proximity
        const vectorizedNodes = nodes.filter(n => n.vector !== null)
        
        for (let i = 0; i < vectorizedNodes.length; i++) {
            for (let j = i + 1; j < vectorizedNodes.length; j++) {
                const nodeA = vectorizedNodes[i]
                const nodeB = vectorizedNodes[j]
                
                if (nodeA.vector && nodeB.vector) {
                    // Calculate 3D distance
                    const distance = distance3D(nodeA.vector, nodeB.vector)
                    const similarity = similarityFromDistance(distance)
                    
                    // Only create edge if similarity is above threshold (0.3 = 30% similar)
                    if (similarity > 0.3) {
                        // Determine overlap type
                        let overlapType = 'vector_similarity'
                        if (nodeA.contributor === nodeB.contributor) {
                            overlapType = 'same_contributor'
                        } else if (nodeA.category === nodeB.category && nodeA.category) {
                            overlapType = 'same_category'
                        }
                        
                        edges.push({
                            source: nodeA.submission_hash,
                            target: nodeB.submission_hash,
                            similarity_score: similarity,
                            distance: distance,
                            overlap_type: overlapType,
                        })
                    }
                }
            }
        }
        
        // Also add edges for same contributor (even without vectors)
        const contributorMap = new Map<string, string[]>()
        contributions.forEach(contrib => {
            if (!contributorMap.has(contrib.contributor)) {
                contributorMap.set(contrib.contributor, [])
            }
            contributorMap.get(contrib.contributor)!.push(contrib.submission_hash)
        })
        
        contributorMap.forEach((hashes, contributor) => {
            for (let i = 0; i < hashes.length; i++) {
                for (let j = i + 1; j < hashes.length; j++) {
                    // Check if edge already exists
                    const exists = edges.some(e => 
                        (e.source === hashes[i] && e.target === hashes[j]) ||
                        (e.source === hashes[j] && e.target === hashes[i])
                    )
                    if (!exists) {
                        edges.push({
                            source: hashes[i],
                            target: hashes[j],
                            similarity_score: 0.4, // Lower score for contributor-only connection
                            distance: 0,
                            overlap_type: 'contributor'
                        })
                    }
                }
            }
        })
        
        const sandboxMap = {
            nodes,
            edges,
            metadata: {
                total_nodes: nodes.length,
                total_edges: edges.length,
                vectorized_nodes: vectorizedNodes.length,
                coordinate_system: 'HHF 3D Holographic Hydrogen Fractal Sandbox',
                hhf_constant: 'Λᴴᴴ ≈ 1.12 × 10²²',
                generated_at: new Date().toISOString()
            }
        }
        
        debug('SandboxMap', 'Sandbox map generated with 3D vectors', {
            nodes: nodes.length,
            edges: edges.length,
            vectorized: vectorizedNodes.length
        })
        
        return NextResponse.json(sandboxMap)
    } catch (error) {
        debugError('SandboxMap', 'Error generating sandbox map', error)
        return NextResponse.json(
            { error: 'Failed to generate sandbox map', message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}



