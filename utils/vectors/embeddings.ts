/**
 * Vector Embedding Generation for Syntheverse PoC Submissions
 *
 * Generates embeddings for text content to enable semantic similarity
 * and 3D vector mapping in the holographic hydrogen fractal sandbox.
 */

import { debug, debugError } from '@/utils/debug';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
}

/**
 * Generate embedding using OpenAI API (if key is available)
 * Falls back to simple text-based hashing if no API key
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResult> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
    debug('GenerateEmbedding', 'No OpenAI API key found, using fallback text-based embedding');
    return generateFallbackEmbedding(text);
  }

  try {
    debug('GenerateEmbedding', 'Generating embedding via OpenAI API', {
      textLength: text.length,
      model,
    });

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text.substring(0, 8000), // OpenAI has token limits
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const embedding = data.data[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from OpenAI API');
    }

    debug('GenerateEmbedding', 'OpenAI embedding generated', {
      dimensions: embedding.length,
    });

    return {
      embedding,
      model,
      dimensions: embedding.length,
    };
  } catch (error) {
    debugError('GenerateEmbedding', 'Failed to generate OpenAI embedding, using fallback', error);
    return generateFallbackEmbedding(text);
  }
}

/**
 * Fallback embedding generator using simple text hashing
 * Creates a deterministic vector representation based on text content
 * This is a simple approximation for when OpenAI API is not available
 */
function generateFallbackEmbedding(text: string, dimensions: number = 384): EmbeddingResult {
  // Simple hash-based embedding (deterministic but not semantic)
  const normalized = text.toLowerCase().trim();
  const embedding: number[] = new Array(dimensions).fill(0);

  // Create pseudo-embedding by hashing chunks of text
  const chunkSize = Math.max(1, Math.floor(normalized.length / dimensions));
  for (let i = 0; i < dimensions; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, normalized.length);
    const chunk = normalized.substring(start, end);

    // Simple hash function
    let hash = 0;
    for (let j = 0; j < chunk.length; j++) {
      const char = chunk.charCodeAt(j);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Normalize to [-1, 1] range
    embedding[i] = Math.tanh(hash / 1000000);
  }

  return {
    embedding,
    model: 'fallback-hash',
    dimensions,
  };
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimensions mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate Euclidean distance between two embeddings
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Embedding dimensions mismatch: ${a.length} vs ${b.length}`);
  }

  let sumSquaredDiffs = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumSquaredDiffs += diff * diff;
  }

  return Math.sqrt(sumSquaredDiffs);
}
