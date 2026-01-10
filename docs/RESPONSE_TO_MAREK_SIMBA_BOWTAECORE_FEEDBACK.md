# Response to Marek and Simba: BøwTæCøre Phase 1 Feedback

**From**: Syntheverse Engineering Team (Senior Scientist & Full-Stack Engineer)  
**To**: Marek & Simba  
**Date**: January 10, 2026  
**Re**: Reality-Check Acknowledged, Phase 1 Status Confirmed, Phases 2-6 Roadmap

---

## Executive Summary

Thank you for the precise feedback. **You are absolutely correct**: we have landed **Phase 1 foundation (contracts + schema discipline)**, and **enforcement lands in Phases 2-6**. We acknowledge the critical distinction between:

✅ **What is definitively done** (types, schemas, docs integrated and deployed)  
⚠️ **What cannot be claimed as "already guaranteed"** until gates are wired

We accept your language tightening and commit to the **minimum finish-line path** you've outlined.

---

## 1. Reality Check: What Is Definitively Done (Phase 1)

### ✅ **Confirmed Complete**

#### **1.1 TSRC Bridge Pack Types Integration**
- **Location**: `utils/tsrc/types.ts`
- **Status**: ✅ Integrated and deployed (Vercel production)
- **Types Integrated**:
  ```typescript
  ProposalEnvelope      // Layer -1: Untrusted proposals
  ProjectedCommand      // Layer 0a: Deterministic projector output
  Authorization         // Layer 0b: Minimal authorizer output
  BowTaeCoreContract    // Extends DeterminismContract
  ScoreTrace            // Full gate model metadata
  ```

#### **1.2 Strict JSON Schemas**
- **Location**: `utils/tsrc/schemas/`
- **Files**:
  - `proposal_envelope.schema.json` ✅
  - `projected_command.schema.json` ✅
  - `authorization.schema.json` ✅
- **Strictness Verification** (see Section 3):
  - ✅ All schemas use `"additionalProperties": false` (field smuggling prevention)
  - ✅ All required fields declared
  - ✅ Authorization requires: `cmd_counter`, `policy_seq`, `lease_valid_for_ms`

#### **1.3 Documentation**
- **Location**: `docs/`
- **Files**:
  - `TSRC_BOWTAECORE_INTEGRATION.md` (integration guide)
  - `TSRC_SCHEMA_PRODUCTION_REVIEW.md` (database review)
  - `TSRC_COMPLETION_REPORT_FOR_MAREK_SIMBA.md` (comprehensive report)
  - `STATUS_REPORT_FOR_MAREK.md` (status update)
- **Status**: ✅ Complete, engineer-readable, forwardable

#### **1.4 Production Database Schema**
- **Location**: `supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql`
- **Status**: ✅ Production-ready (type mismatches fixed: UUID→TEXT)
- **Tables**:
  - `proposal_envelopes` (Layer -1)
  - `projected_commands` (Layer 0a)
  - `authorizations` (Layer 0b)
  - `execution_audit_log` (Layer +1)
  - Supporting: `command_counters`, `leases`, `policy_versions`

#### **1.5 Roadmap Honesty**
- **Current Documentation** explicitly states:
  - ✅ "Phase 1: Type Integration — COMPLETE"
  - ✅ "Phase 2: Evaluation Refactor — Next"
  - ✅ "Phases 3-6: PFO, MA, Executor, Tests — To Be Implemented"
- **Deployment Status**: Types and schemas deployed; **enforcement not yet wired**

---

## 2. What We Should NOT Claim as "Already Guaranteed"

### ⚠️ **Acknowledged: Enforcement ≠ Types Alone**

You are correct that these **security properties become true only when gates are wired**:

#### **2.1 Replay Protection**
- **Requires**: Counter storage + executor enforcement (including reboot semantics)
- **Current State**: 
  - ✅ Type exists: `Authorization.cmd_counter`
  - ✅ Schema enforces: `cmd_counter` required, unique index in DB
  - ❌ **Enforcement not wired**: Executor does not yet verify counter uniqueness
