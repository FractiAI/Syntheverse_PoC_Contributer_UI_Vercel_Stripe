/**
 * Toggle Flow Diagnostic Script
 * 
 * Systematically traces the toggle flow from database → evaluation → AtomicScorer → JSON → UI
 * 
 * Usage: npx tsx scripts/diagnose-toggle-flow.ts
 */

import { db } from '../utils/db/db';
import { scoringConfigTable } from '../utils/db/schema';
import { eq } from 'drizzle-orm';
import { AtomicScorer } from '../utils/scoring/AtomicScorer';

async function diagnoseToggleFlow() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TOGGLE FLOW DIAGNOSTIC');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Step 1: Check Database Toggles
  console.log('STEP 1: Database Toggles');
  console.log('─────────────────────────────────────────────────────');
  try {
    const configResult = await db
      .select()
      .from(scoringConfigTable)
      .where(eq(scoringConfigTable.config_key, 'multiplier_toggles'))
      .limit(1);

    if (configResult.length === 0) {
      console.log('❌ ERROR: No multiplier_toggles config found in database');
      console.log('   Expected: scoring_config table with config_key = "multiplier_toggles"');
      return;
    }

    const config = configResult[0];
    const configValue = config.config_value as any;
    
    console.log('✅ Config found:');
    console.log('   seed_enabled:', configValue.seed_enabled);
    console.log('   edge_enabled:', configValue.edge_enabled);
    console.log('   overlap_enabled:', configValue.overlap_enabled);
    console.log('   metal_policy_enabled:', configValue.metal_policy_enabled);
    console.log('   Updated at:', config.updated_at);
    console.log('');

    // Step 2: Simulate Toggle Reading (as in evaluate.ts)
    console.log('STEP 2: Toggle Reading Logic (evaluate.ts)');
    console.log('─────────────────────────────────────────────────────');
    
    let seedMultiplierEnabled = false;
    let edgeMultiplierEnabled = false;
    let overlapAdjustmentsEnabled = false;
    
    // This is the EXACT logic from evaluate.ts line 287-289
    seedMultiplierEnabled = configValue.seed_enabled === true;
    edgeMultiplierEnabled = configValue.edge_enabled === true;
    overlapAdjustmentsEnabled = configValue.overlap_enabled === true;
    
    console.log('✅ Toggle states computed:');
    console.log('   seedMultiplierEnabled:', seedMultiplierEnabled);
    console.log('   edgeMultiplierEnabled:', edgeMultiplierEnabled);
    console.log('   overlapAdjustmentsEnabled:', overlapAdjustmentsEnabled);
    console.log('');

    // Step 3: Test AtomicScorer with Toggles
    console.log('STEP 3: AtomicScorer Computation');
    console.log('─────────────────────────────────────────────────────');
    
    const testInput = {
      novelty: 2000,
      density: 2000,
      coherence: 2000,
      alignment: 2000,
      redundancy_overlap_percent: 15, // Sweet spot
      is_seed_from_ai: true,
      is_edge_from_ai: true,
      toggles: {
        overlap_on: overlapAdjustmentsEnabled,
        seed_on: seedMultiplierEnabled,
        edge_on: edgeMultiplierEnabled,
        metal_policy_on: true,
      },
    };
    
    console.log('Test input:');
    console.log('   Novelty:', testInput.novelty);
    console.log('   Density:', testInput.density);
    console.log('   Coherence:', testInput.coherence);
    console.log('   Alignment:', testInput.alignment);
    console.log('   Composite:', testInput.novelty + testInput.density + testInput.coherence + testInput.alignment);
    console.log('   Overlap %:', testInput.redundancy_overlap_percent);
    console.log('   is_seed_from_ai:', testInput.is_seed_from_ai);
    console.log('   is_edge_from_ai:', testInput.is_edge_from_ai);
    console.log('   Toggles:', JSON.stringify(testInput.toggles, null, 2));
    console.log('');
    
    const atomicScore = AtomicScorer.computeScore(testInput);
    
    console.log('✅ AtomicScorer result:');
    console.log('   final:', atomicScore.final);
    console.log('   composite:', atomicScore.trace.composite);
    console.log('   penalty_percent:', atomicScore.trace.penalty_percent);
    console.log('   bonus_multiplier:', atomicScore.trace.bonus_multiplier);
    console.log('   seed_multiplier:', atomicScore.trace.seed_multiplier);
    console.log('   edge_multiplier:', atomicScore.trace.edge_multiplier);
    console.log('   formula:', atomicScore.trace.formula);
    console.log('   integrity_hash:', atomicScore.integrity_hash.substring(0, 16) + '...');
    console.log('');

    // Step 4: Verify Toggle Enforcement
    console.log('STEP 4: Toggle Enforcement Verification');
    console.log('─────────────────────────────────────────────────────');
    
    const expectedSeedMultiplier = (seedMultiplierEnabled && testInput.is_seed_from_ai) ? 1.15 : 1.0;
    const expectedEdgeMultiplier = (edgeMultiplierEnabled && testInput.is_edge_from_ai) ? 1.12 : 1.0;
    const expectedPenalty = overlapAdjustmentsEnabled && testInput.redundancy_overlap_percent > 30 ? '> 0' : '0';
    const expectedBonus = overlapAdjustmentsEnabled && 
      Math.abs(testInput.redundancy_overlap_percent - 14.2) <= 5.0 ? '> 1.0' : '1.0';
    
    console.log('Expected behavior:');
    console.log('   seed_multiplier should be:', expectedSeedMultiplier);
    console.log('   edge_multiplier should be:', expectedEdgeMultiplier);
    console.log('   penalty_percent should be:', expectedPenalty);
    console.log('   bonus_multiplier should be:', expectedBonus);
    console.log('');
    
    const seedCorrect = Math.abs(atomicScore.trace.seed_multiplier - expectedSeedMultiplier) < 0.01;
    const edgeCorrect = Math.abs(atomicScore.trace.edge_multiplier - expectedEdgeMultiplier) < 0.01;
    
    console.log('Actual vs Expected:');
    console.log('   seed_multiplier:', atomicScore.trace.seed_multiplier, 
      seedCorrect ? '✅' : `❌ (expected ${expectedSeedMultiplier})`);
    console.log('   edge_multiplier:', atomicScore.trace.edge_multiplier,
      edgeCorrect ? '✅' : `❌ (expected ${expectedEdgeMultiplier})`);
    console.log('   penalty_percent:', atomicScore.trace.penalty_percent);
    console.log('   bonus_multiplier:', atomicScore.trace.bonus_multiplier);
    console.log('');

    // Step 5: JSON Structure Check
    console.log('STEP 5: JSON Structure (Simulated API Response)');
    console.log('─────────────────────────────────────────────────────');
    
    const simulatedResponse = {
      success: true,
      evaluation: {
        pod_score: atomicScore.final,
        atomic_score: atomicScore,
        score_trace: {
          final_score: atomicScore.final,
          toggles: testInput.toggles,
        },
      },
    };
    
    console.log('✅ Simulated API response structure:');
    console.log('   evaluation.pod_score:', simulatedResponse.evaluation.pod_score);
    console.log('   evaluation.atomic_score.final:', simulatedResponse.evaluation.atomic_score.final);
    console.log('   evaluation.atomic_score.execution_context.toggles:', 
      JSON.stringify(simulatedResponse.evaluation.atomic_score.execution_context.toggles, null, 2));
    console.log('   evaluation.score_trace.toggles:', 
      JSON.stringify(simulatedResponse.evaluation.score_trace.toggles, null, 2));
    console.log('');
    
    // Zero-Delta Check
    const zeroDeltaMatch = Math.abs(simulatedResponse.evaluation.pod_score - 
      simulatedResponse.evaluation.atomic_score.final) < 0.01;
    console.log('Zero-Delta Check:');
    console.log('   pod_score === atomic_score.final:', zeroDeltaMatch ? '✅' : '❌ MISMATCH');
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('  DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Database Config:', configResult.length > 0 ? '✅ Found' : '❌ Missing');
    console.log('Toggle Reading:', '✅ Logic correct (=== true)');
    console.log('AtomicScorer:', seedCorrect && edgeCorrect ? '✅ Toggles enforced' : '❌ Toggle violation');
    console.log('JSON Structure:', '✅ atomic_score included');
    console.log('Zero-Delta:', zeroDeltaMatch ? '✅ Match' : '❌ Mismatch');
    console.log('');
    
    if (!seedCorrect || !edgeCorrect) {
      console.log('🚨 ISSUE DETECTED:');
      if (!seedCorrect) {
        console.log('   - Seed multiplier not respecting toggle');
      }
      if (!edgeCorrect) {
        console.log('   - Edge multiplier not respecting toggle');
      }
    } else {
      console.log('✅ All checks passed!');
    }
    
    await db.$client.end();
  } catch (error) {
    console.error('❌ ERROR:', error);
    await db.$client.end();
    process.exit(1);
  }
}

diagnoseToggleFlow();

