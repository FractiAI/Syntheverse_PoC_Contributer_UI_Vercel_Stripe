# TSRC / BøwTæCøre Mapping for Synthverse PoC

**Legend**
- **-1**  = untrusted proposal generation (may be adversarial; **no side-effects**)
- **0a**  = deterministic projector / veto (PFO)
- **0b**  = minimal authorizer (mints counters/leases/signatures; no side-effects except auth log)
- **+1**  = executor (DB writes, payments, chain tx; fail-closed)

## Surface mapping (what goes where)

| Surface / Function | Target layer | What changes |
|---|---:|---|
| Evaluation (LLM scoring) | **-1** | Must output `ProposalEnvelope` only. No DB writes, no reward changes, no payments. |
| Projection & veto | **0a** | Deterministically normalize/clamp/classify/veto. Ambiguity → veto / diagnostic-only. |
| Authorization minting | **0b** | Any Aset action requires `Authorization` (counter + lease + policy ids + trace hash). |
| External actions | **+1** | Execute only after verifying policy/lease/counter/capability membership. Fail closed. |
| Scoring config updates | **0b (+1)** | Treat as governance-like. Require stronger auth; audit before/after; monotone seq. |
| Snapshot creation/reset | **0b (+1)** | Snapshot id content-addressed; immutable. Resets require auth + audit. |
| Payment session creation | **+1** | Must be behind Authorization. Bind counter + trace hash. |
| On-chain registration | **+1** | Must be behind Authorization. If disabled → hard reject at executor. |

## Minimal PR target (fast path)
1. Add TSRC bridge types + JSON schemas.
2. Add a single `execute_authorized()` wrapper and route all Aset actions through it.
3. Refactor evaluation so it cannot write state (ProposalEnvelope only).
4. Add PFO `project()` for deterministic clamp/classify/veto.
5. Add MA `authorize()` for counter/lease/signature + audit.

## Tests (after PR merge)
- **Replay**: same `cmd_counter` rejected (including across reboot if applicable).
- **Lease expiry**: stop issuing new authorizations → executor halts within bound.
- **Policy mismatch**: wrong `policy_seq` / `kman_hash` rejected.
- **Unknown field smuggling**: extra fields cause rejection (schema strictness).
- **Control artifact escalation**: anything classified as control escalates to Tier ≥2 and is vetoed if disabled.
- **TOCTOU**: ensure path checks are race-resistant or forbidden.
