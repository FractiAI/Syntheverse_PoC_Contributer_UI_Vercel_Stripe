/**
 * Phase 4: Minimal Authorizer (MA) - Layer 0b
 * 
 * Mints authorizations with:
 * - Monotone command counter (anti-replay)
 * - Time-bound leases
 * - HMAC-SHA256 signatures
 * - Audit logging
 */

import crypto from 'crypto';
import { ProjectedCommand, Authorization } from './types';

// Counter state (in production, use database)
let globalCounter = 0;

// HMAC secret (in production, load from environment or key management)
const HMAC_SECRET = process.env.HMAC_SECRET_KEY || 'dev_secret_key_change_in_production';

interface LeasePolicy {
  default_lease_ms: number;
  max_lease_ms: number;
  min_lease_ms: number;
}

const DEFAULT_LEASE_POLICY: LeasePolicy = {
  default_lease_ms: 30000, // 30 seconds
  max_lease_ms: 300000, // 5 minutes
  min_lease_ms: 1000 // 1 second
};

/**
 * Authorize a projected command
 * 
 * @param projected - ProjectedCommand from PFO (0a)
 * @param lease_policy - Lease duration policy
 * @returns Authorization with counter, lease, and signature
 */
export async function authorize(
  projected: ProjectedCommand,
  lease_policy: LeasePolicy = DEFAULT_LEASE_POLICY
): Promise<Authorization> {
  // 1. Check if vetoed (cannot authorize vetoed projections)
  if (projected.veto.is_veto) {
    throw new Error(`Cannot authorize vetoed projection: ${projected.veto.reason}`);
  }
  
  // 2. Generate unique command ID
  const command_id = generateUUID();
  
  // 3. Assign monotone counter (anti-replay)
  const cmd_counter = await getNextCommandCounter();
  
  // 4. Generate lease
  const lease_id = generateUUID();
  const lease_valid_for_ms = determineLeaseDuration(
    projected.action_type,
    projected.risk_tier,
    lease_policy
  );
  
  const issued_at = new Date().toISOString();
  
  // 5. Create canonical payload for signature
  const payload = createCanonicalPayload({
    command_id,
    projection_id: projected.projection_id,
    cmd_counter,
    action_type: projected.action_type,
    params: projected.params,
    issued_at,
    lease_id,
    lease_valid_for_ms,
    kman_hash: projected.kman_hash,
    bset_hash: projected.bset_hash,
    policy_seq: projected.policy_seq
  });
  
  // 6. Compute payload hash
  const payload_hash = sha256Hash(payload);
  
  // 7. Sign payload with HMAC-SHA256
  const sig_b64 = hmacSign(payload, HMAC_SECRET);
  
  // 8. Create authorization
  const authorization: Authorization = {
    command_id,
    projection_id: projected.projection_id,
    
    issued_at,
    lease_id,
    lease_valid_for_ms,
    
    cmd_counter,
    
    kman_hash: projected.kman_hash,
    bset_hash: projected.bset_hash,
    policy_seq: projected.policy_seq,
    
    mode_id: projected.mode_id,
    closure_active: projected.closure_active,
    
    action_type: projected.action_type,
    params: projected.params,
    
    signature: {
      alg: 'hmac-sha256',
      canonicalization: 'jcs-rfc8785',
      key_id: 'default_hmac_key',
      payload_hash,
      sig_b64
    }
  };
  
  // 9. Audit log (in production, write to authorizations table)
  await auditLogAuthorization(authorization, projected);
  
  return authorization;
}

/**
 * Get next command counter (monotone, anti-replay)
 * 
 * In production: call database function get_next_command_counter()
 */
async function getNextCommandCounter(): Promise<number> {
  // Simulate atomic increment
  // In production: SELECT get_next_command_counter('global', NULL);
  globalCounter += 1;
  return globalCounter;
}

/**
 * Determine lease duration based on action type and risk tier
 */
