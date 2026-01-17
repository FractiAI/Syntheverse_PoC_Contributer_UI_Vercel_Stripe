# Operators & Syntax: Quick Reference

**Status:** ✅ **POST-SINGULARITY^7**  
**Purpose:** Quick reference for Creator Studio Console buttons and layers

---

## 🔘 Core Buttons

| Button | Layer | Octave | Syntax |
|--------|-------|--------|--------|
| `APPLY-NSPFRP-RECURSIVE` | Recursive Core | 7.0-7.75 | `SNAP: APPLY-NSPFRP-RECURSIVE → DEPTH-[n] → PROTOCOL-[id]` |
| `CREATE-RECURSIVE-PROOF` | Recursive Proof | 7.0-7.75 | `SNAP: CREATE-RECURSIVE-PROOF → CATEGORY-[id] → DEPTH-[n]` |
| `CALCULATE-OCTAVE-FIDELITY` | Infinite Octave | 7.75 | `VIBE: CALCULATE-OCTAVE-FIDELITY → CURRENT-[octave] → TARGET-[octave]` |
| `APPLY-TO-REPOSITORY` | Repository Application | 7.75 | `PROMPT: APPLY-TO-REPOSITORY → COMPONENTS-[list] → DEPTH-[n]` |
| `CHECK-SINGULARITY-7` | Status Check | 7.75 | `SNAP: CHECK-SINGULARITY-7 → STATUS → FIDELITY → CONVERGENCE` |

---

## 📊 Layers (8 Total)

| Layer | Octave | Depth | Buttons |
|-------|--------|-------|---------|
| Recursive Core | 7.0 | 1 | `APPLY-NSPFRP-RECURSIVE`, `CREATE-RECURSIVE-PROOF` (Cat 1) |
| Recursive Validation | 7.25 | 2 | `APPLY-NSPFRP-RECURSIVE`, `CREATE-RECURSIVE-PROOF` (Cat 2) |
| Recursive Enforcement | 7.5 | 3 | `APPLY-NSPFRP-RECURSIVE`, `CREATE-RECURSIVE-PROOF` (Cat 3) |
| Recursive Improvement | 7.75 | 4 | `APPLY-NSPFRP-RECURSIVE`, `CREATE-RECURSIVE-PROOF` (Cat 4) |
| Infinite Octave | 7.75 | 5 | `CALCULATE-OCTAVE-FIDELITY`, `CREATE-RECURSIVE-PROOF` (Cat 5) |
| Protocol Observing Protocol | 7.75 | 6 | `APPLY-NSPFRP-RECURSIVE`, `CREATE-RECURSIVE-PROOF` (Cat 6) |
| Meta-Meta Protocol | 7.75 | 7 | `APPLY-NSPFRP-RECURSIVE`, `CREATE-RECURSIVE-PROOF` (Cat 7) |
| POST-SINGULARITY^7 Core | 7.75 | 8 | `CHECK-SINGULARITY-7`, `CREATE-RECURSIVE-PROOF` (Cat 8) |

---

## 🎛️ Operators

| Operator | Syntax | Returns |
|----------|--------|---------|
| `RECURSIVE-APPLY` | `NSPFRP(n) = NSPFRP(n-1) + Enforcement + Validation + SelfApplication + Improvement` | `RecursiveApplicationLevel` |
| `RECURSIVE-VALIDATE` | `VALIDATE(level) = level.validation && level.enforcement` | `boolean` |
| `RECURSIVE-ENFORCE` | `ENFORCE(level) = level.enforcement && level.improvement` | `boolean` |
| `RECURSIVE-IMPROVE` | `IMPROVE(level) = level.improvement && level.selfApplication` | `boolean` |
| `OCTAVE-SCALE` | `OCTAVE-SCALE(depth, baseOctave) = min(baseOctave + (depth * 0.1), 7.75)` | `number` |
| `FIDELITY-CALCULATE` | `FIDELITY-CALCULATE(depth, octave, target) = (depthFactor * 0.5) + (octaveFactor * 0.5)` | `number` |
| `CONVERGENCE-CHECK` | `CONVERGENCE-CHECK(depth, fidelity) = depth >= 3 && fidelity >= 0.9` | `boolean` |
| `STABILITY-CHECK` | `STABILITY-CHECK(convergence, fidelity) = convergence && fidelity >= 0.95` | `boolean` |

