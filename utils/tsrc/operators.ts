/**
 * TSRC Operator Hygiene
 * O_kiss (isotropic) and O_axis (orthogonal channels) operator tracking
 * 
 * Key principles:
 * - O_kiss: Direction-agnostic similarity (embedding_cosine)
 * - O_axis: Per-axis overlap tracking (N, D, C, A channels)
 * - Always log operator name, version, embedding model, and snapshot
 */

import { debug } from '@/utils/debug';
import type { IsotropicOperator, OrthogonalOperator, AxisChannel } from './types';

// ============================================================================
// O_kiss: Isotropic Operator
// ============================================================================

/**
 * Create isotropic operator record (O_kiss)
 * Used for direction-agnostic similarity measurement
 * 
 * @param operatorName Name of the operator (e.g., "embedding_cosine")
 * @param operatorVersion Version of the operator implementation
 * @param embeddingModel Embedding model configuration
 * @param metric Similarity metric used
 * @returns Isotropic operator record
 */
export function createIsotropicOperator(
  operatorName: string,
  operatorVersion: string,
  embeddingModel: {
    name: string;
    version: string;
    provider: string;
  },
  metric: 'cosine' | 'euclidean' | 'manhattan' = 'cosine'
): IsotropicOperator {
  const operator: IsotropicOperator = {
    operator_type: 'O_kiss',
    operator_name: operatorName,
    operator_version: operatorVersion,
    embedding_model: embeddingModel,
    metric,
    computed_at: new Date().toISOString(),
  };
  
  debug('TSRC:Operator', 'Created isotropic operator (O_kiss)', {
    name: operatorName,
    version: operatorVersion,
    metric,
  });
  
  return operator;
}

// ============================================================================
// O_axis: Orthogonal Channel Operator
// ============================================================================

/**
 * Create orthogonal operator record (O_axis)
 * Used for per-axis overlap tracking with independent channels
 * 
 * @param operatorName Name of the operator (e.g., "per_axis_overlap")
 * @param operatorVersion Version of the operator implementation
 * @param axisChannels Per-axis proximity data
 * @param aggregationRule How to combine axes
 * @returns Orthogonal operator record
 */
export function createOrthogonalOperator(
  operatorName: string,
  operatorVersion: string,
  axisChannels: {
    novelty: AxisChannel;
    density: AxisChannel;
    coherence: AxisChannel;
    alignment: AxisChannel;
  },
  aggregationRule: 'max' | 'weighted_sum' | 'tiered_thresholds' = 'max'
): OrthogonalOperator {
  const operator: OrthogonalOperator = {
    operator_type: 'O_axis',
    operator_name: operatorName,
    operator_version: operatorVersion,
    axes: axisChannels,
    aggregation_rule: aggregationRule,
    computed_at: new Date().toISOString(),
  };
  
  debug('TSRC:Operator', 'Created orthogonal operator (O_axis)', {
    name: operatorName,
    version: operatorVersion,
    aggregation: aggregationRule,
    flagged_axes: Object.entries(axisChannels)
      .filter(([_, channel]) => channel.flagged)
      .map(([name, _]) => name),
  });
  
  return operator;
}

/**
 * Compute per-axis overlap from raw scores and archive data
 * This is diagnostic-only for now (Phase 1)
 * 
 * @param currentScores Current submission's raw scores
 * @param archiveScores Array of archived submission scores
 * @param thresholds Per-axis redundancy thresholds
 * @returns Axis channels with proximity data
 */
export function computePerAxisOverlap(
  currentScores: {
    novelty: number;
    density: number;
    coherence: number;
    alignment: number;
  },
  archiveScores: Array<{
    submission_hash: string;
    novelty: number;
    density: number;
    coherence: number;
    alignment: number;
  }>,
  thresholds: {
    novelty: number;
    density: number;
    coherence: number;
    alignment: number;
  } = {
    novelty: 0.15, // 15% proximity threshold
    density: 0.15,
    coherence: 0.15,
    alignment: 0.15,
  }
): {
  novelty: AxisChannel;
  density: AxisChannel;
  coherence: AxisChannel;
  alignment: AxisChannel;
} {
  const computeAxisProximity = (
    axisName: 'N' | 'D' | 'C' | 'A',
    currentValue: number,
    archiveValues: Array<{ hash: string; value: number }>,
    threshold: number
  ): AxisChannel => {
    // Find closest matches on this axis
    const proximities = archiveValues.map(item => ({
      hash: item.hash,
      distance: Math.abs(currentValue - item.value),
      proximity: 1 - Math.abs(currentValue - item.value), // 0-1 scale
    }));
    
    // Sort by proximity (highest first)
    proximities.sort((a, b) => b.proximity - a.proximity);
    
    // Get top proximity score
    const topProximity = proximities.length > 0 ? proximities[0].proximity : 0;
    
    // Find submissions within threshold
    const contributing = proximities
      .filter(p => p.distance <= threshold)
      .map(p => p.hash);
    
    return {
      axis_name: axisName,
      proximity_score: topProximity,
      flagged: topProximity >= (1 - threshold), // Flag if within threshold
      threshold,
      contributing_submissions: contributing,
    };
  };
  
  // Extract per-axis data
  const noveltyData = archiveScores.map(s => ({ hash: s.submission_hash, value: s.novelty }));
  const densityData = archiveScores.map(s => ({ hash: s.submission_hash, value: s.density }));
  const coherenceData = archiveScores.map(s => ({ hash: s.submission_hash, value: s.coherence }));
  const alignmentData = archiveScores.map(s => ({ hash: s.submission_hash, value: s.alignment }));
  
  return {
    novelty: computeAxisProximity('N', currentScores.novelty, noveltyData, thresholds.novelty),
    density: computeAxisProximity('D', currentScores.density, densityData, thresholds.density),
    coherence: computeAxisProximity('C', currentScores.coherence, coherenceData, thresholds.coherence),
    alignment: computeAxisProximity('A', currentScores.alignment, alignmentData, thresholds.alignment),
  };
}

