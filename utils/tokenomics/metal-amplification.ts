/**
 * Metallic Amplification Calculator
 * 
 * Calculates amplification multipliers based on metal combinations (Blueprint §3.4).
 * Amplifications are applied based on COMBINATIONS of metals, not individual metals.
 * 
 * Rules:
 * - Gold + Silver + Copper: 1.5× (Full Integration - highest priority)
 * - Gold + Silver: 1.25×
 * - Gold + Copper: 1.2×
 * - Silver + Copper: 1.15×
 * - Single metal or no combination: 1.0× (no amplification)
 */

export interface MetalAmplificationResult {
    multiplier: number
    combination: string
    description: string
}

/**
 * Calculate metallic amplification multiplier based on metal combinations.
 * 
 * @param metals Array of metal types (e.g., ['gold', 'silver', 'copper'])
 * @returns Amplification result with multiplier, combination name, and description
 */
export function calculateMetalAmplification(metals: string[]): MetalAmplificationResult {
    if (!metals || metals.length === 0) {
        return {
            multiplier: 1.0,
            combination: 'none',
            description: 'No metals assigned'
        }
    }

    // Normalize metals to lowercase for comparison
    const normalizedMetals = metals.map(m => m.toLowerCase())
    const hasGold = normalizedMetals.includes('gold')
    const hasSilver = normalizedMetals.includes('silver')
    const hasCopper = normalizedMetals.includes('copper')

    // Check combinations in order of priority (highest first)
    if (hasGold && hasSilver && hasCopper) {
        return {
            multiplier: 1.5,
            combination: 'full_integration',
            description: 'Full Integration (Gold + Silver + Copper): 1.5× amplification for maximum cross-disciplinary integration'
        }
    }

    if (hasGold && hasSilver) {
        return {
            multiplier: 1.25,
            combination: 'gold_silver',
            description: 'Gold + Silver: 1.25× amplification for integrated Research + Technology contributions'
        }
    }

    if (hasGold && hasCopper) {
        return {
            multiplier: 1.2,
            combination: 'gold_copper',
            description: 'Gold + Copper: 1.2× amplification for ecosystem-aligned Research + Alignment work'
        }
    }

    if (hasSilver && hasCopper) {
        return {
            multiplier: 1.15,
            combination: 'silver_copper',
            description: 'Silver + Copper: 1.15× amplification for balanced Development + Alignment contributions'
        }
    }

    // Single metal or unrecognized combination - no amplification
    return {
        multiplier: 1.0,
        combination: 'single_metal',
        description: 'Single metal or unrecognized combination - no amplification applied'
    }
}


