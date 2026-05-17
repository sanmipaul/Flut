/**
 * calculateStackingYield
 *
 * Pure function that estimates BTC rewards earned by stacking STX over a
 * vault lock period. Yields are modelled as a simple annualised rate applied
 * proportionally to each completed stacking cycle (~2,100 blocks / 14 days).
 *
 * The result is intentionally approximate. Real stacking rewards depend on
 * miner fees, total STX stacked network-wide, and BTC/STX price — none of
 * which are knowable ahead of time.
 */
import {
  BLOCKS_PER_CYCLE,
  SATOSHIS_PER_BTC,
} from '../types/StackingYield';
import { cycleRate, cycleCompoundReward, totalCompoundYield } from './compoundInterestUtils';
import type {
  StackingYieldInput,
  StackingYieldResult,
  StackingCycleReward,
} from '../types/StackingYield';


export function calculateStackingYield(input: StackingYieldInput): StackingYieldResult {
  const { stxAmount, totalLockBlocks, annualisedYieldPct } = input;

  const safeAmount = Math.max(0, stxAmount);
  const safeBlocks = Math.max(0, totalLockBlocks);
  const safeYield = Math.max(0, annualisedYieldPct);

  const fullCycleCount = Math.floor(safeBlocks / BLOCKS_PER_CYCLE);

  if (fullCycleCount === 0 || safeAmount === 0) {
    return {
      cycles: [],
      totalBtc: 0,
      fullCycleCount: 0,
      effectiveYieldPct: safeYield,
      hasYield: false,
    };
  }

  const r = cycleRate(safeYield);
  const cycles: StackingCycleReward[] = [];

  for (let i = 1; i <= fullCycleCount; i++) {
    const estimatedBtc = cycleCompoundReward(safeAmount, r, i);
    const cumulativeBtc = totalCompoundYield(safeAmount, r, i);
    cycles.push({ cycleNumber: i, estimatedBtc, cumulativeBtc });
  }

  return {
    cycles,
    totalBtc: totalCompoundYield(safeAmount, r, fullCycleCount),
    fullCycleCount,
    effectiveYieldPct: safeYield,
    hasYield: true,
  };
}
