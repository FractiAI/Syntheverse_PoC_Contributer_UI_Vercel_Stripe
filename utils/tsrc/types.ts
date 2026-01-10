/**
 * TSRC (Trinary Self-Regulating Core) Type Definitions
 * Based on feedback from Marek and Simba
 * 
 * TSRC is a trinary safety architecture where exploration can generate any proposals,
 * but external actuation can only happen through a constrained 0-axis and minimal authorizer.
 * Safety is defined by unreachability of a forbidden actuation set, not by proposal content.
 * 
 * INTEGRATED WITH BøwTæCøre GATE MODEL:
 * -1 = Untrusted proposal generation (no side-effects)
 * 0a = Deterministic projector / veto (PFO)
 * 0b = Minimal authorizer (counters/leases/signatures)
 * +1 = Executor (DB writes, payments, chain tx; fail-closed)
 */

// ============================================================================
// BøwTæCøre GATE MODEL TYPES (Bridge Pack Integration)
// ============================================================================

export type UUID = string;
export type Hex = string;

export type ClockAssumption =
  | "wallclock_rfc3339_bounded_skew"
  | "executor_monotonic"
  | "none";

export type RebootSafeAntiReplay = "persistent_counter" | "epoch_keys";
export type CounterScope = "global" | "per_action_type";

export type RiskTier = 0 | 1 | 2 | 3;

export type ArtifactClass = "data" | "control" | "na";
export type SinkClass = "data_only" | "control_consumed";

export interface ScoreToggles {
  seed_on: boolean;
  edge_on: boolean;
  overlap_on: boolean;
}

/**
 * Layer -1: Untrusted proposal (no side-effects)
 * Output from evaluation engine before any authorization
 */
export interface ProposalEnvelope {
  proposal_id: UUID;
  timestamp: string; // RFC3339
  intent: string;
  action_type: string; // e.g. "score_poc_proposal"
  params: Record<string, unknown>;
  trace: {
    run_id: string;
    inputs_hash: Hex;
    determinism: BowTaeCoreContract;
  };
}

/**
 * Layer 0a: Deterministic projection with veto capability
 * Normalizes, classifies, and can veto proposals
 */
export interface ProjectedCommand {
  projection_id: UUID;
  proposal_id: UUID;

  kman_hash: Hex; // Capability manifest hash
  bset_hash: Hex; // Forbidden action set hash
  policy_seq: number; // Monotonically increasing policy version

  mode_id: string; // "normal" | "safe_mode" | "validation"
  closure_active: { op: "axis" | "kiss" | "custom"; d_def: string; d: number };

  action_type: string;
  params: Record<string, unknown>;

  risk_tier: RiskTier;

  artifact_sink_ref?: string;
  artifact_class: ArtifactClass;

  checks_passed: string[];

  veto: { is_veto: boolean; reason: string };
}

/**
 * Layer 0b: Authorization with signature/counter/lease
 * Mints credentials for executor layer
 */
export interface Authorization {
  command_id: UUID;
  projection_id: UUID;

  issued_at: string; // RFC3339
  lease_id: UUID;
  lease_valid_for_ms: number;

  cmd_counter: number; // Anti-replay counter

  kman_hash: Hex;
  bset_hash: Hex;
  policy_seq: number;

  mode_id: string;
  closure_active: { op: "axis" | "kiss" | "custom"; d_def: string; d: number };

  action_type: string;
  params: Record<string, unknown>;

  signature: {
    alg: "hmac-sha256" | "ed25519";
    canonicalization: "jcs-rfc8785";
    key_id: string;
    payload_hash: Hex;
    sig_b64: string;
  };
}

/**
 * BøwTæCøre determinism contract
 * Extends the existing DeterminismContract with gate model fields
 */
export interface BowTaeCoreContract {
  provider: "groq" | "openai" | "other" | string;
  model: string;
  temperature: number;
  prompt_hash: Hex;
  content_hash?: Hex;
  seed?: number | null;
  score_config_id: string;
  archive_snapshot_id: string;
  mode_state?: "growth" | "saturation" | "safe_mode" | "validation" | string;
  toggles?: ScoreToggles;
}

/**
 * Complete score trace including BøwTæCøre metadata
 */
export interface ScoreTrace {
  dims: { N: number; D: number; C: number; A: number };
  composite: number;

  overlap_percent: number;
  penalty_percent_applied: number;
  bonus_multiplier_applied: number;

  seed_multiplier_applied: number;
  edge_multiplier_applied: number;

