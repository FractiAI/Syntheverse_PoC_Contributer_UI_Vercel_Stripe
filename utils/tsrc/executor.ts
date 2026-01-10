/**
 * Phase 5: Fail-Closed Executor - Layer +1
 * 
 * Executes authorized commands with strict enforcement:
 * - Schema strictness (reject unknown fields)
 * - Lease validity (reject expired)
 * - Anti-replay counter check (reject reused counters)
 * - Policy seq/hash binding (reject policy mismatch)
 * - Capability membership checks
 * - Fail closed on any mismatch
 */

import { Authorization } from './types';
import { validateAuthorization, isLeaseExpired, verifySignature } from './authorizer';
import { loadCurrentPolicy } from './projector';

// Track used counters (in production, check database)
const usedCounters = new Set<number>();

// Track active policy (in production, load from database)
let currentPolicySeq = 0;
let currentKmanHash = 'bootstrap_kman_v0';
let currentBsetHash = 'bootstrap_bset_v0';

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean;
  command_id: string;
  action_type: string;
  executed_at: string;
  duration_ms: number;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  verification: {
    counter_verified: boolean;
    lease_verified: boolean;
    policy_verified: boolean;
    signature_verified: boolean;
  };
}

/**
 * Execute an authorized command (fail-closed)
 * 
 * @param authorization - Authorization from MA (0b)
 * @param executor - Function to execute the actual action
 * @returns ExecutionResult with verification trace
 */
export async function executeAuthorized(
  authorization: Authorization,
  executor: (auth: Authorization) => Promise<any>
): Promise<ExecutionResult> {
  const start_time = Date.now();
  const executed_at = new Date().toISOString();
  
  // Initialize verification results
  const verification = {
    counter_verified: false,
    lease_verified: false,
    policy_verified: false,
    signature_verified: false
  };
  
  try {
    // 1. Verify signature
    if (!verifySignature(authorization)) {
      return failClosed(
        authorization,
        'signature_invalid',
        'Authorization signature verification failed',
        verification,
        start_time,
        executed_at
      );
    }
    verification.signature_verified = true;
    
    // 2. Check lease validity
    if (isLeaseExpired(authorization)) {
      return failClosed(
        authorization,
        'lease_expired',
        `Lease expired (issued: ${authorization.issued_at}, valid_for: ${authorization.lease_valid_for_ms}ms)`,
        verification,
        start_time,
        executed_at
      );
    }
    verification.lease_verified = true;
    
    // 3. Check anti-replay counter (must be unique, never reused)
    if (usedCounters.has(authorization.cmd_counter)) {
      return failClosed(
        authorization,
        'counter_replay',
        `Counter ${authorization.cmd_counter} already used (replay attack detected)`,
        verification,
        start_time,
        executed_at
      );
    }
    verification.counter_verified = true;
    
    // 4. Verify policy binding (policy_seq and hashes must match current policy)
    const policy_check = await verifyPolicyBinding(authorization);
    if (!policy_check.valid) {
      return failClosed(
        authorization,
        'policy_mismatch',
        policy_check.error || 'Policy binding verification failed',
        verification,
        start_time,
        executed_at
      );
    }
    verification.policy_verified = true;
    
    // 5. Validate authorization structure
    const validation = validateAuthorization(authorization);
    if (!validation.valid) {
      return failClosed(
        authorization,
        'authorization_invalid',
        `Authorization validation failed: ${validation.errors?.join(', ')}`,
        verification,
        start_time,
        executed_at
      );
    }
    
    // 6. All checks passed - mark counter as used (anti-replay)
    usedCounters.add(authorization.cmd_counter);
    
    // 7. Execute the action
    const result = await executor(authorization);
    
    // 8. Success - audit log and return
    const duration_ms = Date.now() - start_time;
    
    const execution_result: ExecutionResult = {
      success: true,
      command_id: authorization.command_id,
      action_type: authorization.action_type,
      executed_at,
      duration_ms,
      result,
      verification
    };
    
    // Audit log (in production, write to execution_audit_log table)
    await auditLogExecution(execution_result, authorization);
    
    return execution_result;
    
  } catch (error: any) {
    // Execution failed - still audit log
    const duration_ms = Date.now() - start_time;
    
    const execution_result: ExecutionResult = {
      success: false,
      command_id: authorization.command_id,
      action_type: authorization.action_type,
      executed_at,
      duration_ms,
      error: {
        code: 'execution_error',
        message: error.message || 'Unknown execution error',
        details: error.stack
      },
      verification
    };
    
    await auditLogExecution(execution_result, authorization);
    
    return execution_result;
  }
}

/**
 * Fail closed: reject execution and return error result
 */
function failClosed(
  authorization: Authorization,
  error_code: string,
  error_message: string,
  verification: ExecutionResult['verification'],
  start_time: number,
  executed_at: string
): ExecutionResult {
  const duration_ms = Date.now() - start_time;
  
  return {
    success: false,
    command_id: authorization.command_id,
    action_type: authorization.action_type,
    executed_at,
    duration_ms,
    error: {
      code: error_code,
      message: error_message
    },
    verification
  };
}

