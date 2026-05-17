import {
  cycleRate,
  compoundedPrincipal,
  totalCompoundYield,
  cycleCompoundReward,
  isValidRate,
  isValidCycleIndex,
  effectiveAnnualYieldPct,
} from './compoundInterestUtils';
import { BLOCKS_PER_CYCLE } from '../types/StackingYield';

describe('cycleRate', () => {
  it('returns a positive value for positive APY', () => {
    expect(cycleRate(10)).toBeGreaterThan(0);
  });

  it('returns 0 for 0% APY', () => {
    expect(cycleRate(0)).toBe(0);
  });

  it('is proportional to APY (twice the APY → twice the rate)', () => {
    expect(cycleRate(20)).toBeCloseTo(cycleRate(10) * 2, 10);
  });

  it('is less than 1 for typical yield percentages', () => {
    expect(cycleRate(25)).toBeLessThan(1);
  });
});
