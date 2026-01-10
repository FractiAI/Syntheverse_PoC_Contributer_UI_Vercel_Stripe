# TSRC + BøwTæCøre Integration

## Overview

The Syntheverse PoC now integrates two complementary TSRC systems:

1. **Existing TSRC**: Determinism, snapshots, operator hygiene (evaluation layer)
2. **BøwTæCøre Gate Model**: Authorization, security, fail-closed execution (actuation layer)

---

## Architecture Layers

### **Layer -1: Untrusted Proposals**
- **What**: Evaluation engine generates scoring proposals
- **Safety**: No side-effects, no DB writes, no payments
- **Output**: `ProposalEnvelope`
- **Current Status**: ✅ Implemented (evaluation returns proposals only)

### **Layer 0a: Deterministic Projector (PFO)**
- **What**: Normalizes, classifies, and can veto proposals
- **Safety**: Deterministic only, ambiguity → veto
- **Output**: `ProjectedCommand`
- **Current Status**: 🔄 Partial (clamping exists, need full PFO)

### **Layer 0b: Minimal Authorizer (MA)**
- **What**: Mints counters, leases, signatures
- **Safety**: No side-effects except auth log
- **Output**: `Authorization`
- **Current Status**: ⏳ To be implemented

### **Layer +1: Fail-Closed Executor**
- **What**: DB writes, payments, blockchain transactions
- **Safety**: Only executes with valid Authorization
- **Output**: State changes (audited)
- **Current Status**: ⏳ Needs Authorization wrapper

---

## Type Integration

### **BøwTæCøre Types** (New)
```typescript
// Layer -1
ProposalEnvelope

// Layer 0a
ProjectedCommand

// Layer 0b
Authorization

// Supporting
BowTaeCoreContract
ScoreTrace
UUID, Hex, RiskTier, ArtifactClass
```

### **Existing TSRC Types** (Keep)
```typescript
ArchiveSnapshot
IsotropicOperator (O_kiss)
OrthogonalOperator (O_axis)
DeterminismContract (now aliased to BowTaeCoreContract)
TSRCEvaluationTrace
ModeTransition
StabilityTriggers
```

---

## JSON Schemas

Located in: `utils/tsrc/schemas/`

- `proposal_envelope.schema.json`
- `projected_command.schema.json`
- `authorization.schema.json`

**Purpose**: Strict validation, prevents field smuggling, ensures no drift

---

## Implementation Roadmap

### **Phase 1: Type Integration** ✅ COMPLETE
- [x] Merge BøwTæCøre types into `utils/tsrc/types.ts`
- [x] Add JSON schemas to `utils/tsrc/schemas/`
- [x] Document endpoint mapping in `docs/tsrc_endpoint_map.md`
- [x] Update DeterminismContract → BowTaeCoreContract

### **Phase 2: Evaluation Refactor** (Next)
- [ ] Modify `utils/grok/evaluate.ts` to return `ProposalEnvelope` only
- [ ] Remove direct DB writes from evaluation
- [ ] Add trace_id and proposal_id to all evaluations
- [ ] Validate against `proposal_envelope.schema.json`

### **Phase 3: Projector (PFO)** (Layer 0a)
- [ ] Create `utils/tsrc/projector.ts`
- [ ] Implement `project(proposal: ProposalEnvelope): ProjectedCommand`
- [ ] Add veto logic for ambiguous/invalid proposals
- [ ] Classify risk tiers and artifact classes
- [ ] Validate against `projected_command.schema.json`

### **Phase 4: Minimal Authorizer (MA)** (Layer 0b)
- [ ] Create `utils/tsrc/authorizer.ts`
- [ ] Implement counter management (anti-replay)
- [ ] Implement lease management (time-bound)
- [ ] Implement HMAC signatures (upgrade to ed25519 later)
- [ ] Validate against `authorization.schema.json`

### **Phase 5: Executor Wrapper** (Layer +1)
- [ ] Create `utils/tsrc/executor.ts`
- [ ] Wrap all Aset actions: `execute_authorized(auth: Authorization)`
- [ ] Verify signature, counter, lease, policy
- [ ] Fail closed on any validation failure
- [ ] Audit all executions

### **Phase 6: End-to-End Tests**
- [ ] Replay attack prevention (same counter rejected)
- [ ] Lease expiry (expired auth rejected)
- [ ] Policy mismatch (wrong policy_seq rejected)
- [ ] Field smuggling (extra fields rejected by schema)
- [ ] Control artifact escalation (vetoed if disabled)
- [ ] TOCTOU resistance (race condition tests)

---

## Current Integration Points

### **Where BøwTæCøre Types Are Used**

1. **`utils/tsrc/types.ts`**
   - Full type definitions
   - ProposalEnvelope, ProjectedCommand, Authorization
   - BowTaeCoreContract (extends DeterminismContract)

2. **`utils/tsrc/schemas/`**
   - JSON Schema validation files
   - Used for runtime validation
   - Prevents drift and field smuggling

3. **`docs/tsrc_endpoint_map.md`**
   - Surface mapping: which layer handles what
   - Minimal PR target for fast path
   - Test requirements

### **Where Existing TSRC Is Used**

1. **`utils/tsrc/snapshot.ts`**
   - Content-addressed archive snapshots
   - Immutable snapshot creation
   - Snapshot integrity verification

2. **`utils/tsrc/operators.ts`**
   - O_kiss (isotropic similarity)
   - O_axis (orthogonal channels)
   - Operator hygiene

