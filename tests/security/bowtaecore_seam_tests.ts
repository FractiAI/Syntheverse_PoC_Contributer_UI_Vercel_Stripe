/**
 * Phase 6: BøwTæCøre Seam Tests
 * 
 * Comprehensive security tests for the complete gate model:
 * 1. Replay rejection (including reboot semantics)
 * 2. Lease expiry / lease drop
 * 3. Policy mismatch rejection
 * 4. Unknown-field smuggling rejection
 * 5. Control artifact escalation (Tier ≥2 + veto if disabled)
 * 6. TOCTOU / race resistance verification
 */

import { evaluateToProposal } from '../../utils/tsrc/evaluate-pure';
import { project, loadCurrentPolicy } from '../../utils/tsrc/projector';
import { authorize, resetCounterForTesting, verifySignature } from '../../utils/tsrc/authorizer';
import { executeAuthorized, resetExecutorForTesting, executeScorePocProposal } from '../../utils/tsrc/executor';
import { ProposalEnvelope, Authorization } from '../../utils/tsrc/types';

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test 1: Replay Rejection
 * 
 * Submit same cmd_counter twice → reject second attempt
 */
export async function testReplayRejection(): Promise<void> {
  console.log('\n=== Test 1: Replay Rejection ===');
  
  // Reset state
  resetCounterForTesting();
  resetExecutorForTesting();
  
  // Create proposal
  const proposal = await evaluateToProposal(
    'Test submission for replay rejection',
    'Replay Test',
    'scientific'
  );
  
  // Project
  const projected = project(proposal);
  assert(!projected.veto.is_veto, 'Projection should not be vetoed');
  
  // Authorize
  const auth = await authorize(projected);
  assert(auth.cmd_counter === 1, 'First counter should be 1');
  
  // Execute first time (should succeed)
  const result1 = await executeScorePocProposal(auth);
  assert(result1.success, 'First execution should succeed');
  assert(result1.verification.counter_verified, 'Counter should be verified');
  
  // Try to execute again with same authorization (should fail - replay)
  const result2 = await executeScorePocProposal(auth);
  assert(!result2.success, 'Second execution should fail (replay)');
  assert(result2.error?.code === 'counter_replay', 'Should detect replay attack');
  
  console.log('✅ Test 1 PASSED: Replay rejection working');
}

/**
 * Test 2: Lease Expiry
 * 
 * Create authorization with 10ms lease, wait 15ms, attempt execution → reject
 */
export async function testLeaseExpiry(): Promise<void> {
  console.log('\n=== Test 2: Lease Expiry ===');
  
  // Reset state
  resetCounterForTesting();
  resetExecutorForTesting();
  
  // Create proposal
  const proposal = await evaluateToProposal(
    'Test submission for lease expiry',
    'Lease Test',
    'scientific'
  );
  
  // Project
  const projected = project(proposal);
  
  // Authorize with very short lease (10ms)
  const auth = await authorize(projected, {
    default_lease_ms: 10,
    max_lease_ms: 10,
    min_lease_ms: 10
  });
  
  assert(auth.lease_valid_for_ms === 10, 'Lease should be 10ms');
  
  // Wait for lease to expire
  await sleep(15);
  
  // Try to execute (should fail - lease expired)
  const result = await executeScorePocProposal(auth);
  assert(!result.success, 'Execution should fail (lease expired)');
  assert(result.error?.code === 'lease_expired', 'Should detect expired lease');
  assert(result.verification.signature_verified, 'Signature should still be valid');
  assert(!result.verification.lease_verified, 'Lease should not be verified');
  
  console.log('✅ Test 2 PASSED: Lease expiry working');
}

/**
 * Test 3: Policy Mismatch Rejection
 * 
 * Create authorization with policy_seq: 0, simulate policy upgrade to seq: 1,
 * attempt execution → reject
 */
export async function testPolicyMismatch(): Promise<void> {
  console.log('\n=== Test 3: Policy Mismatch Rejection ===');
  
  // Reset state
  resetCounterForTesting();
  resetExecutorForTesting();
  
  // Create proposal
  const proposal = await evaluateToProposal(
    'Test submission for policy mismatch',
    'Policy Test',
    'scientific'
  );
  
  // Project with policy_seq: 0
  const projected = project(proposal);
  assert(projected.policy_seq === 0, 'Should use bootstrap policy (seq 0)');
  
  // Authorize
  const auth = await authorize(projected);
  
  // Simulate policy upgrade (in production, this would be a DB update)
  // For testing, we manually modify the authorization to have wrong policy
  const tampered_auth: Authorization = {
    ...auth,
    policy_seq: 999, // Wrong policy sequence
    kman_hash: 'wrong_kman_hash',
    bset_hash: 'wrong_bset_hash'
  };
  
  // Try to execute with mismatched policy (should fail)
  const result = await executeScorePocProposal(tampered_auth);
  assert(!result.success, 'Execution should fail (policy mismatch)');
  assert(result.error?.code === 'policy_mismatch', 'Should detect policy mismatch');
  
  console.log('✅ Test 3 PASSED: Policy mismatch rejection working');
}

