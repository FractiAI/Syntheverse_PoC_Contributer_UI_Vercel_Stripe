/**
 * TSRC Stability Monitoring and Mode Transitions
 * Implements the "Enough" mechanism with automatic stability triggers
 * 
 * Key principles:
 * - Growth increases demand, demand saturates constraints
 * - Pressure rises and stability margin collapses
 * - Transition operator T triggers safe-mode reconfiguration
 * - All automatic transitions must be monotone-tightening
 * - Any widening requires governance-plane approval
 */

import { debug, debugError } from '@/utils/debug';
import type { ModeState, StabilityTriggers, ModeTransition } from './types';

// ============================================================================
// STABILITY MONITORING
// ============================================================================

/**
 * Compute current stability triggers from system metrics
 * 
 * @param metrics Current system metrics
 * @returns Stability trigger signals
 */
export function computeStabilityTriggers(metrics: {
  total_submissions: number;
  clamped_submissions: number;
  overlap_scores: number[]; // Recent overlap scores
  submissions_per_day: number;
  capacity_geometric: number; // C_geom
  demand: number; // D
  archive_size: number;
}): StabilityTriggers {
  // Clamp rate: fraction of submissions being clamped
  const clamp_rate = metrics.total_submissions > 0
    ? metrics.clamped_submissions / metrics.total_submissions
    : 0;
  
  // Overlap distribution drift
  const mean_overlap = metrics.overlap_scores.length > 0
    ? metrics.overlap_scores.reduce((sum, s) => sum + s, 0) / metrics.overlap_scores.length
    : 0;
  
  const variance_overlap = metrics.overlap_scores.length > 0
    ? metrics.overlap_scores.reduce((sum, s) => sum + Math.pow(s - mean_overlap, 2), 0) / metrics.overlap_scores.length
    : 0;
  
  // Pressure: ρ = D/C_geom
  const pressure = metrics.capacity_geometric > 0
    ? metrics.demand / metrics.capacity_geometric
    : 0;
  
  // Stability margin: γ (distance from critical thresholds)
  // Higher is better; < 0.2 is concerning
  const stability_margin = Math.max(
    0,
    1 - pressure, // Pressure margin
    1 - clamp_rate, // Clamp margin
  );
  
  // Accumulation: A (rate of archive growth)
  const accumulation = metrics.submissions_per_day;
  
  return {
    clamp_rate,
    clamp_rate_threshold: 0.3, // Alarm if >30% submissions are clamped
    overlap_drift: {
      mean_shift: mean_overlap - 0.5, // Deviation from expected 0.5
      variance_change: variance_overlap - 0.05, // Deviation from expected variance
    },
    growth_rate: metrics.submissions_per_day,
    pressure,
    stability_margin,
    accumulation,
  };
}

/**
 * Evaluate if a mode transition should be triggered
 * 
 * @param triggers Current stability triggers
 * @param currentMode Current mode state
 * @returns Recommended mode transition (if any)
 */
export function evaluateModeTransition(
  triggers: StabilityTriggers,
  currentMode: ModeState
): ModeState | null {
  // Growth → Saturation triggers
  if (currentMode === 'growth') {
    if (
      triggers.clamp_rate > triggers.clamp_rate_threshold ||
      triggers.pressure > 0.7 ||
      triggers.stability_margin < 0.3
    ) {
      debug('TSRC:Stability', 'Transition recommended: growth → saturation', {
        clamp_rate: triggers.clamp_rate,
        pressure: triggers.pressure,
        stability_margin: triggers.stability_margin,
      });
      return 'saturation';
    }
  }
  
  // Saturation → Safe Mode triggers
  if (currentMode === 'saturation') {
    if (
      triggers.clamp_rate > 0.5 || // >50% clamped
      triggers.pressure > 0.9 ||
      triggers.stability_margin < 0.15
    ) {
      debug('TSRC:Stability', 'Transition recommended: saturation → safe_mode', {
        clamp_rate: triggers.clamp_rate,
        pressure: triggers.pressure,
        stability_margin: triggers.stability_margin,
      });
      return 'safe_mode';
    }
  }
  
  // Safe Mode → Saturation (recovery)
  // This requires governance approval as it's a widening transition
  if (currentMode === 'safe_mode') {
    if (
      triggers.clamp_rate < 0.2 &&
      triggers.pressure < 0.6 &&
      triggers.stability_margin > 0.4
    ) {
      debug('TSRC:Stability', 'Recovery conditions met: safe_mode → saturation (requires governance)', {
        clamp_rate: triggers.clamp_rate,
        pressure: triggers.pressure,
        stability_margin: triggers.stability_margin,
      });
      // Don't automatically transition - return null and log for governance review
      return null;
    }
  }
  
  // Saturation → Growth (recovery)
  // This also requires governance approval as it's a widening transition
  if (currentMode === 'saturation') {
    if (
      triggers.clamp_rate < 0.1 &&
      triggers.pressure < 0.4 &&
      triggers.stability_margin > 0.6
    ) {
      debug('TSRC:Stability', 'Recovery conditions met: saturation → growth (requires governance)', {
        clamp_rate: triggers.clamp_rate,
        pressure: triggers.pressure,
        stability_margin: triggers.stability_margin,
      });
      return null;
    }
  }
  
  return null; // No transition needed
}