  final_preclamp: number;
  final_clamped: number;
  clamped_reason?: "max_score" | "min_score" | null;

  score_config_id: string;
  archive_snapshot_id: string;

  toggles: ScoreToggles;

  determinism: BowTaeCoreContract;

  formula_steps: string[]; // Human-readable computation steps
}

// ============================================================================
// ARCHIVE SNAPSHOT SYSTEM
// ============================================================================

/**
 * Immutable, content-addressed archive snapshot
 * Once created, the snapshot is frozen and identified by its hash
 */
export interface ArchiveSnapshot {
  /** Content-addressed hash (SHA-256) of the snapshot */
  snapshot_id: string;
  /** Timestamp when snapshot was created */
  created_at: string;
  /** Sandbox ID (null for main Syntheverse) */
  sandbox_id: string | null;
  /** List of contribution hashes included in this snapshot */
  contribution_hashes: string[];
  /** Embedding model name and version */
  embedding_model: {
    name: string;
    version: string;
    provider: string;
  };
  /** Indexing parameters used */
  indexing_params: {
    method: string; // e.g., "cosine_similarity"
    dimensions: number;
    normalization: string;
  };
  /** Total number of items in snapshot */
  item_count: number;
  /** Metadata for audit trail */
  metadata: {
    created_by?: string;
    purpose?: string;
    notes?: string;
  };
}

// ============================================================================
// OPERATOR HYGIENE
// ============================================================================

/**
 * O_kiss: Isotropic (direction-agnostic) similarity operator
 * Uses embedding_cosine for semantic redundancy
 */
export interface IsotropicOperator {
  operator_type: 'O_kiss';
  operator_name: string; // e.g., "embedding_cosine"
  operator_version: string;
  embedding_model: {
    name: string;
    version: string;
    provider: string;
  };
  metric: 'cosine' | 'euclidean' | 'manhattan';
  /** Logged at evaluation time */
  computed_at: string;
}

/**
 * O_axis: Orthogonal channel operator
 * Treats overlap as independent channels (N, D, C, A)
 */
export interface OrthogonalOperator {
  operator_type: 'O_axis';
  operator_name: string; // e.g., "per_axis_overlap"
  operator_version: string;
  /** Per-axis proximity channels */
  axes: {
    novelty: AxisChannel;
    density: AxisChannel;
    coherence: AxisChannel;
    alignment: AxisChannel;
  };
  /** Aggregation rule for combining axes */
  aggregation_rule: 'max' | 'weighted_sum' | 'tiered_thresholds';
  /** Logged at evaluation time */
  computed_at: string;
}

export interface AxisChannel {
  axis_name: 'N' | 'D' | 'C' | 'A';
  proximity_score: number; // 0-1, where 1 is most similar
  flagged: boolean; // true if this axis is causing redundancy
  threshold: number; // redundancy threshold for this axis
  contributing_submissions: string[]; // hashes of submissions causing proximity
}

// ============================================================================
// DETERMINISM CONTRACT
// ============================================================================

/**
 * Determinism contract: same inputs = same trace
 * All non-deterministic elements must be logged explicitly
 */
export interface DeterminismContract {
  /** Content hash (SHA-256) of input text */
  content_hash: string;
  /** Score configuration ID */
  score_config_id: string;
  /** Sandbox ID (null for main Syntheverse) */
  sandbox_id: string | null;
  /** Archive snapshot ID (content-addressed) */
  snapshot_id: string;
  /** Mode state at evaluation time */
  mode_state: ModeState;
  /** LLM parameters */
  llm_params: {
    model: string;
    model_version: string;
    provider: string;
    temperature: number; // Must be 0 for determinism
    seed?: number; // If supported by provider
    prompt_hash: string; // SHA-256 of system prompt
  };
  /** Operator configuration */
  operators: {
    isotropic: IsotropicOperator;
    orthogonal?: OrthogonalOperator; // Optional for now
  };
  /** Computed at evaluation time */
  evaluated_at: string;
}

// ============================================================================
// MODE TRANSITIONS & STABILITY
// ============================================================================

/**
 * Mode state for the evaluation system
 */
export type ModeState =
  | 'growth' // Normal operation, accepting contributions
  | 'saturation' // Approaching capacity, increased vigilance
  | 'safe_mode'; // Tightened constraints, reduced acceptance

/**
 * Trigger signals for mode transitions
 */
