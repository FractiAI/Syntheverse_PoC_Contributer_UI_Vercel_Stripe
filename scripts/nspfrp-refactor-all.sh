#!/bin/bash

# NSPFRP Repository-Wide Refactoring Script
# Systematically finds and reports all instances of fractalized patterns
# that need to be replaced with centralized utilities

echo "═══════════════════════════════════════════════════════"
echo "  NSPFRP Repository-Wide Pattern Analysis"
echo "═══════════════════════════════════════════════════════"
echo ""

# Find all direct pod_score accesses (excluding utilities and tests)
echo "1. Direct pod_score accesses (excluding ScoreExtractor):"
grep -r "\.pod_score\|pod_score\s*[?:]" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude="*test*" \
  --exclude="ScoreExtractor.ts" \
  --exclude="ToggleExtractor.ts" \
  . | grep -v "// NSPFRP" | grep -v "extractSovereignScore" | head -30

echo ""
echo "2. Score extraction patterns (atomic_score || score_trace || pod_score):"
grep -r "atomic_score.*final.*score_trace\|score_trace.*final_score.*pod_score" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude="*test*" \
  --exclude="ScoreExtractor.ts" \
  . | head -20

echo ""
echo "3. Toggle extraction patterns (seed_enabled|edge_enabled|overlap_enabled):"
grep -r "seed_enabled.*===.*true\|edge_enabled.*===.*true\|overlap_enabled.*===.*true" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude="*test*" \
  --exclude="ToggleExtractor.ts" \
  . | head -20

echo ""
echo "4. Toggle variable assignments (seedMultiplierEnabled|edgeMultiplierEnabled):"
grep -r "seedMultiplierEnabled\s*=\|edgeMultiplierEnabled\s*=\|overlapAdjustmentsEnabled\s*=" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude="*test*" \
  --exclude="ToggleExtractor.ts" \
  . | head -20

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Analysis Complete"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Review patterns above"
echo "2. Replace with extractSovereignScore() and extractToggleStates()"
echo "3. Test each component after refactoring"