- **Becomes Guaranteed**: Phase 4 (0b Authorizer) + Phase 5 (+1 Executor checks)

#### **2.2 Bounded Execution**
- **Requires**: Lease enforcement in +1 (under a declared clock model)
- **Current State**:
  - ✅ Type exists: `Authorization.lease_valid_for_ms`, `lease_id`
  - ✅ Schema enforces: Lease expiry tracking in DB
  - ❌ **Enforcement not wired**: Executor does not yet reject expired leases
- **Becomes Guaranteed**: Phase 5 (+1 Executor validates `expires_at > NOW()`)

#### **2.3 Policy Drift Prevention**
- **Requires**: Runtime checks that `policy_seq`/`kman_hash` match active state at +1 (and ideally at 0b)
- **Current State**:
  - ✅ Type exists: `ProjectedCommand.policy_seq`, `kman_hash`, `bset_hash`
  - ✅ Schema enforces: Monotonic `policy_seq` in `policy_versions` table
  - ❌ **Enforcement not wired**: Executor does not yet verify policy binding
- **Becomes Guaranteed**: Phase 5 (+1 verifies `policy_seq` matches current policy)

#### **2.4 Control Escalation & TOCTOU Resistance**
- **Requires**: Actual 0a projector logic and race-resistant file/path semantics
- **Current State**:
  - ✅ Types exist: `ProjectedCommand.risk_tier`, `artifact_class`
  - ✅ Schema enforces: Risk tier 0-3, artifact class enum
  - ❌ **Enforcement not wired**: Projector (0a) not yet implemented; no veto logic
- **Becomes Guaranteed**: Phase 3 (0a PFO with deterministic veto logic)

---

## 3. Sanity Check: Strictness Verification

### **3.1 Schema Strictness Audit**

We verified all schemas for the properties you specified:

#### **proposal_envelope.schema.json**
```json
{
  "type": "object",
  "additionalProperties": false,  // ✅ STRICT
  "required": [
    "proposal_id",
    "timestamp",
    "intent",
    "action_type",
    "params",
    "trace"
  ],
  "properties": {
    "trace": {
      "type": "object",
      "additionalProperties": false,  // ✅ STRICT (nested)
      "required": ["run_id", "inputs_hash", "determinism"],
      "properties": {
        "determinism": {
          "type": "object",
          "additionalProperties": true,  // ⚠️ PERMISSIVE (see note)
          "required": [
            "provider",
            "model",
            "temperature",
            "prompt_hash",
            "score_config_id",
            "archive_snapshot_id"
          ]
        }
      }
    }
  }
}
```

**Note**: `determinism` object has `"additionalProperties": true` to allow future extension fields (e.g., `mode_state`, `toggles`). If you require full strictness here, we can tighten to `false` and explicitly declare all optional fields.

#### **projected_command.schema.json**
```json
{
  "type": "object",
  "additionalProperties": false,  // ✅ STRICT
  "required": [
    "projection_id",
    "proposal_id",
    "kman_hash",
    "bset_hash",
    "policy_seq",
    "mode_id",
    "closure_active",
    "action_type",
    "params",
    "risk_tier",
    "artifact_class",
    "checks_passed",
    "veto"
  ]
}
```
✅ **Fully strict, no drift possible**

#### **authorization.schema.json**
```json
{
  "type": "object",
  "additionalProperties": false,  // ✅ STRICT
  "required": [
    "command_id",
    "projection_id",
    "issued_at",
    "lease_id",
    "lease_valid_for_ms",    // ✅ Required
    "cmd_counter",            // ✅ Required (anti-replay)
    "kman_hash",
    "bset_hash",
    "policy_seq",             // ✅ Required (policy binding)
    "mode_id",
    "closure_active",
    "action_type",
    "params",
    "signature"
  ]
}
```
✅ **Fully strict, all enforcement fields required**

### **3.2 Bridge Pack Comparison (Attachment Missing)**