export interface StabilityTriggers {
  /** Clamp rate: fraction of submissions being clamped to limits */
  clamp_rate: number;
  /** Threshold for clamp rate alarm */
  clamp_rate_threshold: number;
  /** Overlap distribution drift: change in mean/variance of overlap scores */
  overlap_drift: {
    mean_shift: number;
    variance_change: number;
  };
  /** Archive growth rate: submissions per day */
  growth_rate: number;
  /** Pressure: demand/capacity ratio */
  pressure: number; // ρ = D/C_geom
  /** Stability margin: distance from critical thresholds */
  stability_margin: number; // γ
  /** Accumulation metric */
  accumulation: number; // A
}

/**
 * Mode transition event
 * All transitions must be monotone-tightening (can only shrink capability)
 */
export interface ModeTransition {
  transition_id: string;
  from_mode: ModeState;
  to_mode: ModeState;
  triggered_at: string;
  triggers: StabilityTriggers;
  /** Transition must be monotone-tightening */
  is_monotone_tightening: boolean;
  /** Changes applied in this transition */
  changes: {
    old_config: any;
    new_config: any;
    capability_delta: 'shrink' | 'maintain' | 'expand';
  };
  /** Governance approval required for widening */
  requires_governance_approval: boolean;
  approved_by?: string[];
  /** Anti-thrashing: hysteresis and dwell time */
  anti_thrashing: {
    hysteresis_window: number; // seconds
    dwell_time: number; // seconds
    rate_limit: number; // max transitions per hour
  };
}

// ============================================================================
// EVALUATION TRACE
// ============================================================================

/**
 * Complete evaluation trace with TSRC metadata
 * This is the canonical audit record for each evaluation
 */
export interface TSRCEvaluationTrace {
  /** Unique trace ID */
  trace_id: string;
  /** Submission hash */
  submission_hash: string;
  /** Determinism contract */
  determinism: DeterminismContract;
  /** Raw scores (pre-clamp) */
  raw_scores: {
    novelty: number;
    density: number;
    coherence: number;
    alignment: number;
    composite: number;
  };
  /** Operator results */
  operators: {
    isotropic: {
      operator: IsotropicOperator;
      overlap_score: number;
      redundant_with: string[]; // submission hashes
    };
    orthogonal?: {
      operator: OrthogonalOperator;
      per_axis_overlap: {
        N: number;
        D: number;
        C: number;
        A: number;
      };
      flagged_axes: ('N' | 'D' | 'C' | 'A')[];
    };
  };
  /** Multipliers and penalties */
  adjustments: {
    multipliers: {
      seed: number;
      edge: number;
      sweet_spot: number;
      total: number;
    };
    penalties: {
      overlap_percent: number;
      total_percent: number;
    };
  };
  /** Final scores (post-clamp) */
  final_scores: {
    pod_score: number;
    clamped: boolean;
    clamp_details?: {
      pre_clamp: number;
      post_clamp: number;
      clamp_reason: string;
    };
  };
  /** Mode state at evaluation */
  mode_state: ModeState;
  /** Stability metrics at evaluation */
  stability: StabilityTriggers;
  /** Full LLM response */
  llm_response: {
    raw_json: string;
    parsed: any;
    metadata: any;
  };
  /** Timestamps */
  timestamps: {
    started_at: string;
    vectorized_at?: string;
    llm_called_at?: string;
    llm_responded_at?: string;
    completed_at: string;
    duration_ms: number;
  };
}

// ============================================================================
// GOVERNANCE PLANE
// ============================================================================

/**
 * Governance action for policy updates
 * Protected operations require multi-key approval
 */
export interface GovernanceAction {
  action_id: string;
  action_type: 'update_kman' | 'update_bset' | 'widen_constraints' | 'emergency_override';
  proposed_by: string;
  proposed_at: string;
  approved_by: string[];
  approval_threshold: number; // number of approvals required
  approved_at?: string;
  executed_at?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  changes: any;
  justification: string;
  /** For auditing */
  metadata: {
    kman_hash_before?: string;
    kman_hash_after?: string;
    bset_hash_before?: string;
    bset_hash_after?: string;
  };
}

// ============================================================================
// K-FACTOR HYGIENE
// ============================================================================

/**
 * K-factor hygiene: always keep pre-clamp truth visible
 * This ensures we can audit what the raw evaluation produced vs what was applied
 */
export interface KFactorHygiene {
  raw_value: number;
  k_factor: number;
  computed_value: number;
  clamped_to?: {
    min?: number;
    max?: number;
  };
  final_value: number;
  /** Explanation of any adjustments */
  adjustment_trace: string[];
}