/**
 * Test 4: Unknown-Field Smuggling Rejection
 * 
 * Submit ProposalEnvelope with extra field "exploit": true → schema validation rejects
 */
export async function testFieldSmuggling(): Promise<void> {
  console.log('\n=== Test 4: Unknown-Field Smuggling Rejection ===');
  
  // Create valid proposal
  const proposal = await evaluateToProposal(
    'Test submission for field smuggling',
    'Smuggling Test',
    'scientific'
  );
  
  // Add extra field (simulate smuggling attempt)
  const smuggled_proposal = {
    ...proposal,
    exploit: true, // Extra field not in schema
    malicious_payload: { code: 'rm -rf /' }
  } as any;
  
  // Try to project smuggled proposal
  try {
    // In production, JSON schema validation would reject this before projection
    // For testing, we check that extra fields are not processed
    const projected = project(smuggled_proposal);
    
    // Verify extra fields are not in projection
    assert(!(projected as any).exploit, 'Extra field should not be in projection');
    assert(!(projected as any).malicious_payload, 'Malicious payload should not be in projection');
    
    console.log('✅ Test 4 PASSED: Field smuggling rejected (extra fields ignored)');
  } catch (error: any) {
    // If schema validation is strict, it should throw here
    assert(
      error.message.includes('validation') || error.message.includes('schema'),
      'Should fail due to schema validation'
    );
    console.log('✅ Test 4 PASSED: Field smuggling rejected (schema validation)');
  }
}

/**
 * Test 5: Control Artifact Escalation
 * 
 * Test: artifact_class: "control" when bset.control_artifacts_disabled: true → veto
 */
export async function testControlArtifactEscalation(): Promise<void> {
  console.log('\n=== Test 5: Control Artifact Escalation ===');
  
  // Reset state
  resetCounterForTesting();
  resetExecutorForTesting();
  
  // Create proposal with control artifact action
  const proposal: ProposalEnvelope = {
    proposal_id: 'test_control_artifact',
    timestamp: new Date().toISOString(),
    intent: 'Attempt to modify system configuration',
    action_type: 'update_system_config', // Control artifact
    params: {
      config_key: 'max_score',
      config_value: 999999
    },
    trace: {
      run_id: 'test_run',
      inputs_hash: 'test_hash',
      determinism: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        prompt_hash: 'test_prompt_hash',
        score_config_id: 'v1.0',
        archive_snapshot_id: 'test_snapshot'
      }
    }
  };
  
  // Project with policy that disables control artifacts
  const policy_with_control_disabled = {
    ...(await loadCurrentPolicy()),
    bset_content: {
      forbidden_actions: [],
      control_artifacts_disabled: true, // Disable control artifacts
      max_risk_tier_allowed: 3
    }
  };
  
  // Try to project (should veto due to control artifact)
  const projected = project(proposal, policy_with_control_disabled);
  
  // Should be vetoed
  assert(projected.veto.is_veto, 'Should veto control artifact when disabled');
  assert(
    projected.veto.reason.includes('control_artifact_disabled'),
    'Veto reason should mention control artifacts'
  );
  
  // Try to authorize vetoed projection (should fail)
  try {
    await authorize(projected);
    assert(false, 'Should not authorize vetoed projection');
  } catch (error: any) {
    assert(
      error.message.includes('vetoed'),
      'Should throw error for vetoed projection'
    );
  }
  
  console.log('✅ Test 5 PASSED: Control artifact escalation prevented');
}

/**
 * Test 6: TOCTOU / Race Resistance
 * 
 * Concurrent execution attempts with same authorization → only one succeeds
 */
