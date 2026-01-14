/**
 * THALET Protocol: Sovereign Score Extractor
 * 
 * NSP-First Refactoring Pattern: Single source of truth for score extraction
 * Eliminates fractalized self-similar logic errors from late toggle additions
 * 
 * Usage: Always use this instead of directly accessing pod_score, score_trace, etc.
 */

import { IntegrityValidator } from '@/utils/validation/IntegrityValidator';

/**
 * Extract sovereign score from any submission/evaluation object
 * Priority: atomic_score.final > score_trace.final_score > pod_score > 0
 * 
 * @param data - Submission, evaluation, or metadata object
 * @returns Sovereign score (atomic_score.final) or fallback, null if invalid
 */
export function extractSovereignScore(data: any): number | null {
  // Priority 1: atomic_score.final (SOVEREIGN SOURCE)
  const atomicScore = data?.atomic_score || data?.metadata?.atomic_score || data?.evaluation?.atomic_score;
  if (atomicScore) {
    try {
      return IntegrityValidator.getValidatedScore(atomicScore);
    } catch (error) {
      console.error('[THALET] atomic_score validation failed:', error);
      // Continue to fallback - don't return null yet
    }
  }

  // Priority 2: score_trace.final_score (legacy THALET)
  const scoreTrace = data?.metadata?.score_trace || data?.score_trace || data?.evaluation?.score_trace;
  if (scoreTrace?.final_score !== undefined && typeof scoreTrace.final_score === 'number') {
    return scoreTrace.final_score;
  }

  // Priority 3: pod_score (legacy field)
  const podScore = data?.pod_score ?? data?.metadata?.pod_score ?? data?.evaluation?.pod_score;
  if (podScore !== undefined && podScore !== null && typeof podScore === 'number') {
    return podScore;
  }

  // Priority 4: Default to null (not 0) to indicate missing data
  return null;
}

/**
 * Extract sovereign score with Zero-Delta mismatch detection
 * 
 * @param data - Submission/evaluation object
 * @returns Object with score and mismatch detection
 */
export function extractSovereignScoreWithValidation(data: any): {
  score: number | null;
  hasMismatch: boolean;
  mismatchDetails: string | null;
  source: 'atomic_score' | 'score_trace' | 'pod_score' | 'none';
} {
  const atomicScore = data?.atomic_score || data?.metadata?.atomic_score || data?.evaluation?.atomic_score;
  let score: number | null = null;
  let source: 'atomic_score' | 'score_trace' | 'pod_score' | 'none' = 'none';
  let hasMismatch = false;
  let mismatchDetails: string | null = null;

  // Try atomic_score first
  if (atomicScore) {
    try {
      score = IntegrityValidator.getValidatedScore(atomicScore);
      source = 'atomic_score';
      
      // ZERO-DELTA CHECK: Verify pod_score matches if it exists
      const podScore = data?.pod_score ?? data?.metadata?.pod_score ?? data?.evaluation?.pod_score;
      if (podScore !== null && podScore !== undefined && Math.abs(podScore - score) > 0.01) {
        hasMismatch = true;
        mismatchDetails = `Split-brain breach: pod_score (${podScore}) ≠ atomic_score.final (${score}). Zero-Delta violation.`;
      }
    } catch (error) {
      console.error('[THALET] atomic_score validation failed:', error);
    }
  }

  // Fallback to score_trace
  if (score === null) {
    const scoreTrace = data?.metadata?.score_trace || data?.score_trace || data?.evaluation?.score_trace;
    if (scoreTrace?.final_score !== undefined && typeof scoreTrace.final_score === 'number') {
      score = scoreTrace.final_score;
      source = 'score_trace';
    }
  }

  // Fallback to pod_score
  if (score === null) {
    const podScore = data?.pod_score ?? data?.metadata?.pod_score ?? data?.evaluation?.pod_score;
    if (podScore !== undefined && podScore !== null && typeof podScore === 'number') {
      score = podScore;
      source = 'pod_score';
    }
  }

  return { score, hasMismatch, mismatchDetails, source };
}

/**
 * Format score for display (handles null gracefully)
 */
export function formatSovereignScore(score: number | null, defaultValue: string = '0'): string {
  if (score === null || score === undefined) {
    return defaultValue;
  }
  return score.toLocaleString();
}

