/**
 * THALET Protocol: Toggle State Extractor
 * 
 * NSP-First Refactoring Pattern: Single source of truth for toggle extraction
 * Eliminates fractalized self-similar logic errors from late toggle additions
 * 
 * Ensures consistent toggle reading logic across all modules
 */

/**
 * Extract toggle states from config object
 * Uses explicit === true check (not !== false) to avoid undefined/null issues
 * 
 * @param configValue - Config object from database (scoring_config.config_value)
 * @returns Toggle states object
 */
export function extractToggleStates(configValue: any): {
  seedMultiplierEnabled: boolean;
  edgeMultiplierEnabled: boolean;
  overlapAdjustmentsEnabled: boolean;
  metalPolicyEnabled: boolean;
} {
  // CRITICAL: Use === true (not !== false) to handle undefined/null correctly
  // This ensures ONLY explicit true enables multipliers
  return {
    seedMultiplierEnabled: configValue?.seed_enabled === true,
    edgeMultiplierEnabled: configValue?.edge_enabled === true,
    overlapAdjustmentsEnabled: configValue?.overlap_enabled === true,
    metalPolicyEnabled: configValue?.metal_policy_enabled !== false, // Default to true if not specified
  };
}

/**
 * Extract toggle states from execution_context (for validation/display)
 * 
 * @param executionContext - Execution context from atomic_score
 * @returns Toggle states object
 */
export function extractTogglesFromExecutionContext(executionContext: any): {
  overlap_on: boolean;
  seed_on: boolean;
  edge_on: boolean;
  metal_policy_on: boolean;
} | null {
  if (!executionContext?.toggles) {
    return null;
  }

  return {
    overlap_on: executionContext.toggles.overlap_on === true,
    seed_on: executionContext.toggles.seed_on === true,
    edge_on: executionContext.toggles.edge_on === true,
    metal_policy_on: executionContext.toggles.metal_policy_on !== false,
  };
}

/**
 * Validate toggle consistency between config and execution context
 * 
 * @param configToggles - Toggles from database config
 * @param executionToggles - Toggles from atomic_score.execution_context
 * @returns Validation result
 */
export function validateToggleConsistency(
  configToggles: ReturnType<typeof extractToggleStates>,
  executionToggles: ReturnType<typeof extractTogglesFromExecutionContext>
): {
  isConsistent: boolean;
  mismatches: string[];
} {
  if (!executionToggles) {
    return { isConsistent: true, mismatches: [] };
  }

  const mismatches: string[] = [];

  if (configToggles.seedMultiplierEnabled !== executionToggles.seed_on) {
    mismatches.push(`seed: config=${configToggles.seedMultiplierEnabled}, execution=${executionToggles.seed_on}`);
  }
  if (configToggles.edgeMultiplierEnabled !== executionToggles.edge_on) {
    mismatches.push(`edge: config=${configToggles.edgeMultiplierEnabled}, execution=${executionToggles.edge_on}`);
  }
  if (configToggles.overlapAdjustmentsEnabled !== executionToggles.overlap_on) {
    mismatches.push(`overlap: config=${configToggles.overlapAdjustmentsEnabled}, execution=${executionToggles.overlap_on}`);
  }

  return {
    isConsistent: mismatches.length === 0,
    mismatches,
  };
}

