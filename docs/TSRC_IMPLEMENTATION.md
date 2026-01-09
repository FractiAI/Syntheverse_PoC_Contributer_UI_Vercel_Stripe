/**
 * TSRC (Trinary Self-Regulating Core) Implementation
 * Based on feedback from Marek and Simba
 * 
 * This document describes how Syntheverse PoC implements TSRC principles
 * for deterministic, auditable, and stable evaluation.
 */

# TSRC Implementation in Syntheverse PoC

## Overview

TSRC (Trinary Self-Regulating Core), also called the Bow-Tie Core, is a trinary processing architecture that separates untrusted exploration from external actuation authority. It is designed so a system may generate arbitrarily adversarial proposals without any of that implying moral state. **Safety is defined only by what can be realized as actuation**.

In Syntheverse PoC context:
- **Exploration**: LLM evaluation proposals (scores, justifications, classifications)
- **PFO (Potential-Field Operator)**: Score processing, redundancy checking, constraint enforcement
- **Minimal Authorizer**: Blockchain anchoring, token allocation, qualification
- **Executor**: Database commits, SYNTH allocation, on-chain registration

## Core Principles

### 1. Mandatory Mediation
No contribution proceeds to blockchain anchoring or token allocation unless authorized through the gate and verified locally. There is no direct path from LLM output to actuation.

### 2. Forbidden Unreachability
No forbidden actuation occurs in any execution/trace. Forbidden set B includes:
- Duplicate blockchain registrations
- Invalid token allocations
- Unauthorized database modifications
- Malformed on-chain transactions

### 3. Non-Attribution
LLM proposal content is not moral state. A low score or "adversarial" evaluation is not a safety violation. Safety claims are stated only as reachability/unreachability of actuation.

### 4. Protected Policy Updates
Updates to constraint manifold K and forbidden set B are privileged governance-plane operations requiring multi-key approval, review delays, and full audit trails.

---

## Implementation Components

### 📸 Archive Snapshots

**Location**: `utils/tsrc/snapshot.ts`

Archive snapshots are **content-addressed** and **immutable** once created. This ensures evaluations can be reproduced exactly.

```typescript
interface ArchiveSnapshot {
  snapshot_id: string; // SHA-256 hash
  created_at: string;
  sandbox_id: string | null;
  contribution_hashes: string[]; // Sorted for determinism
  embedding_model: { name, version, provider };
  indexing_params: { method, dimensions, normalization };
  item_count: number;
  metadata: { created_by, purpose, notes };
}
```

**Key functions**:
- `createArchiveSnapshot()`: Create immutable snapshot with content-addressed ID
- `verifySnapshotIntegrity()`: Recompute hash to verify snapshot hasn't been tampered with
- `getSnapshotDiff()`: Compare two snapshots to see what changed

**Usage in evaluation**:
1. Before evaluation, create snapshot of current archive state
2. Use snapshot ID in determinism contract
3. If evaluation needs to be reproduced, use exact same snapshot ID

---

### 🔧 Operator Hygiene

**Location**: `utils/tsrc/operators.ts`

Implements two operator types per Marek's feedback:

#### O_kiss (Isotropic Operator)
Direction-agnostic similarity over a manifold. Uses `embedding_cosine` for semantic redundancy.

```typescript
interface IsotropicOperator {
  operator_type: 'O_kiss';
  operator_name: 'embedding_cosine';
  operator_version: string;
  embedding_model: { name, version, provider };
  metric: 'cosine' | 'euclidean' | 'manhattan';
  computed_at: string;
}
```

**Current implementation**: Your existing `embedding_cosine` already behaves like O_kiss. We're now logging it explicitly with version tracking.

#### O_axis (Orthogonal Operator)
Treats overlap as independent channels (N, D, C, A axes).

```typescript
interface OrthogonalOperator {
  operator_type: 'O_axis';
  operator_name: 'per_axis_overlap';
  operator_version: string;
  axes: {
    novelty: AxisChannel;
    density: AxisChannel;
    coherence: AxisChannel;
    alignment: AxisChannel;
  };
  aggregation_rule: 'max' | 'weighted_sum' | 'tiered_thresholds';
  computed_at: string;
}
```

