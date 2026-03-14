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
import type {
  StackingYieldInput,
  StackingYieldResult,
  StackingCycleReward,
} from '../types/StackingYield';

/** Approximate blocks per year at 10 min/block: 365.25 × 24 × 6 */
const BLOCKS_PER_YEAR = 52_596;

/**
 * Compute the BTC yield for a single cycle given an STX amount and annual rate.
 * Uses a simple linear model: cycleYield = stxAmount × (yieldPct/100) × (blocksPerCycle / blocksPerYear).
 * The STX→BTC conversion is omitted by design — the output is expressed as
 * "BTC-equivalent value" relative to the STX principal, so callers can apply
 * their own price assumptions.
 */
function yieldPerCycle(stxAmount: number, annualisedYieldPct: number): number {
  const annualRate = annualisedYieldPct / 100;
  const cycleWeight = BLOCKS_PER_CYCLE / BLOCKS_PER_YEAR;
  return stxAmount * annualRate * cycleWeight;
}

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

  const cycleReward = yieldPerCycle(safeAmount, safeYield);
  const cycles: StackingCycleReward[] = [];
  let cumulative = 0;

  for (let i = 1; i <= fullCycleCount; i++) {
    cumulative += cycleReward;
    cycles.push({
      cycleNumber: i,
      estimatedBtc: cycleReward,
      cumulativeBtc: cumulative,
    });
  }

  return {
    cycles,
    totalBtc: cumulative,
    fullCycleCount,
    effectiveYieldPct: safeYield,
    hasYield: true,
  };
}