3. **`utils/tsrc/stability.ts`**
   - Mode transitions (growth → saturation → safe_mode)
   - Stability triggers and monitoring
   - Anti-thrashing logic

4. **`utils/grok/evaluate.ts`**
   - Uses TSRC determinism contract
   - Creates archive snapshots
   - Logs operator results

---

## Key Principles

### **Determinism** (TSRC Core)
- Same input + same config = same output
- All non-deterministic elements logged
- Temperature must be 0 for determinism
- Content-addressed snapshots

### **Fail-Closed** (BøwTæCøre Core)
- No execution without Authorization
- Veto on ambiguity
- Counter prevents replay
- Lease bounds execution window

### **Monotone Tightening** (Both)
- Capability can only shrink, never expand
- Widening requires governance approval
- Mode transitions are one-way
- Policy version monotonically increases

### **Auditability** (Both)
- Every proposal logged
- Every projection logged
- Every authorization logged
- Every execution logged
- Full trace from -1 → +1

---

## Usage Examples

### **Example 1: Score a PoC (Full Pipeline)**

```typescript
// Layer -1: Untrusted proposal
const proposal: ProposalEnvelope = {
  proposal_id: generateUUID(),
  timestamp: new Date().toISOString(),
  intent: "score_poc_submission",
  action_type: "score_poc_proposal",
  params: {
    submission_id: "sub_123",
    content_hash: "abc123...",
    user_id: "user_456"
  },
  trace: {
    run_id: "run_789",
    inputs_hash: hashInputs(content),
    determinism: {
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      prompt_hash: hashPrompt(systemPrompt),
      score_config_id: "v2.0.13",
      archive_snapshot_id: currentSnapshot.snapshot_id,
      mode_state: "growth"
    }
  }
};

// Layer 0a: Project and classify
const projected: ProjectedCommand = await project(proposal);

if (projected.veto.is_veto) {
  console.log("Vetoed:", projected.veto.reason);
  return; // Stop here, no execution
}

// Layer 0b: Authorize
const auth: Authorization = await authorize(projected);

// Layer +1: Execute (fail-closed)
const result = await execute_authorized(auth);
```

### **Example 2: Replay Attack Prevention**

```typescript
// First execution
const auth1 = await authorize(projected);
await execute_authorized(auth1); // ✅ Success, counter = 1

// Attacker tries replay
const auth1_replayed = auth1; // Same authorization
await execute_authorized(auth1_replayed); // ❌ Rejected: counter already used
```

### **Example 3: Lease Expiry**

```typescript
// Authorize with 5-minute lease
const auth = await authorize(projected, { lease_ms: 5 * 60 * 1000 });

// Execute immediately
await execute_authorized(auth); // ✅ Success

// Try to reuse after 10 minutes
await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
await execute_authorized(auth); // ❌ Rejected: lease expired
```

---

## Security Properties

### **What BøwTæCøre Prevents**

1. ✅ **Replay attacks**: Counter ensures one-time use
2. ✅ **Unbounded execution**: Lease limits time window
3. ✅ **Policy drift**: Monotonic policy_seq + hash verification
4. ✅ **Field smuggling**: Strict JSON schemas reject extra fields
5. ✅ **Control escalation**: Risk tiers enforced, control artifacts vetoed
6. ✅ **TOCTOU**: All checks in projector, executor only verifies

### **What Existing TSRC Prevents**

1. ✅ **Non-determinism**: Reproducible evaluations
2. ✅ **Archive mutation**: Content-addressed immutable snapshots
3. ✅ **Operator drift**: Versioned, logged operator configurations
4. ✅ **Mode thrashing**: Anti-thrashing with hysteresis
5. ✅ **Capability expansion**: Monotone-tightening transitions

---

## Testing Requirements

From `docs/tsrc_endpoint_map.md`:

- [ ] **Replay**: Same `cmd_counter` rejected (including across reboot)
- [ ] **Lease expiry**: Stop issuing auths → executor halts within bound
- [ ] **Policy mismatch**: Wrong `policy_seq` / `kman_hash` rejected
- [ ] **Unknown field smuggling**: Extra fields cause rejection (schema strictness)
- [ ] **Control artifact escalation**: Control actions escalate to Tier ≥2, vetoed if disabled
- [ ] **TOCTOU**: Ensure path checks are race-resistant or forbidden

---

## Documentation Links

- **Type Definitions**: `utils/tsrc/types.ts`
- **JSON Schemas**: `utils/tsrc/schemas/*.schema.json`
- **Endpoint Mapping**: `docs/tsrc_endpoint_map.md`
- **Original TSRC Report**: `docs/TSRC_COMPLETION_REPORT_FOR_MAREK_SIMBA.md`
- **Bridge Pack README**: `/Users/macbook/Downloads/TSRC_Bridge_Pack_v1/README.md`

---

## Next Steps

1. **Review this integration document**
2. **Start Phase 2**: Refactor evaluation to return ProposalEnvelope
3. **Implement Phase 3**: Build deterministic projector (PFO)
4. **Implement Phase 4**: Build minimal authorizer (MA)
5. **Implement Phase 5**: Wrap executors with Authorization checks
6. **Run Phase 6**: End-to-end security tests

---

**Status**: ✅ **Phase 1 Complete - Types Integrated**  
**Next**: 🔄 **Phase 2 - Evaluation Refactor**

*Last Updated: January 10, 2026*

