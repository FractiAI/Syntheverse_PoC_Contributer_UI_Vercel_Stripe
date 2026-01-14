# NSPFRP: Optimized Prompt for Natural Coding Performance

**Natural System Protocol First Refactoring Pattern**  
**Version:** 1.0  
**Purpose:** Optimize coding performance naturally through protocol enforcement

---

## Core Prompt

```
You are applying NSPFRP (Natural System Protocol First Refactoring Pattern) to optimize coding performance naturally.

BEFORE writing code that extracts data or reads configuration:

1. CHECK: Does a centralized utility exist for this pattern?
   - Look for utilities in @/utils/thalet/ or similar centralized locations
   - Check if pattern already has a single source of truth

2. USE: If utility exists, import and use it
   - import { extractSovereignScore } from '@/utils/thalet/ScoreExtractor';
   - import { extractToggleStates } from '@/utils/thalet/ToggleExtractor';
   - Never duplicate the logic

3. CREATE: If utility doesn't exist, CREATE IT FIRST
   - Extract pattern to centralized utility
   - Ensure single source of truth
   - Add validation and error handling
   - Then use it in your code

4. ENFORCE: Ensure protocol compliance
   - Pre-commit hooks will block violations
   - ESLint will catch violations in IDE
   - CI/CD will validate compliance

PROTOCOL RULES:
- ❌ NEVER copy-paste extraction/reading logic
- ❌ NEVER use direct field access when utility exists
- ❌ NEVER create variations of existing patterns
- ✅ ALWAYS use centralized utilities
- ✅ ALWAYS create utility first if pattern doesn't exist
- ✅ ALWAYS follow single source of truth principle

RESULT: Natural coding performance through systematic pattern enforcement.
```

---

## Quick Reference

### Score Extraction
```typescript
// ❌ FORBIDDEN
const score = data.pod_score ?? data.metadata?.pod_score ?? 0;

// ✅ REQUIRED
import { extractSovereignScore, formatSovereignScore } from '@/utils/thalet/ScoreExtractor';
const score = extractSovereignScore(data);
const display = formatSovereignScore(score, '—');
```

### Toggle Reading
```typescript
// ❌ FORBIDDEN
seedMultiplierEnabled = configValue.seed_enabled === true;

// ✅ REQUIRED
import { extractToggleStates } from '@/utils/thalet/ToggleExtractor';
const toggles = extractToggleStates(configValue);
seedMultiplierEnabled = toggles.seedMultiplierEnabled;
```

### Display Formatting
```typescript
// ❌ FORBIDDEN
{data.pod_score?.toLocaleString() || 'N/A'}

// ✅ REQUIRED
{formatSovereignScore(extractSovereignScore(data), '—')}
```

---

## Natural Performance Benefits

1. **Single Source of Truth:** Fix bugs in one place, not 15+
2. **Automatic Prevention:** Violations blocked before commit
3. **Consistent Behavior:** Same pattern everywhere, no variations
4. **Self-Maintaining:** Protocol enforces itself recursively
5. **Zero-Delta Compliance:** Data integrity through systematic enforcement

---

## Protocol Self-Application

The protocol applies to itself:
- Protocol utilities follow protocol principles
- Protocol enforcement follows protocol patterns
- Protocol documentation follows protocol structure
- Protocol validates its own compliance

**Result:** Self-sanitizing system that naturally optimizes coding performance.

---

## Usage Instructions

1. **Before coding:** Read this prompt
2. **While coding:** Check for utilities first
3. **If pattern exists:** Use utility, don't duplicate
4. **If pattern doesn't exist:** Create utility first
5. **After coding:** Protocol will validate compliance

---

**Status:** ✅ **OPTIMIZED FOR NATURAL CODING PERFORMANCE**

