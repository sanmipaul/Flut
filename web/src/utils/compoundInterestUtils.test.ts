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

describe('compound vs simple convergence', () => {
  it('totalCompoundYield equals principal*r*1 for n=1 (no compounding benefit)', () => {
    const p = 10_000;
    const r = cycleRate(10);
    expect(totalCompoundYield(p, r, 1)).toBeCloseTo(p * r, 8);
  });

  it('cycleCompoundReward(p, r, 1) equals p*r', () => {
    const p = 5_000;
    const r = 0.005;
    expect(cycleCompoundReward(p, r, 1)).toBeCloseTo(p * r, 10);
  });
});

describe('cycleRate — known value check', () => {
  it('cycleRate(10) ≈ BLOCKS_PER_CYCLE / 52596 * 0.1', () => {
    const expected = (BLOCKS_PER_CYCLE / 52_596) * 0.1;
    expect(cycleRate(10)).toBeCloseTo(expected, 10);
  });
});

describe('effectiveAnnualYieldPct — greater than nominal for r>0', () => {
  it('EAY of 5% nominal is slightly above 5', () => {
    const eay = effectiveAnnualYieldPct(cycleRate(5));
    expect(eay).toBeGreaterThan(5);
  });

  it('EAY of 20% nominal is slightly above 20', () => {
    const eay = effectiveAnnualYieldPct(cycleRate(20));
    expect(eay).toBeGreaterThan(20);
  });
});

describe('compoundedPrincipal — monotone in n', () => {
  it('larger n always yields larger compoundedPrincipal for r>0', () => {
    const p = 1000;
    const r = 0.005;
    expect(compoundedPrincipal(p, r, 10)).toBeGreaterThan(compoundedPrincipal(p, r, 5));
  });
});

describe('totalCompoundYield — equals compoundedPrincipal minus principal', () => {
  it('totalCompoundYield(p,r,n) === compoundedPrincipal(p,r,n) - p', () => {
    const p = 5000;
    const r = 0.008;
    const n = 10;
    expect(totalCompoundYield(p, r, n)).toBeCloseTo(compoundedPrincipal(p, r, n) - p, 8);
  });
});

describe('cycleCompoundReward — parametrised accuracy', () => {
  it.each([
    { p: 1000, r: 0.01, i: 1, expected: 10 },
    { p: 1000, r: 0.01, i: 2, expected: 10.1 },
    { p: 1000, r: 0.01, i: 3, expected: 10.201 },
  ])('reward for cycle $i is $expected', ({ p, r, i, expected }) => {
    expect(cycleCompoundReward(p, r, i)).toBeCloseTo(expected, 4);
  });
});

describe('compoundInterestUtils — never-NaN safety', () => {
  it('cycleRate(0) is finite', () => expect(Number.isFinite(cycleRate(0))).toBe(true));
  it('compoundedPrincipal with valid args is finite', () => {
    expect(Number.isFinite(compoundedPrincipal(1000, 0.01, 12))).toBe(true);
  });
  it('totalCompoundYield with valid args is finite', () => {
    expect(Number.isFinite(totalCompoundYield(1000, 0.01, 12))).toBe(true);
  });
  it('cycleCompoundReward with valid args is finite', () => {
    expect(Number.isFinite(cycleCompoundReward(1000, 0.01, 6))).toBe(true);
  });
  it('effectiveAnnualYieldPct with valid rate is finite', () => {
    expect(Number.isFinite(effectiveAnnualYieldPct(0.004))).toBe(true);
  });
});