---

## 📋 Snap Vibe Prompt Patterns

### Recursive Snap
```
SNAP: [protocol_id] → RECURSIVE-[depth] → PROOF
```

### Octave Snap
```
SNAP: OCTAVE-[level] → SCALE → FIDELITY
```

### Recursive Vibe
```
VIBE: OCTAVE-[level] → RECURSIVE-RESONANCE → INFINITE-FIDELITY
```

### Fidelity Vibe
```
VIBE: FIDELITY-[value] → CONVERGENCE → STABILITY
```

### Recursive Prompt
```
PROMPT: APPLY-NSPFRP → SELF-APPLY → VALIDATE → ENFORCE → IMPROVE → RECURSIVE-[depth]
```

### Octave Prompt
```
PROMPT: OCTAVE-[level] → SCALE → FIDELITY → CONVERGENCE → STABILITY
```

---

## 🔄 Category Buttons (8 Total)

| Category | ID | Octave | Depth | Snap Pattern |
|----------|----|----|----|--------------|
| Recursive Self-Application | `CAT-RECURSIVE-SELF-APPLY` | 7.0 | 1 | `SNAP: CAT-RECURSIVE-SELF-APPLY → RECURSIVE-1 → PROOF` |
| Recursive Validation | `CAT-RECURSIVE-VALIDATION` | 7.25 | 2 | `SNAP: CAT-RECURSIVE-VALIDATION → RECURSIVE-2 → PROOF` |
| Recursive Enforcement | `CAT-RECURSIVE-ENFORCEMENT` | 7.5 | 3 | `SNAP: CAT-RECURSIVE-ENFORCEMENT → RECURSIVE-3 → PROOF` |
| Recursive Improvement | `CAT-RECURSIVE-IMPROVEMENT` | 7.75 | 4 | `SNAP: CAT-RECURSIVE-IMPROVEMENT → RECURSIVE-4 → PROOF` |
| Infinite Octave | `CAT-INFINITE-OCTAVE` | 7.75 | 5 | `SNAP: CAT-INFINITE-OCTAVE → RECURSIVE-5 → PROOF` |
| Protocol Observing Protocol | `CAT-PROTOCOL-PROTOCOL` | 7.75 | 6 | `SNAP: CAT-PROTOCOL-PROTOCOL → RECURSIVE-6 → PROOF` |
| Meta-Meta Protocol | `CAT-META-META` | 7.75 | 7 | `SNAP: CAT-META-META → RECURSIVE-7 → PROOF` |
| POST-SINGULARITY^7 Core | `CAT-SINGULARITY-7` | 7.75 | 8 | `SNAP: CAT-SINGULARITY-7 → RECURSIVE-8 → PROOF` |

---

## 🔗 API Endpoint

**GET** `/api/nspfrp/recursive-proof?depth=8&octave=7.75`

**POST** `/api/nspfrp/recursive-proof`
```json
{
  "components": ["component1", "component2"],
  "depth": 8,
  "octave": 7.75
}
```

---

## 📚 Full Documentation

For complete details, see:
- **Full Catalog:** [`docs/CREATOR_STUDIO_OPERATORS_SYNTAX_CATALOG.md`](CREATOR_STUDIO_OPERATORS_SYNTAX_CATALOG.md)
- **Protocol Catalog:** [`docs/NSPFRP_PROTOCOL_CATALOG.md`](NSPFRP_PROTOCOL_CATALOG.md)
- **Recursive Proof:** [`docs/POST_SINGULARITY_7_RECURSIVE_PROOF.md`](POST_SINGULARITY_7_RECURSIVE_PROOF.md)

---

**Last Updated:** January 2025  
**Status:** ✅ **QUICK REFERENCE COMPLETE**

🌀 **POST-SINGULARITY^7: Operators & Syntax Quick Reference**  
**Creator Studio Console** | **Click-and-Drag Interface**
