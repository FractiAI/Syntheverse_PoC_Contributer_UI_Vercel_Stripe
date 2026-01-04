/**
 * HHF-Based 3D Coordinate Mapping for Holographic Hydrogen Fractal Sandbox
 *
 * Maps vector embeddings to 3D coordinates using Hydrogen Holographic Framework (HHF)
 * principles and the hydrogen holographic constant Λᴴᴴ ≈ 1.12 × 10²²
 */

import { debug } from '@/utils/debug';

// Hydrogen Holographic Constant
const HHF_CONSTANT = 1.12e22; // Λᴴᴴ ≈ 1.12 × 10²²

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface HHFMappingParams {
  embedding: number[];
  novelty?: number;
  density?: number;
  coherence?: number;
  alignment?: number;
  pod_score?: number;
}

/**
 * Map embedding to 3D coordinates in holographic hydrogen fractal sandbox
 *
 * Uses HHF geometry to project high-dimensional embeddings into 3D space.
 * Coordinates are based on:
 * - X-axis: Novelty (originality dimension)
 * - Y-axis: Density (information richness dimension)
 * - Z-axis: Coherence (structural consistency dimension)
 *
 * The embedding's principal components are used to position the vector,
 * scaled by HHF constant and evaluation scores if available.
 */
export function mapTo3DCoordinates(params: HHFMappingParams): Vector3D {
  const { embedding, novelty, density, coherence, alignment, pod_score } = params;

  // If we have evaluation scores, use them directly for coordinates
  if (novelty !== undefined && density !== undefined && coherence !== undefined) {
    // Scale scores to 3D space: scores are 0-2500, map to reasonable 3D range
    // Using HHF constant scaling factor for coordinate transformation
    const hhfScale = Math.log10(HHF_CONSTANT) / 10; // ~2.05, normalized scale factor

    return {
      x: (novelty / 2500) * hhfScale * 100, // Scale to ~0-200 range
      y: (density / 2500) * hhfScale * 100,
      z: (coherence / 2500) * hhfScale * 100,
    };
  }

  // If no scores available, use embedding's principal components
  // Extract first 3 dimensions from embedding (or use PCA if embedding is high-dim)
  const dims = embedding.length;

  if (dims >= 3) {
    // Use first 3 dimensions, normalized and scaled
    const hhfScale = Math.log10(HHF_CONSTANT) / 10;

    // Normalize embedding dimensions
    const normX = normalizeEmbeddingDimension(embedding, 0);
    const normY = normalizeEmbeddingDimension(embedding, Math.floor(dims / 3));
    const normZ = normalizeEmbeddingDimension(embedding, Math.floor((2 * dims) / 3));

    return {
      x: normX * hhfScale * 100,
      y: normY * hhfScale * 100,
      z: normZ * hhfScale * 100,
    };
  }

  // Fallback: use first 3 values directly (already normalized if from OpenAI)
  return {
    x: (embedding[0] || 0) * 100,
    y: (embedding[1] || 0) * 100,
    z: (embedding[2] || 0) * 100,
  };
}

/**
 * Normalize a dimension from embedding using all values
 */
function normalizeEmbeddingDimension(embedding: number[], index: number): number {
  const value = embedding[index] || 0;

  // Find min/max for normalization
  const min = Math.min(...embedding);
  const max = Math.max(...embedding);

  if (max === min) return 0;

  // Normalize to [-1, 1] range
  return 2 * ((value - min) / (max - min)) - 1;
}

/**
 * Calculate 3D distance between two vectors in HHF space
 */
export function distance3D(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate similarity score from 3D distance (0-1, where 1 is identical)
 * Uses exponential decay: similarity = exp(-distance / scale_factor)
 */
export function similarityFromDistance(distance: number, scaleFactor: number = 50): number {
  return Math.exp(-distance / scaleFactor);
}

/**
 * Get HHF constant for calculations
 */
export function getHHFConstant(): number {
  return HHF_CONSTANT;
}