/**
 * Aggregate per-axis overlaps into a single redundancy signal
 * 
 * @param axisChannels Per-axis proximity data
 * @param aggregationRule How to combine axes
 * @param weights Optional weights for weighted_sum
 * @returns Aggregated redundancy score (0-1)
 */
export function aggregateAxisOverlaps(
  axisChannels: {
    novelty: AxisChannel;
    density: AxisChannel;
    coherence: AxisChannel;
    alignment: AxisChannel;
  },
  aggregationRule: 'max' | 'weighted_sum' | 'tiered_thresholds',
  weights?: {
    novelty: number;
    density: number;
    coherence: number;
    alignment: number;
  }
): number {
  const scores = [
    axisChannels.novelty.proximity_score,
    axisChannels.density.proximity_score,
    axisChannels.coherence.proximity_score,
    axisChannels.alignment.proximity_score,
  ];
  
  switch (aggregationRule) {
    case 'max':
      // Take the maximum proximity (most restrictive)
      return Math.max(...scores);
    
    case 'weighted_sum':
      // Weighted average
      const w = weights || { novelty: 0.25, density: 0.25, coherence: 0.25, alignment: 0.25 };
      return (
        axisChannels.novelty.proximity_score * w.novelty +
        axisChannels.density.proximity_score * w.density +
        axisChannels.coherence.proximity_score * w.coherence +
        axisChannels.alignment.proximity_score * w.alignment
      );
    
    case 'tiered_thresholds':
      // Tiered: if any axis is flagged, use max; otherwise use average
      const anyFlagged = Object.values(axisChannels).some(ch => ch.flagged);
      if (anyFlagged) {
        return Math.max(...scores);
      } else {
        return scores.reduce((sum, s) => sum + s, 0) / scores.length;
      }
    
    default:
      return Math.max(...scores);
  }
}

/**
 * Generate diagnostic report for per-axis overlap
 * This is the "axis audit view" mentioned in the feedback
 * 
 * @param axisChannels Per-axis proximity data
 * @returns Human-readable diagnostic report
 */
export function generateAxisAuditReport(
  axisChannels: {
    novelty: AxisChannel;
    density: AxisChannel;
    coherence: AxisChannel;
    alignment: AxisChannel;
  }
): string {
  const lines: string[] = [
    '=== AXIS AUDIT REPORT (O_axis) ===',
    '',
    'Per-Axis Proximity Analysis:',
  ];
  
  const axes = [
    { name: 'Novelty (N)', channel: axisChannels.novelty },
    { name: 'Density (D)', channel: axisChannels.density },
    { name: 'Coherence (C)', channel: axisChannels.coherence },
    { name: 'Alignment (A)', channel: axisChannels.alignment },
  ];
  
  for (const { name, channel } of axes) {
    const status = channel.flagged ? '🚨 FLAGGED' : '✅ OK';
    const proximityPercent = (channel.proximity_score * 100).toFixed(1);
    const thresholdPercent = ((1 - channel.threshold) * 100).toFixed(1);
    
    lines.push(`  ${name}: ${proximityPercent}% proximity (threshold: ${thresholdPercent}%) ${status}`);
    
    if (channel.flagged && channel.contributing_submissions.length > 0) {
      lines.push(`    Contributing submissions: ${channel.contributing_submissions.slice(0, 3).join(', ')}`);
      if (channel.contributing_submissions.length > 3) {
        lines.push(`    ... and ${channel.contributing_submissions.length - 3} more`);
      }
    }
  }
  
  lines.push('');
  lines.push('Recommendation:');
  const flaggedAxes = axes.filter(a => a.channel.flagged).map(a => a.name);
  if (flaggedAxes.length === 0) {
    lines.push('  All axes clear. No redundancy detected.');
  } else {
    lines.push(`  Redundancy detected on: ${flaggedAxes.join(', ')}`);
    lines.push('  Consider reviewing contributions on these specific dimensions.');
  }
  
  return lines.join('\n');
}

