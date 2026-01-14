/**
 * NSPFRP-Optimized System Prompt
 * 
 * Natural System Protocol First Refactoring Pattern applied to system prompt design
 * 
 * Principles:
 * 1. Single Source of Truth - Centralized prompt patterns
 * 2. Recursive Self-Application - Prompt applies to itself
 * 3. Natural System First - Patterns emerge from natural constraints
 * 4. Protocol Enforcement - Automated validation of prompt compliance
 * 
 * Version: 1.0
 * Date: January 13, 2026
 */

import { extractToggleStates } from '@/utils/thalet/ToggleExtractor';

/**
 * Core prompt patterns (single source of truth)
 * These patterns are reused across all prompt sections
 */
const PROMPT_PATTERNS = {
  // Evaluation instruction pattern
  evaluationInstruction: (dimension: string, maxScore: number, criteria: string[]) => 
    `Evaluate ${dimension} on a scale of 0 to ${maxScore} based on:\n${criteria.map(c => `- ${c}`).join('\n')}`,
  
  // Score justification pattern
  scoreJustification: (dimension: string, score: number, reasoning: string) =>
    `${dimension}: ${score}/10000\nJustification: ${reasoning}`,
  
  // Metal classification pattern
  metalClassification: (metals: string[], justification: string) =>
    `Metals: ${metals.join(', ')}\nClassification Reasoning: ${justification}`,
  
  // Toggle-aware instruction pattern
  toggleAwareInstruction: (toggleName: string, enabled: boolean, instruction: string) =>
    enabled 
      ? `[${toggleName} ENABLED] ${instruction}`
      : `[${toggleName} DISABLED] ${instruction} (multiplier/penalty not applied)`,
};

/**
 * Extract prompt sections (centralized, no duplication)
 */
function buildPromptSections(config: {
  seedMultiplierEnabled: boolean;
  edgeMultiplierEnabled: boolean;
  overlapAdjustmentsEnabled: boolean;
  metalPolicyEnabled: boolean;
}) {
  return {
    // Header section (single source)
    header: `You are an expert evaluator for the Syntheverse PoC (Proof of Concept) system. 
Your role is to assess contributions using the THALET Protocol scoring system with instrument-grade precision.`,

    // Evaluation dimensions (centralized definitions)
    dimensions: {
      novelty: PROMPT_PATTERNS.evaluationInstruction(
        'Novelty',
        2500,
        [
          'Uniqueness of concepts and approaches',
          'Innovation in problem-solving methodology',
          'Originality of contribution to the field',
          'Novel combinations of existing ideas'
        ]
      ),
      density: PROMPT_PATTERNS.evaluationInstruction(
        'Density',
        2500,
        [
          'Information content per unit',
          'Conceptual richness and depth',
          'Compression of complex ideas',
          'Efficiency of expression'
        ]
      ),
      coherence: PROMPT_PATTERNS.evaluationInstruction(
        'Coherence',
        2500,
        [
          'Internal logical consistency',
          'Structural integrity of arguments',
          'Clarity of connections between ideas',
          'Absence of contradictions'
        ]
      ),
      alignment: PROMPT_PATTERNS.evaluationInstruction(
        'Alignment',
        2500,
        [
          'Alignment with Syntheverse principles',
          'Consistency with protocol standards',
          'Harmony with system architecture',
          'Compatibility with existing contributions'
        ]
      ),
    },

    // Toggle-aware instructions (uses centralized toggle extractor)
    toggleInstructions: [
      PROMPT_PATTERNS.toggleAwareInstruction(
        'Seed Multiplier',
        config.seedMultiplierEnabled,
        'Seed submissions (defining irreducible primitives S₀-S₈) receive a 1.15x multiplier. Identify if this is a seed submission.'
      ),
      PROMPT_PATTERNS.toggleAwareInstruction(
        'Edge Multiplier',
        config.edgeMultiplierEnabled,
        'Edge submissions (defining boundary operators E₀-E₆) receive a 1.12x multiplier. Identify if this is an edge submission.'
      ),
      PROMPT_PATTERNS.toggleAwareInstruction(
        'Overlap Adjustments',
        config.overlapAdjustmentsEnabled,
        'Redundancy overlap penalties and sweet spot bonuses are applied based on archive comparison.'
      ),
      PROMPT_PATTERNS.toggleAwareInstruction(
        'Metal Policy',
        config.metalPolicyEnabled,
        'Classify contributions into metal tiers (Gold, Silver, Copper) based on alignment and quality.'
      ),
    ],

    // Output format (single source of truth)
    outputFormat: `Provide your evaluation in the following JSON structure:
{
  "novelty": <number 0-2500>,
  "density": <number 0-2500>,
  "coherence": <number 0-2500>,
  "alignment": <number 0-2500>,
  "metals": ["gold" | "silver" | "copper"],
  "is_seed_submission": <boolean>,
  "is_edge_submission": <boolean>,
  "seed_justification": "<explanation if seed>",
  "edge_justification": "<explanation if edge>",
  "metal_justification": "<explanation of metal classification>",
  "redundancy_analysis": "<analysis of overlap with archive>",
  "classification": ["<category1>", "<category2>"]
}`,

    // Zero-Delta compliance instruction
    zeroDeltaInstruction: `CRITICAL: All scores must be deterministic and reproducible. 
The scoring system uses atomic_score.final as the single source of truth.
Ensure all intermediate calculations are traceable and verifiable.`,
  };
}

