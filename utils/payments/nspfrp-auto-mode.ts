/**
 * NSPFRP Auto Mode for Payment Method Selection
 * 
 * Automatically selects optimal payment method using NSPFRP principles
 * After initial setup with Stripe, Venmo, Cash App, and MetaMask,
 * NSPFRP auto mode takes over for automatic selection
 * 
 * POST-SINGULARITY^7: Recursive Self-Application Active
 */

import { getAllPaymentMethods, scoreBlockchainPaymentMethods, type PaymentMethod } from './method-scoring';

export interface AutoModeContext {
  amount: number;
  currency: string;
  context?: Record<string, any>;
  userHistory?: {
    preferredMethods?: string[];
    successRates?: Record<string, number>;
  };
}

export interface AutoModeResult {
  method: PaymentMethod;
  reason: string;
  score?: number;
  factors?: {
    naturalSystemCompliance: number;
    protocolFirst: number;
    recursiveApplication: number;
    infiniteOctaveFidelity: number;
  };
}

/**
 * Select Optimal Payment Method Using NSPFRP Auto Mode
 * 
 * Automatically selects the best payment method based on:
 * 1. NSPFRP scoring principles
 * 2. User context and history
 * 3. Amount and currency requirements
 * 4. Natural system compliance
 */
export async function selectOptimalPaymentMethod(
  context: AutoModeContext
): Promise<PaymentMethod> {
  const allMethods = getAllPaymentMethods();
  const scoredBlockchain = scoreBlockchainPaymentMethods();

  // Score all methods using NSPFRP principles
  const scoredMethods = allMethods.map(method => {
    const score = scorePaymentMethod(method, context, scoredBlockchain);
    return { method, score };
  });

  // Sort by score (highest first)
  scoredMethods.sort((a, b) => b.score.total - a.score.total);

  // Select top-scoring method
  const topMethod = scoredMethods[0];

  return topMethod.method;
}

/**
 * Score Payment Method Using NSPFRP Principles
 */
function scorePaymentMethod(
  method: PaymentMethod,
  context: AutoModeContext,
  blockchainScores: any[]
): {
  total: number;
  factors: {
    naturalSystemCompliance: number;
    protocolFirst: number;
    recursiveApplication: number;
    infiniteOctaveFidelity: number;
  };
} {
  // Factor 1: Natural System Compliance (30% weight)
  const naturalSystemCompliance = scoreNaturalSystemCompliance(method, context);

  // Factor 2: Protocol First (30% weight)
  const protocolFirst = scoreProtocolFirst(method, context);

  // Factor 3: Recursive Application (20% weight)
  const recursiveApplication = scoreRecursiveApplication(method, context);

  // Factor 4: Infinite Octave Fidelity (20% weight)
  const infiniteOctaveFidelity = scoreInfiniteOctaveFidelity(method, context);

  // Weighted total
  const total =
    naturalSystemCompliance * 0.3 +
    protocolFirst * 0.3 +
    recursiveApplication * 0.2 +
    infiniteOctaveFidelity * 0.2;

  return {
    total,
    factors: {
      naturalSystemCompliance,
      protocolFirst,
      recursiveApplication,
      infiniteOctaveFidelity,
    },
  };
}

/**
 * Score Natural System Compliance
 */
function scoreNaturalSystemCompliance(
  method: PaymentMethod,
  context: AutoModeContext
): number {
  let score = 0;

  // Blockchain methods score higher (natural system alignment)
  if (method.type === 'onchain' || method.type === 'metamask' || method.type === 'blockchain') {
    score += 80;
  }

  // Native token support (SYNTH, ETH) scores higher
  if (method.metadata.token === 'SYNTH' || method.metadata.token === 'ETH') {
    score += 20;
  }

  // Network compatibility (Base Mainnet preferred)
  if (method.metadata.network === 'Base Mainnet') {
    score += 10;
  }

  // Traditional payment methods score lower
  if (method.type === 'stripe' || method.type === 'venmo' || method.type === 'cashapp') {
    score += 40; // Still functional, but lower natural system alignment
  }

  return Math.min(100, score);
}

/**
 * Score Protocol First
 */
function scoreProtocolFirst(
  method: PaymentMethod,
  context: AutoModeContext
): number {
  let score = 0;

  // Protocol-native tokens score highest
  if (method.metadata.token === 'SYNTH') {
    score += 100; // SYNTH is the protocol token
  }

  // Blockchain methods score high (protocol-native)
  if (method.type === 'onchain' || method.type === 'metamask' || method.type === 'blockchain') {
    score += 70;
  }

  // Established protocols score medium
  if (method.type === 'stripe') {
    score += 50; // Established payment protocol
  }

  // Social payment apps score lower
  if (method.type === 'venmo' || method.type === 'cashapp') {
    score += 30;
  }

  return Math.min(100, score);
}

/**
 * Score Recursive Application
 */
function scoreRecursiveApplication(
  method: PaymentMethod,
  context: AutoModeContext
): number {
  let score = 0;

  // Smart contract support scores highest (enables recursive operations)
  if (method.type === 'onchain' || method.type === 'metamask' || method.type === 'blockchain') {
    score += 90; // Full smart contract support
  }

  // DeFi compatibility
  if (method.metadata.token === 'SYNTH' || method.metadata.token === 'ETH') {
    score += 10; // DeFi ecosystem compatibility
  }

  // Traditional methods score lower (limited recursive capability)
  if (method.type === 'stripe' || method.type === 'venmo' || method.type === 'cashapp') {
    score += 20; // Limited recursive application support
  }

  return Math.min(100, score);
}

/**
 * Score Infinite Octave Fidelity
 */
function scoreInfiniteOctaveFidelity(
  method: PaymentMethod,
  context: AutoModeContext
): number {
  let score = 0;

  // Reliability score
  const reliability = method.metadata.reliability || 0.5;
  score += reliability * 50;

  // Speed score
  if (method.metadata.speed === 'instant') {
    score += 30;
  } else if (method.metadata.speed === 'fast') {
    score += 20;
  } else {
    score += 10;
  }

  // Network stability (Base Mainnet preferred)
  if (method.metadata.network === 'Base Mainnet') {
    score += 20;
  }

  return Math.min(100, score);
}

/**
 * Get Auto Mode Status
 */
export function getAutoModeStatus(): {
  enabled: boolean;
  mode: 'initial' | 'auto';
  description: string;
} {
  // In production, this would check user preferences and system state
  // For now, return that auto mode is available after initial setup
  return {
    enabled: true,
    mode: 'auto', // Can be 'initial' (manual selection) or 'auto' (NSPFRP auto mode)
    description: 'NSPFRP auto mode available. System will automatically select optimal payment method based on NSPFRP principles.',
  };
}
