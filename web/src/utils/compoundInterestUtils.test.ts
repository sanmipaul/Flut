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

describe('cycleCompoundReward', () => {
  it('cycle 1 reward equals principal * r (simple interest)', () => {
    expect(cycleCompoundReward(1000, 0.01, 1)).toBeCloseTo(10, 8);
  });

  it('cycle 2 reward is larger than cycle 1 by factor (1+r)', () => {
    const r1 = cycleCompoundReward(1000, 0.01, 1);
    const r2 = cycleCompoundReward(1000, 0.01, 2);
    expect(r2).toBeCloseTo(r1 * 1.01, 8);
  });

  it('rewards increase monotonically with cycle index', () => {
    const rewards = [1, 2, 3, 4, 5].map((i) => cycleCompoundReward(1000, 0.01, i));
    for (let i = 1; i < rewards.length; i++) {
      expect(rewards[i]).toBeGreaterThan(rewards[i - 1]);
    }
  });

  it('reward for r=0 is always 0', () => {
    expect(cycleCompoundReward(1000, 0, 5)).toBeCloseTo(0, 10);
  });

  it('sum of n cycle rewards equals totalCompoundYield', () => {
    const p = 1000;
    const r = 0.01;
    const n = 12;
    const sumOfCycles = Array.from({ length: n }, (_, i) => cycleCompoundReward(p, r, i + 1))
      .reduce((s, v) => s + v, 0);
    expect(sumOfCycles).toBeCloseTo(totalCompoundYield(p, r, n), 6);
  });
});

describe('isValidRate', () => {
  it('returns true for 0', () => expect(isValidRate(0)).toBe(true));
  it('returns true for a small positive rate', () => expect(isValidRate(0.005)).toBe(true));
  it('returns false for NaN', () => expect(isValidRate(NaN)).toBe(false));
  it('returns false for Infinity', () => expect(isValidRate(Infinity)).toBe(false));
  it('returns false for negative rates', () => expect(isValidRate(-0.01)).toBe(false));
});

describe('isValidCycleIndex', () => {
  it('returns true for 1', () => expect(isValidCycleIndex(1)).toBe(true));
  it('returns true for large integers', () => expect(isValidCycleIndex(1000)).toBe(true));
  it('returns false for 0', () => expect(isValidCycleIndex(0)).toBe(false));
  it('returns false for negative', () => expect(isValidCycleIndex(-1)).toBe(false));
  it('returns false for non-integers', () => expect(isValidCycleIndex(1.5)).toBe(false));
});

describe('effectiveAnnualYieldPct', () => {
  it('returns 0 for r=0', () => {
    expect(effectiveAnnualYieldPct(0)).toBeCloseTo(0, 10);
  });

  it('returns slightly above 10 for cycleRate(10)', () => {
    const eay = effectiveAnnualYieldPct(cycleRate(10));
    expect(eay).toBeGreaterThan(10);
    expect(eay).toBeLessThan(11);
  });

  it('is always >= nominal APY for positive rates (due to compounding)', () => {
    [1, 5, 10, 20].forEach((apy) => {
      const eay = effectiveAnnualYieldPct(cycleRate(apy));
      expect(eay).toBeGreaterThanOrEqual(apy);
    });
  });
});