/**
 * Create a mode transition record
 * 
 * @param fromMode Current mode
 * @param toMode Target mode
 * @param triggers Stability triggers that prompted transition
 * @param oldConfig Old configuration
 * @param newConfig New configuration
 * @returns Mode transition record
 */
export function createModeTransition(
  fromMode: ModeState,
  toMode: ModeState,
  triggers: StabilityTriggers,
  oldConfig: any,
  newConfig: any
): ModeTransition {
  const transitionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine if transition is monotone-tightening
  const isMonotoneTightening = checkMonotoneTightening(oldConfig, newConfig);
  
  // Determine capability delta
  const capabilityDelta = determineCapabilityDelta(fromMode, toMode);
  
  // Widening transitions require governance approval
  const requiresGovernanceApproval = capabilityDelta === 'expand';
  
  const transition: ModeTransition = {
    transition_id: transitionId,
    from_mode: fromMode,
    to_mode: toMode,
    triggered_at: new Date().toISOString(),
    triggers,
    is_monotone_tightening: isMonotoneTightening,
    changes: {
      old_config: oldConfig,
      new_config: newConfig,
      capability_delta: capabilityDelta,
    },
    requires_governance_approval: requiresGovernanceApproval,
    anti_thrashing: {
      hysteresis_window: 3600, // 1 hour
      dwell_time: 1800, // 30 minutes minimum in state
      rate_limit: 3, // Max 3 transitions per hour
    },
  };
  
  debug('TSRC:Stability', 'Created mode transition', {
    transition_id: transitionId,
    from: fromMode,
    to: toMode,
    monotone_tightening: isMonotoneTightening,
    requires_governance: requiresGovernanceApproval,
  });
  
  return transition;
}

/**
 * Check if configuration change is monotone-tightening
 * Returns true if new config is strictly tighter (or equal) to old config
 * 
 * @param oldConfig Old configuration
 * @param newConfig New configuration
 * @returns True if monotone-tightening
 */
function checkMonotoneTightening(oldConfig: any, newConfig: any): boolean {
  // For now, we check common tightening patterns
  // A full implementation would use BoundLang for machine-checkable proofs
  
  // Check threshold tightenings
  if (
    newConfig.qualification_threshold > oldConfig.qualification_threshold ||
    newConfig.overlap_penalty_start < oldConfig.overlap_penalty_start ||
    newConfig.sweet_spot_tolerance < oldConfig.sweet_spot_tolerance
  ) {
    return true; // These are tightening changes
  }
  
  // Check if any loosening occurred
  if (
    newConfig.qualification_threshold < oldConfig.qualification_threshold ||
    newConfig.overlap_penalty_start > oldConfig.overlap_penalty_start ||
    newConfig.sweet_spot_tolerance > oldConfig.sweet_spot_tolerance
  ) {
    return false; // These are loosening changes
  }
  
  return true; // No changes or neutral changes
}

/**
 * Determine capability delta from mode transition
 * 
 * @param fromMode Source mode
 * @param toMode Target mode
 * @returns Capability delta
 */
