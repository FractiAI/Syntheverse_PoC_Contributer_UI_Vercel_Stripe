/**
 * Phase 2: Pure Evaluation (-1 Layer)
 * 
 * Evaluation returns ProposalEnvelope ONLY - no side-effects
 * - No DB writes
 * - No payment session creation
 * - No blockchain registration
 * - Pure computation: inputs → proposal
 */

import crypto from 'crypto';
import { ProposalEnvelope, BowTaeCoreContract } from './types';

/**
 * Evaluate submission and return ProposalEnvelope (no side-effects)
 * 
 * This is the -1 layer: untrusted proposal generation
 * The proposal will be passed through PFO (0a) → MA (0b) → Executor (+1)
 * 
 * @param textContent - Submission text
 * @param title - Submission title
 * @param category - Submission category
 * @param options - Additional evaluation options
 * @returns ProposalEnvelope (validated against schema)
 */
export async function evaluateToProposal(
  textContent: string,
  title: string,
  category?: string,
  options?: {
    sandbox_id?: string;
    user_id?: string;
    exclude_hash?: string;
  }
): Promise<ProposalEnvelope> {
  // Generate unique identifiers
  const proposal_id = generateUUID();
  const run_id = generateRunId();
  
  // Compute content hash (deterministic)
  const content_hash = sha256Hash(textContent);
  
  // Compute inputs hash (all inputs that affect evaluation)
  const inputs_hash = sha256Hash(
    JSON.stringify({
      content_hash,
      title,
      category: category || 'scientific',
      sandbox_id: options?.sandbox_id || null,
      exclude_hash: options?.exclude_hash || null
    })
  );
  
  // Get current archive snapshot ID (in production, create snapshot)
  const archive_snapshot_id = await getCurrentSnapshotId(options?.sandbox_id);
  
  // Get system prompt hash (deterministic)
  const prompt_hash = await getSystemPromptHash();
  
  // Create determinism contract
  const determinism: BowTaeCoreContract = {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    prompt_hash,
    content_hash,
    seed: null, // Groq doesn't support seed
    score_config_id: 'v1.0',
    archive_snapshot_id,
    mode_state: 'growth',
    toggles: {
      seed_on: true,
      edge_on: true,
      overlap_on: true
    }
  };
  
  // In production: call actual evaluation engine (utils/grok/evaluate.ts)
  // For Phase 2: return mock evaluation result
  const evaluation_result = await mockEvaluate(textContent, title, category);
  
  // Create proposal envelope
  const proposal: ProposalEnvelope = {
    proposal_id,
    timestamp: new Date().toISOString(),
    intent: `Evaluate and score PoC submission: "${title}"`,
    action_type: 'score_poc_proposal',
    params: {
      submission_hash: content_hash,
      title,
      category: category || 'scientific',
      sandbox_id: options?.sandbox_id || null,
      user_id: options?.user_id || null,
      
      // Evaluation results (from LLM)
      score: evaluation_result.pod_score,
      metals: evaluation_result.metals,
      qualified: evaluation_result.qualified,
      
      // Dimension scores
      novelty: evaluation_result.novelty,
      density: evaluation_result.density,
      coherence: evaluation_result.coherence,
      alignment: evaluation_result.alignment,
      
      // Redundancy analysis
      redundancy_percent: evaluation_result.redundancy,
      redundancy_analysis: evaluation_result.redundancy_analysis,
      
      // Special flags
      is_seed_submission: evaluation_result.is_seed_submission,
      seed_justification: evaluation_result.seed_justification,
      is_edge_submission: evaluation_result.is_edge_submission,
      edge_justification: evaluation_result.edge_justification,
      
      // Full evaluation metadata
      llm_metadata: evaluation_result.llm_metadata,
      score_trace: evaluation_result.score_trace
    },
    trace: {
      run_id,
      inputs_hash,
      determinism
    }
  };
  
  // Validate against JSON schema (in production, use ajv)
  const validation = validateProposalEnvelope(proposal);
  if (!validation.valid) {
    throw new Error(`Proposal validation failed: ${validation.errors?.join(', ')}`);
  }
  
  return proposal;
}

