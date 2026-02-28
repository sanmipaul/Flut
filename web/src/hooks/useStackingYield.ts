/**
 * useStackingYield
 *
 * Manages the user-adjustable APY rate and memoises the yield calculation.
 * The APY slider in StackingYieldCard calls setApyPct; the parent only needs
 * to provide the stable vault fields (amount and lock duration).
 */
import { useState, useMemo } from 'react';
import { calculateStackingYield } from '../utils/calculateStackingYield';
import { DEFAULT_APY_PCT, MIN_APY_PCT, MAX_APY_PCT } from '../types/StackingYield';
import type { StackingYieldResult } from '../types/StackingYield';

export interface UseStackingYieldInput {
  /** Vault amount in whole STX. */
  stxAmount: number;
  /** Total lock duration in blocks (unlockHeight − createdAt). */
  totalLockBlocks: number;
}

export interface UseStackingYieldReturn {
  /** Computed cycle-by-cycle yield result. */
  yieldResult: StackingYieldResult;
  /** Current APY rate shown in the slider (1–25). */
  apyPct: number;
  /** Update the APY rate. Values are clamped to [MIN_APY_PCT, MAX_APY_PCT]. */
  setApyPct: (pct: number) => void;
  /** Reset APY to the default (10%). */
  resetApy: () => void;
  /** Bounds exposed so the slider component does not need to import constants. */
  minApy: number;
  maxApy: number;
}

export function useStackingYield(input: UseStackingYieldInput): UseStackingYieldReturn {
  const [apyPct, setApyPctState] = useState<number>(DEFAULT_APY_PCT);

  const setApyPct = (pct: number) => {
    setApyPctState(Math.min(MAX_APY_PCT, Math.max(MIN_APY_PCT, Math.round(pct))));
  };

  const resetApy = () => setApyPctState(DEFAULT_APY_PCT);

  const yieldResult = useMemo(
    () =>
      calculateStackingYield({
        stxAmount: input.stxAmount,
        totalLockBlocks: input.totalLockBlocks,
        annualisedYieldPct: apyPct,
      }),
    [input.stxAmount, input.totalLockBlocks, apyPct],
  );

  return { yieldResult, apyPct, setApyPct, resetApy, minApy: MIN_APY_PCT, maxApy: MAX_APY_PCT };
}
