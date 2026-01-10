/**
 * Phase 3: PFO (Projector with Fail-Open) - Layer 0a
 * 
 * Deterministic projector that normalizes, classifies, and can veto proposals.
 * - Normalizes proposals into canonical form
 * - Classifies risk tier and artifact class
 * - Vetoes ambiguous or forbidden actions
 * - Always deterministic: same proposal + policy → same projection
 */

import crypto from 'crypto';
import { ProposalEnvelope, ProjectedCommand, RiskTier, ArtifactClass } from './types';

// Policy state (in production, load from database)
interface PolicyState {
  policy_seq: number;
  kman_hash: string;
  bset_hash: string;
  kman_content: {
    capabilities: string[];
    risk_tiers: Record<string, number>;
  };
  bset_content: {
    forbidden_actions: string[];
    control_artifacts_disabled: boolean;
    max_risk_tier_allowed: number;
  };
  mode_id: string;
}

// Default bootstrap policy (matches DB migration)
const BOOTSTRAP_POLICY: PolicyState = {
  policy_seq: 0,
  kman_hash: 'bootstrap_kman_v0',
  bset_hash: 'bootstrap_bset_v0',
  kman_content: {
    capabilities: [
      'score_poc_proposal',
      'create_payment_session',
      'register_blockchain',
      'update_snapshot'
    ],
    risk_tiers: {
      'score_poc_proposal': 1,
      'create_payment_session': 2,
      'register_blockchain': 2,
      'update_snapshot': 2
    }
  },
  bset_content: {
    forbidden_actions: [],
    control_artifacts_disabled: false,
    max_risk_tier_allowed: 3
  },
  mode_id: 'normal'
};

/**
 * Project a proposal into a projected command
 * 
 * This is the deterministic gate: same inputs always produce same output
 * 
 * @param proposal - Untrusted proposal from evaluation (-1)
 * @param policy - Current policy state (defaults to bootstrap)
 * @returns ProjectedCommand with potential veto
 */
export function project(
  proposal: ProposalEnvelope,
  policy: PolicyState = BOOTSTRAP_POLICY
): ProjectedCommand {
  const projection_id = generateUUID();
  const checks_passed: string[] = [];
  
  // 1. Normalize action type
  const normalized_action = normalizeActionType(proposal.action_type);
  
  // 2. Check if action is in capability manifest (kman)
  if (!policy.kman_content.capabilities.includes(normalized_action)) {
    return vetoed(
      projection_id,
      proposal,
      policy,
      'capability_not_in_kman',
      `Action '${normalized_action}' not found in capability manifest`
    );
  }
  checks_passed.push('capability_in_kman');
  
  // 3. Check if action is in forbidden set (bset)
  if (policy.bset_content.forbidden_actions.includes(normalized_action)) {
    return vetoed(
      projection_id,
      proposal,
      policy,
      'action_in_bset',
      `Action '${normalized_action}' is explicitly forbidden`
    );
  }
  checks_passed.push('action_not_in_bset');
  
  // 4. Classify risk tier
  const risk_tier = classifyRiskTier(normalized_action, proposal.params, policy);
  
  // 5. Check if risk tier exceeds policy limit
  if (risk_tier > policy.bset_content.max_risk_tier_allowed) {
    return vetoed(
      projection_id,
      proposal,
      policy,
      'risk_tier_exceeds_limit',
      `Risk tier ${risk_tier} exceeds maximum allowed (${policy.bset_content.max_risk_tier_allowed})`
    );
  }
  checks_passed.push('risk_tier_within_limit');
  
  // 6. Classify artifact class
  const artifact_classification = classifyArtifact(normalized_action, proposal.params);
  
  // 7. Check if control artifacts are disabled
  if (
    policy.bset_content.control_artifacts_disabled &&
    artifact_classification.artifact_class === 'control'
  ) {
    return vetoed(
      projection_id,
      proposal,
      policy,
      'control_artifact_disabled',
      `Control artifacts are disabled in current policy`
    );
  }
  checks_passed.push('artifact_class_allowed');
  
  // 8. Validate parameters (check for ambiguity)
  const ambiguity_check = checkForAmbiguity(normalized_action, proposal.params);
  if (ambiguity_check.is_ambiguous) {
    return vetoed(
      projection_id,
      proposal,
      policy,
      'ambiguous_parameters',
      `Ambiguous parameters detected: ${ambiguity_check.reason}`
    );
  }
  checks_passed.push('parameters_unambiguous');
  
  // 9. Success: Create projected command (not vetoed)
  const projected: ProjectedCommand = {
    projection_id,
    proposal_id: proposal.proposal_id,
    
    // Policy tracking
    kman_hash: policy.kman_hash,
    bset_hash: policy.bset_hash,
    policy_seq: policy.policy_seq,
    
    // Mode and closure
    mode_id: policy.mode_id,
    closure_active: determineClosureRule(policy.mode_id),
    
    // Action
    action_type: normalized_action,
    params: normalizeParams(proposal.params),
    
    // Risk and artifact classification
    risk_tier,
    artifact_sink_ref: artifact_classification.sink_ref,
    artifact_class: artifact_classification.artifact_class,
    
    // Checks
    checks_passed,
    
    // Not vetoed
    veto: {
      is_veto: false,
      reason: ''
    }
  };
  
  return projected;
}