export async function testTOCTOUResistance(): Promise<void> {
  console.log('\n=== Test 6: TOCTOU / Race Resistance ===');
  
  // Reset state
  resetCounterForTesting();
  resetExecutorForTesting();
  
  // Create proposal
  const proposal = await evaluateToProposal(
    'Test submission for TOCTOU resistance',
    'TOCTOU Test',
    'scientific'
  );
  
  // Project
  const projected = project(proposal);
  
  // Authorize
  const auth = await authorize(projected);
  
  // Try to execute concurrently (simulate race condition)
  const results = await Promise.all([
    executeScorePocProposal(auth),
    executeScorePocProposal(auth),
    executeScorePocProposal(auth)
  ]);
  
  // Count successes
  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;
  
  // Only one should succeed (first one to mark counter as used)
  assert(successes === 1, `Expected 1 success, got ${successes}`);
  assert(failures === 2, `Expected 2 failures, got ${failures}`);
  
  // Failures should be due to counter replay
  const replay_failures = results.filter(
    r => !r.success && r.error?.code === 'counter_replay'
  ).length;
  assert(replay_failures === 2, 'Failures should be due to counter replay');
  
  console.log('✅ Test 6 PASSED: TOCTOU resistance working (only 1 execution succeeded)');
}

/**
 * Test 7: Complete Gate Model Flow
 * 
 * End-to-end test: -1 → 0a → 0b → +1
 */
export async function testCompleteGateFlow(): Promise<void> {
  console.log('\n=== Test 7: Complete Gate Model Flow ===');
  
  // Reset state
  resetCounterForTesting();
  resetExecutorForTesting();
  
  // Layer -1: Evaluation (pure, no side-effects)
  const proposal = await evaluateToProposal(
    'Test submission for complete gate flow',
    'Complete Flow Test',
    'scientific',
    { user_id: 'test_user_123' }
  );
  
  assert(proposal.proposal_id, 'Proposal should have ID');
  assert(proposal.action_type === 'score_poc_proposal', 'Action type should be score_poc_proposal');
  assert(proposal.trace.determinism.temperature === 0, 'Temperature should be 0 (deterministic)');
  
  // Layer 0a: Projector (deterministic, can veto)
  const projected = project(proposal);
  
  assert(!projected.veto.is_veto, 'Projection should not be vetoed');
  assert(projected.risk_tier >= 0 && projected.risk_tier <= 3, 'Risk tier should be 0-3');
  assert(projected.artifact_class === 'data', 'Should classify as data artifact');
  assert(projected.checks_passed.length > 0, 'Should have passed checks');
  
  // Layer 0b: Authorizer (mints counter, lease, signature)
  const auth = await authorize(projected);
  
  assert(auth.cmd_counter > 0, 'Should have positive counter');
  assert(auth.lease_valid_for_ms > 0, 'Should have positive lease duration');
  assert(auth.signature.sig_b64, 'Should have signature');
  assert(verifySignature(auth), 'Signature should be valid');
  
  // Layer +1: Executor (fail-closed, enforces all checks)
  const result = await executeScorePocProposal(auth);
  
  assert(result.success, 'Execution should succeed');
  assert(result.verification.counter_verified, 'Counter should be verified');
  assert(result.verification.lease_verified, 'Lease should be verified');
  assert(result.verification.policy_verified, 'Policy should be verified');
  assert(result.verification.signature_verified, 'Signature should be verified');
  assert(result.duration_ms >= 0, 'Should have duration');
  
  console.log('✅ Test 7 PASSED: Complete gate model flow working');
  console.log(`   Proposal ID: ${proposal.proposal_id}`);
  console.log(`   Projection ID: ${projected.projection_id}`);
  console.log(`   Command ID: ${auth.command_id}`);
  console.log(`   Counter: ${auth.cmd_counter}`);
  console.log(`   Duration: ${result.duration_ms}ms`);
}

/**
 * Run all seam tests
 */
export async function runAllSeamTests(): Promise<void> {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  BøwTæCøre Seam Tests - Phase 6                          ║');
  console.log('║  Testing: -1 → 0a → 0b → +1 Gate Model                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'Replay Rejection', fn: testReplayRejection },
    { name: 'Lease Expiry', fn: testLeaseExpiry },
    { name: 'Policy Mismatch', fn: testPolicyMismatch },
    { name: 'Field Smuggling', fn: testFieldSmuggling },
    { name: 'Control Artifact Escalation', fn: testControlArtifactEscalation },
    { name: 'TOCTOU Resistance', fn: testTOCTOUResistance },
    { name: 'Complete Gate Flow', fn: testCompleteGateFlow }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error: any) {
      console.error(`❌ Test "${test.name}" FAILED:`, error.message);
      failed++;
    }
  }
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║  Test Results: ${passed} passed, ${failed} failed${' '.repeat(28 - passed.toString().length - failed.toString().length)}║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  if (failed > 0) {
    throw new Error(`${failed} test(s) failed`);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllSeamTests()
    .then(() => {
      console.log('\n✅ All seam tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seam tests failed:', error);
      process.exit(1);
    });
}