You referenced:
> Diff types and schemas against the attached pack:
> - `diff -u utils/tsrc/types.ts TSRC_Bridge_Pack_v1/types.ts`
> - `diff -u utils/tsrc/schemas/proposal_envelope.schema.json TSRC_Bridge_Pack_v1/proposal_envelope.schema.json`

**Issue**: We do not see a `TSRC_Bridge_Pack_v1/` directory or attachment in the repository.

**Request**: Please provide the Bridge Pack reference files so we can:
1. Verify exact type/schema alignment
2. Catch any silent drift
3. Confirm we're implementing your canonical spec

**Workaround**: If the Bridge Pack types match the types you specified in your original BøwTæCøre feedback (which we integrated), our current implementation should be correct. However, we cannot guarantee 100% alignment without the reference files.

---

## 4. Language Tightening for Future Reports

We accept your recommended wording:

### **Old Claim** (Too Strong):
> "Security Properties: Replay protection, bounded execution, policy drift prevention, control escalation, TOCTOU resistance"

### **New Claim** (Accurate):
> "Security Properties (Phase 1: contracts + schema discipline; enforcement lands in Phases 3–5)"

This will be reflected in all future documentation and reports.

---

## 5. Next Actions: Minimum Finish-Line Path

We commit to the **tightest sequence** you've outlined:

### **Phase 2: Make Evaluation Pure (-1)** 🔄 NEXT
**Goal**: `utils/grok/evaluate.ts` returns `ProposalEnvelope` only

**Rule**: Evaluation must not write DB, must not publish score, must not create payment sessions

**Deliverable**:
- [ ] Create `evaluate_to_proposal()` function
- [ ] Returns `ProposalEnvelope` validated via `proposal_envelope.schema.json`
- [ ] Remove all side-effects from evaluation
- [ ] Evaluation becomes pure computation (deterministic input → deterministic proposal)

**Estimated Effort**: 4-6 hours (refactor existing evaluation logic)

---

### **Phase 3: Implement Real PFO Projector (0a)** ⏳ AFTER PHASE 2
**Goal**: Deterministic `project(proposal, policy, mode) -> ProjectedCommand | veto`

**Must**:
- [ ] Normalize/clamp/classify/veto deterministically
- [ ] Ambiguity → veto/diagnostic-only
- [ ] Validate via `projected_command.schema.json`
- [ ] Risk tier assignment based on action type
- [ ] Artifact classification (data vs control)
- [ ] Policy membership checks (against `kman_hash`, `bset_hash`)

**Deliverable**:
- [ ] `utils/tsrc/projector.ts` with `project()` function
- [ ] Veto reasons: `"ambiguous_intent"`, `"capability_not_in_kman"`, `"action_in_bset"`, `"control_artifact_disabled"`
- [ ] Deterministic tests: same proposal + policy → same projection

**Estimated Effort**: 8-12 hours (core gate logic)

---

### **Phase 4: Minimal Authorizer (0b)** ⏳ AFTER PHASE 3
**Goal**: `authorize(projected) -> Authorization`

**Must**:
- [ ] Assign monotone `cmd_counter` (replay-safe)
- [ ] Mint `lease_valid_for_ms` (clock model declared)
- [ ] Sign or HMAC payload (HMAC is fine initially)
- [ ] Log authorization for audit
- [ ] Validate via `authorization.schema.json`

**Deliverable**:
- [ ] `utils/tsrc/authorizer.ts` with `authorize()` function
- [ ] Counter management: `get_next_command_counter()` (already in DB schema)
- [ ] Lease creation: `lease_id`, `expires_at = issued_at + lease_valid_for_ms`
- [ ] HMAC-SHA256 signature (using `sig_alg: "hmac-sha256"`, `canonicalization: "jcs-rfc8785"`)
- [ ] Audit log: Write to `authorizations` table

**Clock Model Declaration**: `wallclock_rfc3339_bounded_skew` (initial; can upgrade to `executor_monotonic` later)