/**
 * Mock evaluation (replace with actual evaluateWithGroq in production)
 */
async function mockEvaluate(
  textContent: string,
  title: string,
  category?: string
): Promise<any> {
  // In production: call utils/grok/evaluate.ts
  // For Phase 2: return mock data
  
  return {
    pod_score: 7500,
    novelty: 2100,
    density: 1900,
    coherence: 1800,
    alignment: 1700,
    metals: ['gold', 'silver'],
    qualified: true,
    redundancy: 15,
    redundancy_analysis: 'Low overlap with existing submissions',
    is_seed_submission: false,
    seed_justification: 'Not a seed submission',
    is_edge_submission: true,
    edge_justification: 'Exhibits edge characteristics: novel approach to known problem',
    llm_metadata: {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      model: 'llama-3.3-70b-versatile',
      model_version: 'v3.3',
      provider: 'groq',
      system_prompt_preview: 'You are an expert evaluator...',
      system_prompt_hash: sha256Hash('system_prompt_content'),
      system_prompt_file: 'system-prompt.ts',
      evaluation_timestamp_ms: Date.now()
    },
    score_trace: {
      dimension_scores: {
        novelty: 2100,
        density: 1900,
        coherence: 1800,
        alignment: 1700
      },
      composite: 7500,
      base_pod_score: 7500,
      overlap_percent: 15,
      penalty_percent_computed: 15,
      penalty_percent_applied: 15,
      bonus_multiplier_computed: 1.0,
      bonus_multiplier_applied: 1.0,
      seed_multiplier: 1.0,
      edge_multiplier: 1.1,
      is_seed_submission: false,
      is_edge_submission: true,
      after_penalty: 6375,
      after_bonus: 6375,
      after_seed: 7012,
      final_score: 7500,
      formula: '(N+D+C+A) * (1 - overlap/100) * edge_multiplier',
      clamped: false
    }
  };
}

/**
 * Get current snapshot ID (in production, create or load snapshot)
 */
async function getCurrentSnapshotId(sandbox_id?: string): Promise<string> {
  // In production: call utils/tsrc/snapshot.ts createArchiveSnapshot()
  // For Phase 2: return mock snapshot ID
  return `snapshot_${Date.now()}_${sandbox_id || 'main'}`;
}

/**
 * Get system prompt hash (deterministic)
 */
async function getSystemPromptHash(): Promise<string> {
  // In production: load system prompt and compute hash
  // For Phase 2: return mock hash
  return sha256Hash('system_prompt_v1.0');
}

/**
 * Validate proposal envelope against JSON schema
 */
function validateProposalEnvelope(proposal: ProposalEnvelope): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!proposal.proposal_id) errors.push('Missing proposal_id');
  if (!proposal.timestamp) errors.push('Missing timestamp');
  if (!proposal.intent) errors.push('Missing intent');
  if (!proposal.action_type) errors.push('Missing action_type');
  if (!proposal.params) errors.push('Missing params');
  if (!proposal.trace) errors.push('Missing trace');
  
  // Check trace fields
  if (proposal.trace) {
    if (!proposal.trace.run_id) errors.push('Missing trace.run_id');
    if (!proposal.trace.inputs_hash) errors.push('Missing trace.inputs_hash');
    if (!proposal.trace.determinism) errors.push('Missing trace.determinism');
    
    // Check determinism fields
    if (proposal.trace.determinism) {
      const d = proposal.trace.determinism;
      if (!d.provider) errors.push('Missing determinism.provider');
      if (!d.model) errors.push('Missing determinism.model');
      if (d.temperature === undefined) errors.push('Missing determinism.temperature');
      if (!d.prompt_hash) errors.push('Missing determinism.prompt_hash');
      if (!d.score_config_id) errors.push('Missing determinism.score_config_id');
      if (!d.archive_snapshot_id) errors.push('Missing determinism.archive_snapshot_id');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate run ID (timestamp-based)
 */
function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * SHA-256 hash
 */
function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