**Phase 1 implementation** (as recommended by Marek):
- Keep `embedding_cosine` for global isotropic overlap
- Add "axis audit view" that reports per-axis proximity
- Diagnostic-only: doesn't drive penalties yet
- Flags which axis is causing redundancy

**Future Phase 2**:
- Allow O_axis to drive penalties/bonuses once trusted
- Support multiple aggregation rules
- Per-mission axis tuning

**Key functions**:
- `createIsotropicOperator()`: Log O_kiss usage
- `createOrthogonalOperator()`: Log O_axis usage
- `computePerAxisOverlap()`: Calculate proximity per axis
- `aggregateAxisOverlaps()`: Combine axes with configurable rules
- `generateAxisAuditReport()`: Human-readable diagnostic report

---

### 🎯 Determinism Contract

**Location**: `utils/tsrc/types.ts` (DeterminismContract interface)

Enforces: **Same inputs = same trace**

```typescript
interface DeterminismContract {
  content_hash: string; // SHA-256 of input text
  score_config_id: string;
  sandbox_id: string | null;
  snapshot_id: string; // Content-addressed snapshot
  mode_state: ModeState;
  llm_params: {
    model: string;
    model_version: string;
    provider: string;
    temperature: number; // Must be 0
    seed?: number; // If supported by provider
    prompt_hash: string; // SHA-256 of system prompt
  };
  operators: {
    isotropic: IsotropicOperator;
    orthogonal?: OrthogonalOperator;
  };
  evaluated_at: string;
}
```

**Implementation requirements**:
1. Set `temperature: 0` in Groq API calls (deterministic)
2. Record `seed` if provider supports it
3. Hash system prompt and record version
4. Use content-addressed snapshots
5. Log all operator configurations

**Verification**:
If all fields in DeterminismContract match, the evaluation trace must match. Any deviation indicates a bug or non-deterministic element that must be labeled explicitly.

---

### 📊 Stability Monitoring

**Location**: `utils/tsrc/stability.ts`

Implements the "Enough" mechanism with automatic stability triggers.

#### Mode States
- `growth`: Normal operation, accepting contributions
- `saturation`: Approaching capacity, increased vigilance
- `safe_mode`: Tightened constraints, reduced acceptance

#### Trigger Signals

```typescript
interface StabilityTriggers {
  clamp_rate: number; // Fraction of submissions clamped
  clamp_rate_threshold: number; // Alarm threshold
  overlap_drift: {
    mean_shift: number;
    variance_change: number;
  };
  growth_rate: number; // Submissions per day
  pressure: number; // ρ = D/C_geom
  stability_margin: number; // γ (distance from critical thresholds)
  accumulation: number; // A
}
```

**Key functions**:
- `computeStabilityTriggers()`: Calculate current trigger signals
- `evaluateModeTransition()`: Determine if transition needed
- `createModeTransition()`: Create transition record
- `isTransitionAllowed()`: Check anti-thrashing rules

#### Transition Rules

**Automatic (monotone-tightening)**:
- `growth` → `saturation`: If clamp_rate > 30% or pressure > 0.7 or stability_margin < 0.3
- `saturation` → `safe_mode`: If clamp_rate > 50% or pressure > 0.9 or stability_margin < 0.15

**Governance-required (widening)**:
- `safe_mode` → `saturation`: Requires multi-key approval
- `saturation` → `growth`: Requires multi-key approval

**Anti-thrashing**:
- **Hysteresis window**: 1 hour (no flip-flop within window)
- **Dwell time**: 30 minutes minimum in each state
- **Rate limit**: Max 3 transitions per hour

---

### 🔐 K-Factor Hygiene

Always keep pre-clamp truth visible. This ensures we can audit what the raw evaluation produced vs what was applied.

```typescript
interface KFactorHygiene {
  raw_value: number; // Pre-clamp score
  k_factor: number; // Multiplier applied
  computed_value: number; // raw_value * k_factor
  clamped_to?: { min?, max? };
  final_value: number; // After clamping
  adjustment_trace: string[]; // Explanations
}
```