**Estimated Effort**: 6-8 hours (counter + lease + signature logic)

---

### **Phase 5: Wrap +1 Aset Actions** ⏳ AFTER PHASE 4
**Goal**: Every "external side-effect" endpoint routes through one executor choke point

**Example**: `execute_authorized(auth: Authorization, action: string) -> Result`

**+1 Must Enforce**:
- [ ] Schema strictness (reject unknown fields via JSON schema validation)
- [ ] Lease validity (`auth.expires_at > NOW()`)
- [ ] Anti-replay counter check (`cmd_counter` unique, never reused)
- [ ] Policy seq/hash binding (`auth.policy_seq` matches current policy)
- [ ] Capability membership checks (`action_type` in `kman` capabilities)
- [ ] **Fail closed** on any mismatch

**Actions to Wrap**:
1. **DB state publication**: `contributions` table writes (score, metals, qualified status)
2. **Rewards**: Token allocation, epoch distribution
3. **Snapshots**: Archive snapshot creation (if triggers state change)
4. **Payments**: Stripe payment session creation
5. **Chain tx**: Base Mainnet blockchain registration

**Deliverable**:
- [ ] `utils/tsrc/executor.ts` with `execute_authorized()` function
- [ ] Enforcement checks before every side-effect
- [ ] Audit log: Write to `execution_audit_log` table (success, failure, duration, verification results)
- [ ] Clear error messages for each failure mode

**Estimated Effort**: 12-16 hours (wrap all side-effect endpoints)

---

### **Phase 6: Run Seam Tests as Evidence** ⏳ AFTER PHASE 5
**Goal**: Provide test evidence (spec + deployed contracts + test results)

**Tests to Implement**:
1. **Replay rejection** (including reboot condition if used)
   - Submit same `cmd_counter` twice → reject second attempt
   - Reboot scenario: Counter persists across restarts

2. **Lease expiry / lease drop**
   - Create authorization with 10ms lease
   - Wait 15ms, attempt execution → reject (expired)
   - Manual lease revocation → reject

3. **Policy mismatch rejection**
   - Create authorization with `policy_seq: 5`
   - Upgrade policy to `policy_seq: 6`
   - Attempt execution with old auth → reject

4. **Unknown-field smuggling rejection**
   - Submit `ProposalEnvelope` with extra field `"exploit": true"`
   - Schema validation → reject

5. **Control artifact escalation**
   - Tier ≥2 + veto if control artifacts disabled
   - Test: `artifact_class: "control"` when `bset.control_artifacts_disabled: true` → veto

6. **TOCTOU / race resistance verification**
   - Concurrent execution attempts with same authorization → only one succeeds
   - Policy change during execution → fail closed

**Deliverable**:
- [ ] `tests/security/bowtaecore_seam_tests.ts`
- [ ] All 6 test suites passing
- [ ] Test report document (for reviewer packet)

**Estimated Effort**: 10-14 hours (comprehensive security test suite)

---

## 6. Revised Timeline Estimate

| Phase | Description | Estimated Hours | Dependencies |
|-------|-------------|-----------------|--------------|
| **Phase 2** | Make evaluation pure (-1) | 4-6h | None |
| **Phase 3** | Implement PFO projector (0a) | 8-12h | Phase 2 |
| **Phase 4** | Minimal authorizer (0b) | 6-8h | Phase 3 |
| **Phase 5** | Wrap +1 executor | 12-16h | Phase 4 |
| **Phase 6** | Seam tests as evidence | 10-14h | Phase 5 |
| **Total** | End-to-end enforcement | **40-56 hours** | Sequential |

**Calendar Estimate**: 5-7 business days (full-time focus) or 2-3 weeks (parallel work)

---

## 7. Questions for Clarification

### **Q1: Bridge Pack Reference Files**
**Question**: Can you provide the `TSRC_Bridge_Pack_v1/` directory or attachment for exact diff verification?

**Why**: To guarantee zero drift between our implementation and your canonical spec.