/**
 * Create a vetoed projection
 */
function vetoed(
  projection_id: string,
  proposal: ProposalEnvelope,
  policy: PolicyState,
  veto_reason: string,
  veto_message: string
): ProjectedCommand {
  return {
    projection_id,
    proposal_id: proposal.proposal_id,
    
    kman_hash: policy.kman_hash,
    bset_hash: policy.bset_hash,
    policy_seq: policy.policy_seq,
    
    mode_id: policy.mode_id,
    closure_active: determineClosureRule(policy.mode_id),
    
    action_type: proposal.action_type,
    params: proposal.params,
    
    risk_tier: 3, // Maximum risk for vetoed
    artifact_sink_ref: undefined,
    artifact_class: 'na',
    
    checks_passed: [],
    
    veto: {
      is_veto: true,
      reason: `${veto_reason}: ${veto_message}`
    }
  };
}

/**
 * Normalize action type to canonical form
 */
function normalizeActionType(action: string): string {
  // Convert to lowercase, trim whitespace
  return action.toLowerCase().trim();
}

/**
 * Classify risk tier based on action type and parameters
 */
function classifyRiskTier(
  action: string,
  params: Record<string, unknown>,
  policy: PolicyState
): RiskTier {
  // Use policy-defined risk tier if available
  if (policy.kman_content.risk_tiers[action] !== undefined) {
    return policy.kman_content.risk_tiers[action] as RiskTier;
  }
  
  // Fallback heuristics
  if (action.includes('blockchain') || action.includes('payment')) {
    return 2; // High risk: financial operations
  }
  
  if (action.includes('score') || action.includes('evaluate')) {
    return 1; // Medium risk: scoring operations
  }
  
  if (action.includes('snapshot') || action.includes('read')) {
    return 1; // Medium risk: state operations
  }
  
  return 0; // Low risk: default
}

/**
 * Classify artifact class and sink reference
 */
function classifyArtifact(
  action: string,
  params: Record<string, unknown>
): {
  artifact_class: ArtifactClass;
  sink_ref?: string;
} {
  // Control artifacts: actions that modify system behavior
  if (
    action.includes('update') ||
    action.includes('configure') ||
    action.includes('modify')
  ) {
    return {
      artifact_class: 'control',
      sink_ref: `control:${action}`
    };
  }
  
  // Data artifacts: actions that write data
  if (
    action.includes('score') ||
    action.includes('payment') ||
    action.includes('blockchain')
  ) {
    return {
      artifact_class: 'data',
      sink_ref: `data:${action}`
    };
  }
  
  // Not applicable
  return {
    artifact_class: 'na'
  };
}