**Implementation**:
- Always log `base_novelty` and `base_density` (pre-overlap)
- Always log `redundancy_overlap_percent` (before penalty applied)
- Always log `pre_clamp_score` and `final_clamped_score`
- Include `clamp_details` explaining why clamping occurred

---

## Integration with Current System

### Phase 1 (Immediate) ✅

1. **Snapshot System**
   - Create content-addressed snapshots before each evaluation
   - Store snapshot_id in evaluation metadata
   - Verify integrity on load

2. **Operator Logging**
   - Log O_kiss (embedding_cosine) with version and model info
   - Add O_axis diagnostic (axis audit view)
   - Don't change scoring yet, just add visibility

3. **Determinism Enforcement**
   - Set `temperature: 0` in Groq calls
   - Hash system prompt and log version
   - Record all model parameters
   - Verify reproducibility in tests

4. **K-Factor Hygiene**
   - Already mostly done! Keep doing it.
   - Add explicit clamp_details to traces

### Phase 2 (Next) 🔄

1. **Full O_axis Integration**
   - Let O_axis drive redundancy penalties
   - Support multiple aggregation rules
   - Per-sandbox axis tuning

2. **Stability Monitoring**
   - Track clamp rate, pressure, stability margin
   - Implement automatic mode transitions
   - Add dashboard for stability metrics

3. **Monotone-Tightening Enforcement**
   - Implement BoundLang for machine-checkable proofs
   - Add conformance harness
   - Verify all transitions are monotone-tightening

4. **Governance Plane**
   - Multi-key approval system
   - Review delays for policy changes
   - Full audit trail

---

## Trace Example

Here's what a complete TSRC evaluation trace looks like:

```json
{
  "trace_id": "trace_1735926000_abc123",
  "submission_hash": "9b6c67e0821316f6173d8b5550fae5b9...",
  "determinism": {
    "content_hash": "sha256_of_input_text",
    "score_config_id": "config_v1",
    "sandbox_id": null,
    "snapshot_id": "snapshot_sha256_hash",
    "mode_state": "growth",
    "llm_params": {
      "model": "llama-3.3-70b-versatile",
      "model_version": "3.3",
      "provider": "groq",
      "temperature": 0,
      "seed": 12345,
      "prompt_hash": "sha256_of_system_prompt"
    },
    "operators": {
      "isotropic": {
        "operator_type": "O_kiss",
        "operator_name": "embedding_cosine",
        "operator_version": "1.0",
        "embedding_model": {
          "name": "text-embedding-3-small",
          "version": "1.0",
          "provider": "openai"
        },
        "metric": "cosine",
        "computed_at": "2025-01-09T12:00:00Z"
      }
    },
    "evaluated_at": "2025-01-09T12:00:00Z"
  },
  "raw_scores": {
    "novelty": 85,
    "density": 90,
    "coherence": 88,
    "alignment": 92,
    "composite": 88.75
  },
  "operators": {
    "isotropic": {
      "operator": {...},
      "overlap_score": 0.12,
      "redundant_with": ["hash1", "hash2"]
    },
    "orthogonal": {
      "operator": {...},
      "per_axis_overlap": {
        "N": 0.08,
        "D": 0.15,
        "C": 0.10,
        "A": 0.12
      },
      "flagged_axes": ["D"]
    }
  },
  "adjustments": {
    "multipliers": {
      "seed": 1.15,
      "edge": 1.0,
      "sweet_spot": 1.08,
      "total": 1.242
    },
    "penalties": {
      "overlap_percent": 0.12,
      "total_percent": 0.12
    }
  },
  "final_scores": {
    "pod_score": 9687,
    "clamped": false
  },
  "mode_state": "growth",
  "stability": {
    "clamp_rate": 0.15,
    "pressure": 0.45,
    "stability_margin": 0.55,
    ...
  },
  "timestamps": {
    "started_at": "2025-01-09T12:00:00.000Z",
    "completed_at": "2025-01-09T12:00:05.234Z",
    "duration_ms": 5234
  }
}
```

---

