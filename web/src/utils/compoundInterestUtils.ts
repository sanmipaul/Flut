/**
 * compoundInterestUtils
 *
 * Pure helpers for compound-interest calculations used by calculateStackingYield.
 *
 * The compound model computes each cycle's reward as:
 *   reward_i = principal × r × (1 + r)^(i − 1)
 *
 * where r is the per-cycle rate derived from the annualised yield percentage.
 * After n cycles the total yield is:
 *   total = principal × ((1 + r)^n − 1)
 *
 * All functions are pure and never throw.
 */

import { BLOCKS_PER_CYCLE } from '../types/StackingYield';

/** Approximate blocks per year at 10 min/block: 365.25 × 24 × 6 */
const BLOCKS_PER_YEAR = 52_596;

/**
 * Compute the per-cycle compounding rate from an annualised yield percentage.
 *
 * @example cycleRate(10) // ≈ 0.003993
 */
export function cycleRate(annualisedYieldPct: number): number {
  return (annualisedYieldPct / 100) * (BLOCKS_PER_CYCLE / BLOCKS_PER_YEAR);
}

/**
 * Returns the value of a principal after n compounding cycles.
 *   result = principal × (1 + r)^n
 *
 * @example compoundedPrincipal(1000, 0.01, 12) // ≈ 1126.83
 */
export function compoundedPrincipal(principal: number, r: number, n: number): number {
  return principal * Math.pow(1 + r, n);
}