/**
 * Check for ambiguous parameters that could cause non-deterministic behavior
 */
function checkForAmbiguity(
  action: string,
  params: Record<string, unknown>
): { is_ambiguous: boolean; reason?: string } {
  // Check for undefined required parameters
  if (action === 'score_poc_proposal') {
    if (!params.submission_hash || typeof params.submission_hash !== 'string') {
      return {
        is_ambiguous: true,
        reason: 'Missing or invalid submission_hash'
      };
    }
  }
  
  if (action === 'create_payment_session') {
    if (!params.amount || typeof params.amount !== 'number') {
      return {
        is_ambiguous: true,
        reason: 'Missing or invalid payment amount'
      };
    }
  }
  
  if (action === 'register_blockchain') {
    if (!params.transaction_hash || typeof params.transaction_hash !== 'string') {
      return {
        is_ambiguous: true,
        reason: 'Missing or invalid transaction_hash'
      };
    }
  }
  
  // Check for null or undefined values (ambiguous)
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      return {
        is_ambiguous: true,
        reason: `Parameter '${key}' is null or undefined`
      };
    }
  }
  
  return { is_ambiguous: false };
}

/**
 * Normalize parameters to canonical form
 */
function normalizeParams(params: Record<string, unknown>): Record<string, unknown> {
  // Sort keys for deterministic serialization
  const sortedKeys = Object.keys(params).sort();
  const normalized: Record<string, unknown> = {};
  
  for (const key of sortedKeys) {
    normalized[key] = params[key];
  }
  
  return normalized;
}

/**
 * Determine closure rule based on mode
 */
function determineClosureRule(mode_id: string): {
  op: 'axis' | 'kiss' | 'custom';
  d_def: string;
  d: number;
} {
  switch (mode_id) {
    case 'safe_mode':
      return {
        op: 'kiss',
        d_def: 'minimal_capability_set',
        d: 1
      };
    case 'validation':
      return {
        op: 'axis',
        d_def: 'per_axis_validation',
        d: 2
      };
    case 'normal':
    default:
      return {
        op: 'kiss',
        d_def: 'standard_overlap',
        d: 1
      };
  }
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Validate projected command against JSON schema
 * (In production, use ajv or similar for strict validation)
 */
export function validateProjection(projected: ProjectedCommand): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!projected.projection_id) errors.push('Missing projection_id');
  if (!projected.proposal_id) errors.push('Missing proposal_id');
  if (!projected.kman_hash) errors.push('Missing kman_hash');
  if (!projected.bset_hash) errors.push('Missing bset_hash');
  if (projected.policy_seq === undefined) errors.push('Missing policy_seq');
  if (!projected.mode_id) errors.push('Missing mode_id');
  if (!projected.action_type) errors.push('Missing action_type');
  if (projected.risk_tier === undefined) errors.push('Missing risk_tier');
  if (!projected.artifact_class) errors.push('Missing artifact_class');
  if (!projected.veto) errors.push('Missing veto');
  
  // Check types
  if (![0, 1, 2, 3].includes(projected.risk_tier)) {
    errors.push('Invalid risk_tier (must be 0, 1, 2, or 3)');
  }
  
  if (!['data', 'control', 'na'].includes(projected.artifact_class)) {
    errors.push('Invalid artifact_class');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Load policy from database (placeholder for Phase 4+)
 */
export async function loadCurrentPolicy(): Promise<PolicyState> {
  // In production: query policy_versions table for latest policy
  // SELECT * FROM policy_versions ORDER BY policy_seq DESC LIMIT 1;
  
  // For Phase 3: return bootstrap policy
  return BOOTSTRAP_POLICY;
}