**Workaround**: If unavailable, we assume our implementation (based on your original BøwTæCøre feedback) is correct.

---

### **Q2: Strictness on `determinism` Object**
**Question**: Should `ProposalEnvelope.trace.determinism` have `"additionalProperties": false`?

**Current State**: We set it to `true` to allow optional fields (`mode_state`, `toggles`) for future extension.

**Options**:
- **Option A**: Keep `true` (flexible for extension)
- **Option B**: Set `false`, explicitly declare all optional fields (tighter)

**Recommendation**: We lean toward **Option B** (explicit > implicit) for maximum strictness.

---

### **Q3: Clock Model for Lease Enforcement**
**Question**: Which clock model should we declare for lease enforcement?

**Options**:
- `wallclock_rfc3339_bounded_skew`: Simplest, uses system time with bounded drift
- `executor_monotonic`: More complex, requires executor-local monotonic counter
- `none`: No clock assumptions (lease becomes advisory only)

**Recommendation**: Start with `wallclock_rfc3339_bounded_skew` (MVP), upgrade to `executor_monotonic` later if needed.

---

### **Q4: Reboot-Safe Anti-Replay**
**Question**: Should counter persistence survive process restarts?

**Options**:
- **persistent_counter**: Counter stored in DB, survives reboot (required for true anti-replay)
- **epoch_keys**: Different key per process epoch (simpler, but counter resets on restart)

**Current Implementation**: DB-backed counter (`command_counters` table) → **persistent_counter** semantics

**Confirmation**: Is this acceptable, or do you require additional safeguards?

---

### **Q5: HMAC Key Management**
**Question**: How should we manage the HMAC secret key for signature generation?

**Options**:
- **Option A**: Environment variable (`HMAC_SECRET_KEY`) with rotation policy
- **Option B**: Key derivation from master secret (e.g., `kman_hash` as key material)
- **Option C**: External key management service (AWS KMS, Vault)

**Recommendation**: **Option A** for MVP (simple, auditable), **Option C** for production-hardened system.

---

## 8. Commitment Statement

### **What We Guarantee**

✅ **Phase 1 is definitively done**:
- Types, schemas, docs integrated and deployed
- Roadmap honest about what remains (0a partial, 0b next, +1 wrapper next)
- Shared contracts, strict schema, drift-prevention at the shape level

⚠️ **What we will NOT claim until Phases 2-6 complete**:
- Security properties (replay protection, bounded execution, policy drift prevention, control escalation, TOCTOU resistance) are **contracts only** until enforcement wired

📋 **Language tightening adopted**:
- All future reports will state: *"Security Properties (Phase 1: contracts + schema discipline; enforcement lands in Phases 3–5)"*

🛠️ **Phases 2-6 roadmap accepted**:
- We commit to the minimum finish-line path you've outlined
- Sequential implementation: -1 pure → 0a PFO → 0b MA → +1 executor → seam tests
- Estimated timeline: 40-56 hours total effort

---

## 9. Reviewer Packet Preparation

Once Phases 2-6 are complete, we will provide:

### **Spec + Exact Schema Contracts + Deployment Evidence**

1. **Specification**:
   - BøwTæCøre gate model documentation
   - Type definitions (`utils/tsrc/types.ts`)
   - JSON schemas (`utils/tsrc/schemas/*.schema.json`)

2. **Deployed Contracts**:
   - Production database schema (`supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql`)
   - TypeScript implementation (`utils/tsrc/projector.ts`, `authorizer.ts`, `executor.ts`)

3. **Enforcement Evidence**:
   - Phase 2: Evaluation purity (no side-effects, returns `ProposalEnvelope` only)
   - Phase 3: PFO projector tests (determinism, veto logic, classification)
   - Phase 4: Authorizer tests (counter monotonicity, lease creation, signature)
   - Phase 5: Executor tests (fail-closed enforcement, all checks pass)
   - Phase 6: Seam tests (replay, lease expiry, policy mismatch, smuggling, escalation, TOCTOU)

