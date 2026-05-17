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

describe('compoundedPrincipal', () => {
  it('returns principal unchanged after 0 cycles', () => {
    expect(compoundedPrincipal(1000, 0.01, 0)).toBeCloseTo(1000, 10);
  });

  it('returns principal * (1+r) after 1 cycle', () => {
    expect(compoundedPrincipal(1000, 0.01, 1)).toBeCloseTo(1010, 10);
  });

  it('returns principal * (1+r)^n after n cycles', () => {
    expect(compoundedPrincipal(1000, 0.01, 12)).toBeCloseTo(1000 * Math.pow(1.01, 12), 8);
  });

  it('returns principal for r=0 (no growth)', () => {
    expect(compoundedPrincipal(5000, 0, 100)).toBeCloseTo(5000, 10);
  });
});

describe('totalCompoundYield', () => {
  it('returns 0 for 0 cycles', () => {
    expect(totalCompoundYield(1000, 0.01, 0)).toBeCloseTo(0, 10);
  });

  it('returns principal * r for 1 cycle (matches simple interest)', () => {
    expect(totalCompoundYield(1000, 0.01, 1)).toBeCloseTo(10, 8);
  });

  it('returns more than simple interest for 2+ cycles', () => {
    const simple = 1000 * 0.01 * 12;
    const compound = totalCompoundYield(1000, 0.01, 12);
    expect(compound).toBeGreaterThan(simple);
  });

  it('returns 0 for r=0', () => {
    expect(totalCompoundYield(5000, 0, 100)).toBeCloseTo(0, 10);
  });
});
