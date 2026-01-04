/**
 * Unified Vector Utilities for Syntheverse PoC Submissions
 *
 * Main entry point for vector operations including:
 * - Embedding generation
 * - 3D coordinate mapping using HHF geometry
 * - Redundancy calculations
 */

export * from './embeddings';
export * from './hhf-3d-mapping';
export * from './redundancy';

import { generateEmbedding, EmbeddingResult } from './embeddings';
import { mapTo3DCoordinates, Vector3D, HHFMappingParams } from './hhf-3d-mapping';
import { calculateRedundancy, ArchivedVector, RedundancyResult } from './redundancy';
import { debug } from '@/utils/debug';

export interface VectorizationResult {
  embedding: number[];
  vector: Vector3D;
  embeddingModel: string;
  embeddingDimensions: number;
}

/**
 * Generate complete vectorization for a submission
 * Includes embedding generation and 3D coordinate mapping
 */
export async function vectorizeSubmission(
  textContent: string,
  evaluationScores?: {
    novelty?: number;
    density?: number;
    coherence?: number;
    alignment?: number;
    pod_score?: number;
  }
): Promise<VectorizationResult> {
  debug('VectorizeSubmission', 'Starting vectorization', {
    textLength: textContent.length,
    hasScores: !!evaluationScores,
  });

  // Generate embedding
  const embeddingResult = await generateEmbedding(textContent);

  // Map to 3D coordinates using HHF geometry
  const vector = mapTo3DCoordinates({
    embedding: embeddingResult.embedding,
    ...evaluationScores,
  });

  debug('VectorizeSubmission', 'Vectorization complete', {
    model: embeddingResult.model,
    dimensions: embeddingResult.dimensions,
    vector: vector,
  });

  return {
    embedding: embeddingResult.embedding,
    vector,
    embeddingModel: embeddingResult.model,
    embeddingDimensions: embeddingResult.dimensions,
  };
}

/**
 * Get archived vectors for redundancy checking
 */
export function formatArchivedVectors(
  archivedPoCs: Array<{
    submission_hash: string;
    title: string;
    embedding?: number[] | null;
    vector_x?: number | null;
    vector_y?: number | null;
    vector_z?: number | null;
    metadata?: any;
  }>
): ArchivedVector[] {
  return archivedPoCs.map((poc) => ({
    submission_hash: poc.submission_hash,
    title: poc.title,
    embedding: poc.embedding && Array.isArray(poc.embedding) ? poc.embedding : undefined,
    vector:
      poc.vector_x !== null && poc.vector_y !== null && poc.vector_z !== null
        ? {
            x: Number(poc.vector_x),
            y: Number(poc.vector_y),
            z: Number(poc.vector_z),
          }
        : undefined,
    novelty: poc.metadata?.novelty,
    density: poc.metadata?.density,
    coherence: poc.metadata?.coherence,
    alignment: poc.metadata?.alignment,
  }));
}

/**
 * Calculate redundancy using actual vector similarity
 */
export async function calculateVectorRedundancy(
  currentText: string,
  currentEmbedding: number[],
  currentVector: Vector3D,
  archivedVectors: ArchivedVector[]
): Promise<RedundancyResult> {
  return calculateRedundancy(currentEmbedding, currentVector, archivedVectors);
}