4. **Deployment Evidence**:
   - Vercel production deployment URL
   - Database migration proof (schema version, applied timestamps)
   - API endpoint audit (all +1 actions route through executor)

This reviewer packet will demonstrate: **spec + exact schema contracts + test evidence**, not just prose.

---

## 10. Immediate Next Steps

### **This Week** (Phase 2)
1. ✅ Acknowledge your feedback (this document)
2. 🔄 Refactor `utils/grok/evaluate.ts` to return `ProposalEnvelope` only
3. 🔄 Remove all side-effects from evaluation (no DB writes, no payments)
4. 🔄 Validate proposal against `proposal_envelope.schema.json`
5. 🔄 Create Phase 2 completion report

### **Next Week** (Phase 3)
1. Implement PFO projector (`utils/tsrc/projector.ts`)
2. Deterministic veto logic for ambiguity, capability violations
3. Risk tier and artifact classification
4. Projector test suite

### **Following Weeks** (Phases 4-6)
1. Minimal authorizer (counter, lease, signature)
2. Executor wrapper (fail-closed enforcement)
3. Comprehensive seam tests
4. Reviewer packet assembly

---

## 11. Appreciation & Closing

Thank you for the **precise reality-check feedback**. This is exactly the kind of rigorous review we need before forwarding to a systems-safety reviewer.

**Key Takeaways**:
1. ✅ Phase 1 foundation is solid (types, schemas, docs, honest roadmap)
2. ⚠️ Security properties are **not yet guaranteed** until gates wired (Phases 2-6)
3. 📋 Language tightening adopted: "contracts + schema discipline; enforcement next"
4. 🛠️ Minimum finish-line path accepted: -1 → 0a → 0b → +1 → seam tests

We are ready to proceed with **Phase 2** immediately and will provide progress updates at each phase completion.

Please answer our 5 clarification questions when convenient, and provide the Bridge Pack reference files if available for exact diff verification.

---

**Respectfully submitted,**  
Syntheverse Engineering Team  
(Acting as Senior Scientist & Full-Stack Engineer)

**Date**: January 10, 2026  
**Status**: Phase 1 Complete, Phases 2-6 Roadmap Accepted  
**Next Action**: Begin Phase 2 (Make evaluation pure)

---

## Appendix A: Current Repository State Summary

### **Files Verified**
- ✅ `utils/tsrc/types.ts` (Bridge Pack types integrated)
- ✅ `utils/tsrc/schemas/*.schema.json` (3 strict schemas)
- ✅ `supabase/migrations/tsrc_bowtaecore_schema_v2_production.sql` (production-ready)
- ✅ `docs/TSRC_BOWTAECORE_INTEGRATION.md` (integration guide)
- ✅ `docs/TSRC_SCHEMA_PRODUCTION_REVIEW.md` (database review)

### **Current Gaps** (Phases 2-6)
- ❌ Evaluation still has side-effects (writes DB directly)
- ❌ Projector (0a) not implemented
- ❌ Authorizer (0b) not implemented
- ❌ Executor (+ not wrapped with authorization checks
- ❌ Seam tests not written

### **Total LOC to Complete Phases 2-6**
- Estimated: 1,500-2,000 lines of new code
- Estimated: 800-1,200 lines of test code
- **Total**: ~2,300-3,200 lines

---

## Appendix B: Schema Strictness Verification Table

| Schema | `additionalProperties` | All Required Fields Present | Counter Required | Lease Required | Policy Seq Required |
|--------|------------------------|----------------------------|------------------|----------------|---------------------|
| `proposal_envelope.schema.json` | `false` ✅ | ✅ | N/A | N/A | N/A |
| `projected_command.schema.json` | `false` ✅ | ✅ | N/A | N/A | ✅ Yes |
| `authorization.schema.json` | `false` ✅ | ✅ | ✅ Yes | ✅ Yes | ✅ Yes |

**Conclusion**: All schemas are strict except `determinism` nested object (see Q2 above).

---

**End of Response Document**