function determineCapabilityDelta(
  fromMode: ModeState,
  toMode: ModeState
): 'shrink' | 'maintain' | 'expand' {
  const modeOrder = { growth: 2, saturation: 1, safe_mode: 0 };
  
  const fromLevel = modeOrder[fromMode];
  const toLevel = modeOrder[toMode];
  
  if (toLevel < fromLevel) return 'shrink'; // Tightening
  if (toLevel > fromLevel) return 'expand'; // Widening
  return 'maintain'; // No change
}

// ============================================================================
// ANTI-THRASHING
// ============================================================================

/**
 * State for tracking transition history (anti-thrashing)
 */
interface TransitionHistory {
  recent_transitions: Array<{
    timestamp: number;
    from: ModeState;
    to: ModeState;
  }>;
  last_transition_time: number;
  current_mode_entered_at: number;
}

let transitionHistory: TransitionHistory = {
  recent_transitions: [],
  last_transition_time: 0,
  current_mode_entered_at: Date.now(),
};

/**
 * Check if a transition is allowed given anti-thrashing rules
 * 
 * @param proposedTransition Proposed mode transition
 * @returns True if transition is allowed
 */
export function isTransitionAllowed(proposedTransition: ModeTransition): boolean {
  const now = Date.now();
  const { anti_thrashing } = proposedTransition;
  
  // Check dwell time: must stay in current mode for minimum duration
  const timeInCurrentMode = now - transitionHistory.current_mode_entered_at;
  if (timeInCurrentMode < anti_thrashing.dwell_time * 1000) {
    debug('TSRC:Stability', 'Transition blocked: dwell time not met', {
      time_in_mode_sec: timeInCurrentMode / 1000,
      required_dwell_sec: anti_thrashing.dwell_time,
    });
    return false;
  }
  
  // Check rate limit: max transitions per hour
  const oneHourAgo = now - anti_thrashing.hysteresis_window * 1000;
  const recentTransitionCount = transitionHistory.recent_transitions.filter(
    t => t.timestamp > oneHourAgo
  ).length;
  
  if (recentTransitionCount >= anti_thrashing.rate_limit) {
    debug('TSRC:Stability', 'Transition blocked: rate limit exceeded', {
      recent_count: recentTransitionCount,
      rate_limit: anti_thrashing.rate_limit,
    });
    return false;
  }
  
  // Check for flip-flop: don't allow immediate reversal
  if (transitionHistory.recent_transitions.length > 0) {
    const lastTransition = transitionHistory.recent_transitions[transitionHistory.recent_transitions.length - 1];
    const timeSinceLastTransition = now - lastTransition.timestamp;
    
    // Don't allow reversal within hysteresis window
    if (
      lastTransition.to === proposedTransition.from_mode &&
      lastTransition.from === proposedTransition.to_mode &&
      timeSinceLastTransition < anti_thrashing.hysteresis_window * 1000
    ) {
      debug('TSRC:Stability', 'Transition blocked: flip-flop detected', {
        last_transition: `${lastTransition.from} → ${lastTransition.to}`,
        proposed: `${proposedTransition.from_mode} → ${proposedTransition.to_mode}`,
        time_since_last_sec: timeSinceLastTransition / 1000,
      });
      return false;
    }
  }
  
  return true; // Transition allowed
}

/**
 * Record a completed transition (for anti-thrashing tracking)
 * 
 * @param transition Completed transition
 */
export function recordTransition(transition: ModeTransition): void {
  const now = Date.now();
  
  transitionHistory.recent_transitions.push({
    timestamp: now,
    from: transition.from_mode,
    to: transition.to_mode,
  });
  
  transitionHistory.last_transition_time = now;
  transitionHistory.current_mode_entered_at = now;
  
  // Clean up old transitions (keep only last hour)
  const oneHourAgo = now - 3600000;
  transitionHistory.recent_transitions = transitionHistory.recent_transitions.filter(
    t => t.timestamp > oneHourAgo
  );
  
  debug('TSRC:Stability', 'Recorded transition', {
    transition_id: transition.transition_id,
    from: transition.from_mode,
    to: transition.to_mode,
    history_size: transitionHistory.recent_transitions.length,
  });
}

/**
 * Reset transition history (for testing or manual intervention)
 */
export function resetTransitionHistory(): void {
  transitionHistory = {
    recent_transitions: [],
    last_transition_time: 0,
    current_mode_entered_at: Date.now(),
  };
  debug('TSRC:Stability', 'Transition history reset');
}