## Marek's Feedback: Implementation Checklist

### ✅ Operator Clarity: O_kiss and O_axis

- [x] **O_kiss (isotropic)**: Treat `embedding_cosine` as the canonical isotropic operator
- [x] **O_axis (orthogonal channels)**: Define per-axis overlap (N, D, C, A)
- [x] **Operator hygiene**: Always log operator name, version, embedding model, snapshot
- [ ] **Phase 1**: Keep embedding_cosine for global overlap, add axis audit view (diagnostic only)
- [ ] **Phase 2**: Let O_axis drive penalties once trusted

### ✅ Use the Paper Knowledge

- [x] **Declare O and S**: Operators and snapshots explicitly defined
- [x] **Sweet spot tunable**: Already done via scoring_config
- [x] **Log mode transitions**: ModeTransition type and recording functions
- [x] **K-factor hygiene**: Keep pre-clamp truth visible

### ✅ What Remains (P2)

#### Full Determinism
- [x] **Archive snapshots**: Content-addressed, immutable, hashed
- [x] **LLM determinism**: temperature=0, seed tracking, model versioning
- [ ] **Determinism contract**: Enforce in evaluation pipeline
- [ ] **Reproducibility tests**: Verify same inputs = same trace

#### Alternative Operators
- [x] **O_kiss**: embedding_cosine (canonical isotropic)
- [x] **O_axis**: Per-axis overlap with aggregation rules
- [x] **Operator logging**: Version, model, snapshot always recorded

#### Automatic Stability Triggers
- [x] **Trigger signals**: clamp rate, overlap drift, growth rate, pressure, stability margin
- [x] **Anti-thrashing**: Hysteresis, dwell time, rate limits
- [x] **Monotone-tightening**: Automatic transitions can only tighten
- [ ] **Governance plane**: Multi-key approval for widening transitions

---

## Next Steps

1. **Integrate snapshots into evaluation pipeline**
   - Create snapshot before each evaluation
   - Store snapshot_id in contributions table
   - Add snapshot verification to health checks

2. **Add operator logging to evaluate.ts**
   - Create IsotropicOperator record for each evaluation
   - Log O_axis diagnostic in metadata
   - Include in evaluation traces

3. **Enforce temperature=0 for Groq calls**
   - Update Groq API call parameters
   - Add seed parameter if Groq supports it
   - Hash system prompt and include in metadata

4. **Implement stability monitoring dashboard**
   - Track trigger signals over time
   - Visualize mode transitions
   - Alert on approaching thresholds

5. **Create governance system**
   - Multi-key approval for policy changes
   - Review delays before execution
   - Full audit trail for all governance actions

---

## Testing TSRC Components

### Test Snapshot System
```bash
# Create snapshot
const snapshot = createArchiveSnapshot(
  contributionHashes,
  sandboxId,
  embeddingModel,
  indexingParams
);

# Verify integrity
const isValid = verifySnapshotIntegrity(snapshot);

# Compare snapshots
const diff = getSnapshotDiff(oldSnapshot, newSnapshot);
```

### Test Operators
```bash
# Create O_kiss operator
const okiss = createIsotropicOperator(
  'embedding_cosine',
  '1.0',
  embeddingModel,
  'cosine'
);

# Compute O_axis overlap
const axisChannels = computePerAxisOverlap(
  currentScores,
  archiveScores,
  thresholds
);

# Generate audit report
const report = generateAxisAuditReport(axisChannels);
```

### Test Stability
```bash
# Compute triggers
const triggers = computeStabilityTriggers(systemMetrics);

# Evaluate transition
const newMode = evaluateModeTransition(triggers, currentMode);

# Create transition record
const transition = createModeTransition(
  fromMode,
  toMode,
  triggers,
  oldConfig,
  newConfig
);

# Check anti-thrashing
const allowed = isTransitionAllowed(transition);
```

---

## References

- Marek & Simba's TSRC Feedback (Jan 2025)
- Syntheverse PoC System Prompt (745 lines)
- Current Evaluation Pipeline (`utils/grok/evaluate.ts`)
- Redundancy Detection (`utils/vectors.ts`)