/**
 * Verify policy binding (policy_seq and hashes must match current policy)
 */
async function verifyPolicyBinding(authorization: Authorization): Promise<{
  valid: boolean;
  error?: string;
}> {
  // In production: load current policy from database
  const current_policy = await loadCurrentPolicy();
  
  // Check policy sequence
  if (authorization.policy_seq !== current_policy.policy_seq) {
    return {
      valid: false,
      error: `Policy sequence mismatch: auth has ${authorization.policy_seq}, current is ${current_policy.policy_seq}`
    };
  }
  
  // Check kman hash
  if (authorization.kman_hash !== current_policy.kman_hash) {
    return {
      valid: false,
      error: `Capability manifest hash mismatch: auth has ${authorization.kman_hash}, current is ${current_policy.kman_hash}`
    };
  }
  
  // Check bset hash
  if (authorization.bset_hash !== current_policy.bset_hash) {
    return {
      valid: false,
      error: `Forbidden set hash mismatch: auth has ${authorization.bset_hash}, current is ${current_policy.bset_hash}`
    };
  }
  
  return { valid: true };
}

/**
 * Audit log execution (in production, write to execution_audit_log table)
 */
async function auditLogExecution(
  result: ExecutionResult,
  authorization: Authorization
): Promise<void> {
  // In production: INSERT INTO execution_audit_log (...) VALUES (...)
  
  const log_entry = {
    command_id: result.command_id,
    action_type: result.action_type,
    executed_at: result.executed_at,
    success: result.success,
    duration_ms: result.duration_ms,
    error_code: result.error?.code,
    error_message: result.error?.message,
    counter_verified: result.verification.counter_verified,
    lease_verified: result.verification.lease_verified,
    policy_verified: result.verification.policy_verified,
    signature_verified: result.verification.signature_verified,
    cmd_counter: authorization.cmd_counter,
    policy_seq: authorization.policy_seq
  };
  
  // For Phase 5: console.log in dev (replace with DB write in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[EXECUTOR]', result.success ? 'SUCCESS' : 'FAILED', log_entry);
  }
}

/**
 * Specific executor functions for each action type
 */

/**
 * Execute score_poc_proposal action
 */
export async function executeScorePocProposal(authorization: Authorization): Promise<any> {
  return executeAuthorized(authorization, async (auth) => {
    const { submission_hash, score, metals, qualified } = auth.params as {
      submission_hash: string;
      score: number;
      metals: string[];
      qualified: boolean;
    };
    
    // In production: UPDATE contributions SET pod_score = ?, metals = ?, qualified = ? WHERE submission_hash = ?
    
    return {
      action: 'score_poc_proposal',
      submission_hash,
      score,
      metals,
      qualified,
      db_writes: {
        table: 'contributions',
        rows_affected: 1
      }
    };
  });
}

/**
 * Execute create_payment_session action
 */
export async function executeCreatePaymentSession(authorization: Authorization): Promise<any> {
  return executeAuthorized(authorization, async (auth) => {
    const { amount, currency, user_id } = auth.params as {
      amount: number;
      currency: string;
      user_id: string;
    };
    
    // In production: Call Stripe API to create payment session
    
    return {
      action: 'create_payment_session',
      amount,
      currency,
      user_id,
      payment_session_id: 'mock_session_id',
      payment_created: {
        provider: 'stripe',
        session_id: 'mock_session_id',
        amount,
        currency
      }
    };
  });
}

/**
 * Execute register_blockchain action
 */
export async function executeRegisterBlockchain(authorization: Authorization): Promise<any> {
  return executeAuthorized(authorization, async (auth) => {
    const { transaction_hash, chain_id, user_address } = auth.params as {
      transaction_hash: string;
      chain_id: number;
      user_address: string;
    };
    
    // In production: Verify transaction on blockchain, update database
    
    return {
      action: 'register_blockchain',
      transaction_hash,
      chain_id,
      user_address,
      blockchain_tx: {
        chain: 'base_mainnet',
        tx_hash: transaction_hash,
        verified: true
      }
    };
  });
}

/**
 * Execute update_snapshot action
 */
export async function executeUpdateSnapshot(authorization: Authorization): Promise<any> {
  return executeAuthorized(authorization, async (auth) => {
    const { snapshot_id, contribution_hashes } = auth.params as {
      snapshot_id: string;
      contribution_hashes: string[];
    };
    
    // In production: Create new archive snapshot
    
    return {
      action: 'update_snapshot',
      snapshot_id,
      item_count: contribution_hashes.length,
      db_writes: {
        table: 'archive_snapshots',
        rows_affected: 1
      }
    };
  });
}

/**
 * Reset executor state (for testing only)
 */
export function resetExecutorForTesting(): void {
  usedCounters.clear();
  currentPolicySeq = 0;
  currentKmanHash = 'bootstrap_kman_v0';
  currentBsetHash = 'bootstrap_bset_v0';
}

/**
 * Get executor statistics (for monitoring)
 */
export function getExecutorStats(): {
  used_counters_count: number;
  current_policy_seq: number;
} {
  return {
    used_counters_count: usedCounters.size,
    current_policy_seq: currentPolicySeq
  };
}

