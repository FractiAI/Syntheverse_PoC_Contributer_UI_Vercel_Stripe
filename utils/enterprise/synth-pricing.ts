/**
 * SYNTH Token-Based Pricing Utilities
 * 
 * Calculates rent and energy charges for enterprise sandboxes
 * based on reach (unique contributors) and activity (operations)
 */

export type ReachTier = 'Seed' | 'Growth' | 'Community' | 'Ecosystem' | 'Metropolis';

export interface SandboxMetrics {
  unique_contributors: number;
  total_submissions: number;
  total_evaluations: number;
  total_registrations: number;
  total_allocations: number;
  total_analytics_queries: number;
}

export interface PricingCalculation {
  reach_tier: ReachTier;
  monthly_rent: number;
  energy_charges: {
    per_evaluation: number;
    per_registration: number;
    per_allocation: number;
    per_analytics_query: number;
  };
  projected_monthly_cost: number; // Based on current activity
}

/**
 * Calculate reach tier based on unique contributor count
 */
export function calculateReachTier(uniqueContributors: number): ReachTier {
  if (uniqueContributors <= 5) return 'Seed';
  if (uniqueContributors <= 25) return 'Growth';
  if (uniqueContributors <= 100) return 'Community';
  if (uniqueContributors <= 500) return 'Ecosystem';
  return 'Metropolis';
}

/**
 * Get monthly rent based on reach tier
 */
export function getMonthlyRent(tier: ReachTier): number {
  const rentMap: Record<ReachTier, number> = {
    Seed: 1000,
    Growth: 5000,
    Community: 15000,
    Ecosystem: 50000,
    Metropolis: 100000,
  };
  return rentMap[tier] || 1000;
}

/**
 * Get energy cost for a specific operation
 */
export function getEnergyCost(operation: 'evaluation' | 'registration' | 'allocation' | 'analytics_query'): number {
  const costs = {
    evaluation: 100,
    registration: 500,
    allocation: 50,
    analytics_query: 10,
  };
  return costs[operation] || 0;
}

/**
 * Calculate total pricing for a sandbox
 */
export function calculatePricing(metrics: SandboxMetrics): PricingCalculation {
  const reachTier = calculateReachTier(metrics.unique_contributors);
  const monthlyRent = getMonthlyRent(reachTier);

  const energyCharges = {
    per_evaluation: getEnergyCost('evaluation'),
    per_registration: getEnergyCost('registration'),
    per_allocation: getEnergyCost('allocation'),
    per_analytics_query: getEnergyCost('analytics_query'),
  };

  // Project monthly energy costs based on current activity
  // Assumes activity rate is consistent (can be improved with historical data)
  const projectedEnergyCosts =
    metrics.total_evaluations * energyCharges.per_evaluation +
    metrics.total_registrations * energyCharges.per_registration +
    metrics.total_allocations * energyCharges.per_allocation +
    metrics.total_analytics_queries * energyCharges.per_analytics_query;

  // For projection, we estimate based on current month's activity
  // In production, this would use historical averages
  const projectedMonthlyCost = monthlyRent + projectedEnergyCosts;

  return {
    reach_tier: reachTier,
    monthly_rent: monthlyRent,
    energy_charges: energyCharges,
    projected_monthly_cost: projectedMonthlyCost,
  };
}

/**
 * Calculate total energy charges for a period
 */
export function calculateEnergyCharges(
  evaluations: number,
  registrations: number,
  allocations: number,
  analyticsQueries: number
): number {
  return (
    evaluations * getEnergyCost('evaluation') +
    registrations * getEnergyCost('registration') +
    allocations * getEnergyCost('allocation') +
    analyticsQueries * getEnergyCost('analytics_query')
  );
}

/**
 * Check if sandbox has sufficient balance for an operation
 */
export function hasSufficientBalance(
  currentBalance: number,
  operation: 'evaluation' | 'registration' | 'allocation' | 'analytics_query' | 'rent'
): boolean {
  if (operation === 'rent') {
    // Rent is charged monthly, check if balance can cover at least one month
    return currentBalance >= 1000; // Minimum rent (Seed tier)
  }

  const cost = getEnergyCost(operation);
  return currentBalance >= cost;
}

/**
 * Format SYNTH amount for display (with 18 decimals)
 */
export function formatSynthAmount(amount: number | string, decimals: number = 18): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = (num / divisor).toFixed(2);
  return `${formatted} SYNTH`;
}

/**
 * Parse SYNTH amount from display format to wei
 */
export function parseSynthAmount(amount: string, decimals: number = 18): number {
  const num = parseFloat(amount);
  if (isNaN(num)) return 0;
  return Math.floor(num * Math.pow(10, decimals));
}

/**
 * Get activation fee (default: 10,000 SYNTH)
 */
export function getActivationFee(): number {
  return 10000;
}

/**
 * Check if sandbox should be paused due to low balance
 */
export function shouldPauseSandbox(balance: number, monthlyRent: number): boolean {
  // Pause if balance is less than 1 month of rent + buffer
  return balance < monthlyRent * 1.1; // 10% buffer
}

/**
 * Get low balance warning threshold
 */
export function getLowBalanceWarning(balance: number): 'none' | 'warning' | 'critical' {
  if (balance < 100) return 'critical';
  if (balance < 1000) return 'warning';
  return 'none';
}