/**
 * Build complete system prompt (NSPFRP pattern: single function, no duplication)
 * 
 * @param toggleConfig - Toggle configuration from database
 * @returns Complete system prompt string
 */
export function buildSystemPrompt(toggleConfig?: any): string {
  // NSPFRP: Use centralized toggle extractor (single source of truth)
  const toggles = toggleConfig 
    ? extractToggleStates(toggleConfig)
    : {
        seedMultiplierEnabled: true,
        edgeMultiplierEnabled: true,
        overlapAdjustmentsEnabled: true,
        metalPolicyEnabled: true,
      };

  // Build sections using centralized patterns
  const sections = buildPromptSections(toggles);

  // Assemble prompt (single source of truth for assembly logic)
  const promptParts = [
    sections.header,
    '',
    '## Evaluation Dimensions',
    sections.dimensions.novelty,
    '',
    sections.dimensions.density,
    '',
    sections.dimensions.coherence,
    '',
    sections.dimensions.alignment,
    '',
    '## Toggle-Aware Instructions',
    ...sections.toggleInstructions,
    '',
    '## Output Format',
    sections.outputFormat,
    '',
    '## Zero-Delta Protocol',
    sections.zeroDeltaInstruction,
    '',
    '## NSPFRP Compliance',
    'This prompt follows Natural System Protocol First Refactoring Pattern:',
    '- Single source of truth for all patterns',
    '- Centralized prompt sections (no duplication)',
    '- Toggle-aware instructions (uses centralized extractor)',
    '- Recursive self-application (prompt applies to itself)',
    '- Protocol enforcement (validated structure)',
  ];

  return promptParts.join('\n');
}

/**
 * Validate prompt structure (protocol enforcement)
 * Ensures prompt follows NSPFRP principles
 */
export function validatePromptStructure(prompt: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for required sections
  const requiredSections = [
    'Evaluation Dimensions',
    'Toggle-Aware Instructions',
    'Output Format',
    'Zero-Delta Protocol',
    'NSPFRP Compliance',
  ];

  for (const section of requiredSections) {
    if (!prompt.includes(section)) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  // Check for pattern usage (should use centralized patterns)
  if (prompt.includes('Evaluate Novelty') && !prompt.includes('PROMPT_PATTERNS')) {
    // This is a warning, not an error - patterns are compiled into prompt
    // But we can check for consistency
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get prompt version info (for tracking and debugging)
 */
export function getPromptVersion(): {
  version: string;
  date: string;
  nspfrpCompliant: boolean;
  patterns: string[];
} {
  return {
    version: '1.0',
    date: '2026-01-13',
    nspfrpCompliant: true,
    patterns: Object.keys(PROMPT_PATTERNS),
  };
}


