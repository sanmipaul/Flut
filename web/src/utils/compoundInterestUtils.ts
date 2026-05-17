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

/**
 * Returns the total yield (not including principal) after n compound cycles.
 *   total = principal × ((1 + r)^n − 1)
 *
 * @example totalCompoundYield(1000, 0.01, 12) // ≈ 126.83
 */
export function totalCompoundYield(principal: number, r: number, n: number): number {
  return principal * (Math.pow(1 + r, n) - 1);
}

/**
 * Returns the yield earned in cycle i (1-indexed) under compound interest.
 *   reward_i = principal × r × (1 + r)^(i − 1)
 *
 * Cycle 1 equals the simple-interest reward. Each subsequent cycle is larger
 * by a factor of (1 + r) because the accumulated yield is reinvested.
 *
 * @example cycleCompoundReward(1000, 0.01, 1) // 10   (= 1000 × 0.01)
 * @example cycleCompoundReward(1000, 0.01, 2) // 10.1 (= 1000 × 0.01 × 1.01)
 */
export function cycleCompoundReward(principal: number, r: number, cycleIndex: number): number {
  return principal * r * Math.pow(1 + r, cycleIndex - 1);
}
