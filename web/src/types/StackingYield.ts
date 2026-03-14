/**
 * StackingYield types
 *
 * Shapes used by calculateStackingYield and the StackingYieldCard component
 * to model the estimated BTC rewards earned by stacking locked STX.
 *
 * Stacking on Stacks runs in two-week cycles called "reward cycles". Each
 * cycle, stackers earn a proportional share of the BTC miner fees paid to
 * commit to the chain. The annualised yield varies but has historically sat
 * in the 8–12% range (expressed as BTC value relative to STX locked).
 */

/** Input provided by the caller (derives from vault + user APY preference). */
export interface StackingYieldInput {
  /** Vault amount in whole STX (not microSTX). */
  stxAmount: number;
  /** Total lock duration in blocks. */
  totalLockBlocks: number;
  /**
   * Annualised yield rate as a percentage (e.g. 10 means 10% per year).
   * The user can adjust this via the APY slider in the UI.
   */
  annualisedYieldPct: number;
}

/** Estimated BTC reward for a single Stacks reward cycle (~2,100 blocks). */
export interface StackingCycleReward {
  /** 1-based cycle number within the lock period. */
  cycleNumber: number;
  /** Estimated BTC earned this cycle (satoshis as a fractional number). */
  estimatedBtc: number;
  /** Running cumulative BTC total after this cycle. */
  cumulativeBtc: number;
}

/** Full result returned by calculateStackingYield. */
export interface StackingYieldResult {
  /** Cycle-by-cycle reward breakdown. */
  cycles: StackingCycleReward[];
  /** Total estimated BTC across all completed cycles. */
  totalBtc: number;
  /** Number of full stacking cycles the lock period covers. */
  fullCycleCount: number;
  /** Effective yield rate used (may differ if the lock is shorter than 1 year). */
  effectiveYieldPct: number;
  /** True when the lock period covers at least one full cycle. */
  hasYield: boolean;
}

/**
 * Stacks reward cycle length in blocks.
 * One cycle ≈ 2,100 blocks ≈ 14 days (at ~10 min/block).
 */
export const BLOCKS_PER_CYCLE = 2_100;

/** Approximate BTC-to-satoshi conversion constant. */
export const SATOSHIS_PER_BTC = 100_000_000;

/** Default APY rate shown in the UI when the user has not adjusted the slider. */
export const DEFAULT_APY_PCT = 10;

/** Minimum APY the slider allows. */
export const MIN_APY_PCT = 1;

/** Maximum APY the slider allows. */
export const MAX_APY_PCT = 25;