function determineLeaseDuration(
  action_type: string,
  risk_tier: number,
  policy: LeasePolicy
): number {
  // Higher risk = shorter lease
  const base_duration = policy.default_lease_ms;
  
  // Risk tier scaling
  const risk_factor = Math.max(1, 4 - risk_tier); // Tier 3 = 1x, Tier 0 = 4x
  
  let duration = base_duration * risk_factor;
  
  // Action-specific adjustments
  if (action_type.includes('blockchain')) {
    duration = Math.min(duration, 60000); // Max 1 minute for blockchain ops
  }
  
  if (action_type.includes('payment')) {
    duration = Math.min(duration, 45000); // Max 45 seconds for payments
  }
  
  // Clamp to policy limits
  duration = Math.max(policy.min_lease_ms, Math.min(policy.max_lease_ms, duration));
  
  return duration;
}

/**
 * Create canonical payload for signature (JCS RFC8785)
 * 
 * Canonical JSON: deterministic serialization with sorted keys
 */
function createCanonicalPayload(data: Record<string, unknown>): string {
  // Sort keys recursively for deterministic serialization
  const canonical = sortKeysRecursive(data);
  return JSON.stringify(canonical);
}

/**
 * Recursively sort object keys (implements simplified JCS RFC8785)
 */
function sortKeysRecursive(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortKeysRecursive);
  }
  
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortKeysRecursive(obj[key]);
  }
  
  return sorted;
}

/**
 * SHA-256 hash
 */
function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * HMAC-SHA256 signature
 */
function hmacSign(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('base64');
}

/**
 * Verify HMAC-SHA256 signature
 */
export function verifySignature(authorization: Authorization, secret: string = HMAC_SECRET): boolean {
  try {
    // Reconstruct canonical payload
    const payload = createCanonicalPayload({
      command_id: authorization.command_id,
      projection_id: authorization.projection_id,
      cmd_counter: authorization.cmd_counter,
      action_type: authorization.action_type,
      params: authorization.params,
      issued_at: authorization.issued_at,
      lease_id: authorization.lease_id,
      lease_valid_for_ms: authorization.lease_valid_for_ms,
      kman_hash: authorization.kman_hash,
      bset_hash: authorization.bset_hash,
      policy_seq: authorization.policy_seq
    });
    
    // Compute expected signature
    const expected_sig = hmacSign(payload, secret);
    
    // Compare signatures (constant-time comparison would be better in production)
    return expected_sig === authorization.signature.sig_b64;
  } catch (error) {
    return false;
  }
}

/**
 * Check if lease is expired
 */
export function isLeaseExpired(authorization: Authorization): boolean {
  const issued = new Date(authorization.issued_at);
  const expires = new Date(issued.getTime() + authorization.lease_valid_for_ms);
  const now = new Date();
  
  return now > expires;
}

/**
 * Validate authorization (comprehensive check)
 */
export function validateAuthorization(authorization: Authorization): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];
  
  // 1. Check signature
  if (!verifySignature(authorization)) {
    errors.push('Invalid signature');
  }
  
  // 2. Check lease expiry
  if (isLeaseExpired(authorization)) {
    errors.push('Lease expired');
  }
  
  // 3. Check required fields
  if (!authorization.command_id) errors.push('Missing command_id');
  if (!authorization.projection_id) errors.push('Missing projection_id');
  if (authorization.cmd_counter === undefined) errors.push('Missing cmd_counter');
  if (!authorization.lease_id) errors.push('Missing lease_id');
  if (!authorization.lease_valid_for_ms) errors.push('Missing lease_valid_for_ms');
  
  // 4. Check counter is positive
  if (authorization.cmd_counter < 0) {
    errors.push('Counter cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Audit log authorization (in production, write to authorizations table)
 */
async function auditLogAuthorization(
  authorization: Authorization,
  projected: ProjectedCommand
): Promise<void> {
  // In production: INSERT INTO authorizations (...) VALUES (...)
  
  const log_entry = {
    timestamp: new Date().toISOString(),
    command_id: authorization.command_id,
    projection_id: authorization.projection_id,
    cmd_counter: authorization.cmd_counter,
    action_type: authorization.action_type,
    risk_tier: projected.risk_tier,
    lease_expires_at: new Date(
      new Date(authorization.issued_at).getTime() + authorization.lease_valid_for_ms
    ).toISOString(),
    policy_seq: authorization.policy_seq
  };
  
  // For Phase 4: console.log in dev (replace with DB write in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTHORIZER] Authorization minted:', log_entry);
  }
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Reset counter (for testing only)
 */
export function resetCounterForTesting(): void {
  globalCounter = 0;
}

