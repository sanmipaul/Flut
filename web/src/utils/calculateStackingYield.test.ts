import { calculateStackingYield } from './calculateStackingYield';
import { BLOCKS_PER_CYCLE } from '../types/StackingYield';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_INPUT = {
  stxAmount: 10_000,
  totalLockBlocks: BLOCKS_PER_CYCLE * 6, // 6 full cycles
  annualisedYieldPct: 10,
};

// ---------------------------------------------------------------------------
// Zero / edge cases
// ---------------------------------------------------------------------------

describe('calculateStackingYield — zero and edge cases', () => {
  it('returns hasYield=false when stxAmount is 0', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, stxAmount: 0 });
    expect(result.hasYield).toBe(false);
    expect(result.cycles).toHaveLength(0);
    expect(result.totalBtc).toBe(0);
  });

  it('returns hasYield=false when totalLockBlocks is 0', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: 0 });
    expect(result.hasYield).toBe(false);
    expect(result.cycles).toHaveLength(0);
  });

  it('returns hasYield=false when lock period is shorter than one cycle', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE - 1 });
    expect(result.hasYield).toBe(false);
    expect(result.fullCycleCount).toBe(0);
  });

  it('returns hasYield=false when annualisedYieldPct is 0', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, annualisedYieldPct: 0 });
    expect(result.hasYield).toBe(false);
    expect(result.totalBtc).toBe(0);
  });

  it('clamps negative stxAmount to 0 and returns hasYield=false', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, stxAmount: -100 });
    expect(result.hasYield).toBe(false);
    expect(result.totalBtc).toBe(0);
  });

  it('clamps negative totalLockBlocks to 0 and returns hasYield=false', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: -500 });
    expect(result.hasYield).toBe(false);
  });

  it('clamps negative annualisedYieldPct to 0 and returns hasYield=false', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, annualisedYieldPct: -5 });
    expect(result.hasYield).toBe(false);
    expect(result.totalBtc).toBe(0);
  });

  it('returns effectiveYieldPct equal to annualisedYieldPct for valid input', () => {
    const result = calculateStackingYield(BASE_INPUT);
    expect(result.effectiveYieldPct).toBe(BASE_INPUT.annualisedYieldPct);
  });
});

// ---------------------------------------------------------------------------
// Cycle counting
// ---------------------------------------------------------------------------

describe('calculateStackingYield — cycle count', () => {
  it('returns exactly one cycle for exactly one cycle of blocks', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE });
    expect(result.fullCycleCount).toBe(1);
    expect(result.cycles).toHaveLength(1);
    expect(result.hasYield).toBe(true);
  });

  it('returns 6 cycles for 6-cycle lock period', () => {
    const result = calculateStackingYield(BASE_INPUT);
    expect(result.fullCycleCount).toBe(6);
    expect(result.cycles).toHaveLength(6);
  });

  it('ignores partial cycle at the end', () => {
    const blocks = BLOCKS_PER_CYCLE * 3 + 500; // 3 full + partial
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: blocks });
    expect(result.fullCycleCount).toBe(3);
    expect(result.cycles).toHaveLength(3);
  });

  it('numbers cycles starting at 1', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE * 3 });
    expect(result.cycles[0].cycleNumber).toBe(1);
    expect(result.cycles[1].cycleNumber).toBe(2);
    expect(result.cycles[2].cycleNumber).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// BTC reward values
// ---------------------------------------------------------------------------

describe('calculateStackingYield — reward values', () => {
  it('estimatedBtc increases each cycle (compound model)', () => {
    const result = calculateStackingYield(BASE_INPUT);
    for (let i = 1; i < result.cycles.length; i++) {
      expect(result.cycles[i].estimatedBtc).toBeGreaterThan(result.cycles[i - 1].estimatedBtc);
    }
  });

  it('totalBtc equals sum of all cycle rewards', () => {
    const result = calculateStackingYield(BASE_INPUT);
    const sum = result.cycles.reduce((acc, c) => acc + c.estimatedBtc, 0);
    expect(result.totalBtc).toBeCloseTo(sum, 10);
  });

  it('cumulativeBtc increases monotonically', () => {
    const result = calculateStackingYield(BASE_INPUT);
    for (let i = 1; i < result.cycles.length; i++) {
      expect(result.cycles[i].cumulativeBtc).toBeGreaterThan(result.cycles[i - 1].cumulativeBtc);
    }
  });

  it('last cumulativeBtc equals totalBtc', () => {
    const result = calculateStackingYield(BASE_INPUT);
    const last = result.cycles[result.cycles.length - 1];
    expect(last.cumulativeBtc).toBeCloseTo(result.totalBtc, 10);
  });

  it('higher APY produces higher totalBtc', () => {
    const low = calculateStackingYield({ ...BASE_INPUT, annualisedYieldPct: 5 });
    const high = calculateStackingYield({ ...BASE_INPUT, annualisedYieldPct: 20 });
    expect(high.totalBtc).toBeGreaterThan(low.totalBtc);
  });

  it('more STX produces proportionally higher totalBtc', () => {
    const small = calculateStackingYield({ ...BASE_INPUT, stxAmount: 1_000 });
    const large = calculateStackingYield({ ...BASE_INPUT, stxAmount: 10_000 });
    expect(large.totalBtc).toBeCloseTo(small.totalBtc * 10, 8);
  });

  it('longer lock period produces more total reward (more cycles)', () => {
    const short = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE * 2 });
    const long = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE * 10 });
    expect(long.totalBtc).toBeGreaterThan(short.totalBtc);
  });

  it('totalBtc is positive for valid inputs', () => {
    const result = calculateStackingYield(BASE_INPUT);
    expect(result.totalBtc).toBeGreaterThan(0);
  });

  it('first cycle cumulativeBtc equals estimatedBtc', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE * 2 });
    expect(result.cycles[0].cumulativeBtc).toBeCloseTo(result.cycles[0].estimatedBtc, 10);
  });
});

// ---------------------------------------------------------------------------
// Large inputs (stress)
// ---------------------------------------------------------------------------

describe('calculateStackingYield — large inputs', () => {
  it('handles 1 million STX without overflow', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, stxAmount: 1_000_000 });
    expect(Number.isFinite(result.totalBtc)).toBe(true);
    expect(result.totalBtc).toBeGreaterThan(0);
  });

  it('handles 1000 cycles without errors', () => {
    const result = calculateStackingYield({
      ...BASE_INPUT,
      totalLockBlocks: BLOCKS_PER_CYCLE * 1000,
    });
    expect(result.cycles).toHaveLength(1000);
    expect(Number.isFinite(result.totalBtc)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Boundary: exactly BLOCKS_PER_CYCLE
// ---------------------------------------------------------------------------

describe('calculateStackingYield — boundary at exactly one cycle', () => {
  it('exactly BLOCKS_PER_CYCLE blocks yields exactly 1 cycle', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE });
    expect(result.fullCycleCount).toBe(1);
    expect(result.hasYield).toBe(true);
  });

  it('BLOCKS_PER_CYCLE - 1 blocks yields 0 cycles', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE - 1 });
    expect(result.fullCycleCount).toBe(0);
    expect(result.hasYield).toBe(false);
  });

  it('BLOCKS_PER_CYCLE + 1 blocks yields exactly 1 cycle (ignores partial)', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE + 1 });
    expect(result.fullCycleCount).toBe(1);
    expect(result.cycles).toHaveLength(1);
  });

  it('MIN_APY_PCT (1%) with 1 cycle returns a positive totalBtc', () => {
    const result = calculateStackingYield({
      stxAmount: 10_000,
      totalLockBlocks: BLOCKS_PER_CYCLE,
      annualisedYieldPct: 1,
    });
    expect(result.totalBtc).toBeGreaterThan(0);
  });

  it('MAX_APY_PCT (25%) with 1 cycle returns more than MIN_APY_PCT', () => {
    const min = calculateStackingYield({ stxAmount: 10_000, totalLockBlocks: BLOCKS_PER_CYCLE, annualisedYieldPct: 1 });
    const max = calculateStackingYield({ stxAmount: 10_000, totalLockBlocks: BLOCKS_PER_CYCLE, annualisedYieldPct: 25 });
    expect(max.totalBtc).toBeGreaterThan(min.totalBtc);
  });

  it('reward scales linearly with APY at fixed stxAmount', () => {
    const at10 = calculateStackingYield({ stxAmount: 1_000, totalLockBlocks: BLOCKS_PER_CYCLE, annualisedYieldPct: 10 });
    const at20 = calculateStackingYield({ stxAmount: 1_000, totalLockBlocks: BLOCKS_PER_CYCLE, annualisedYieldPct: 20 });
    expect(at20.totalBtc).toBeCloseTo(at10.totalBtc * 2, 8);
  });
});

// ---------------------------------------------------------------------------
// Compound interest — failing tests exposing the linear model bug
// ---------------------------------------------------------------------------

describe('calculateStackingYield — high-APY compounding effect', () => {
  it('at 25% APY, 26-cycle compound total significantly exceeds simple total', () => {
    const result = calculateStackingYield({
      stxAmount: 10_000,
      totalLockBlocks: BLOCKS_PER_CYCLE * 26,
      annualisedYieldPct: 25,
    });
    const firstCycle = result.cycles[0].estimatedBtc;
    const simpleTotal = firstCycle * 26;
    expect(result.totalBtc).toBeGreaterThan(simpleTotal * 1.05);
  });
});

describe('calculateStackingYield — proportional scaling still holds', () => {
  it('doubling the principal doubles totalBtc (compound preserves linearity in principal)', () => {
    const base = calculateStackingYield(BASE_INPUT);
    const doubled = calculateStackingYield({ ...BASE_INPUT, stxAmount: BASE_INPUT.stxAmount * 2 });
    expect(doubled.totalBtc).toBeCloseTo(base.totalBtc * 2, 6);
  });
});

describe('calculateStackingYield — zero-APY unchanged', () => {
  it('0% APY still returns hasYield=false', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, annualisedYieldPct: 0 });
    expect(result.hasYield).toBe(false);
    expect(result.totalBtc).toBe(0);
  });
});

describe('calculateStackingYield — compound model verification', () => {
  it('cycle 1 reward equals simple-interest amount (no prior accumulation)', () => {
    const result = calculateStackingYield({ ...BASE_INPUT, totalLockBlocks: BLOCKS_PER_CYCLE });
    const r = (BASE_INPUT.annualisedYieldPct / 100) * (BLOCKS_PER_CYCLE / 52_596);
    expect(result.totalBtc).toBeCloseTo(BASE_INPUT.stxAmount * r, 6);
  });

  it('cycle rewards are strictly increasing', () => {
    const result = calculateStackingYield(BASE_INPUT);
    for (let i = 1; i < result.cycles.length; i++) {
      expect(result.cycles[i].estimatedBtc).toBeGreaterThan(result.cycles[i - 1].estimatedBtc);
    }
  });

  it('cumulativeBtc of last cycle equals totalBtc', () => {
    const result = calculateStackingYield(BASE_INPUT);
    const last = result.cycles[result.cycles.length - 1];
    expect(last.cumulativeBtc).toBeCloseTo(result.totalBtc, 8);
  });
});

describe('calculateStackingYield — compound interest', () => {
  it('each cycle reward should be strictly greater than the previous (compound growth)', () => {
    const result = calculateStackingYield(BASE_INPUT);
    for (let i = 1; i < result.cycles.length; i++) {
      expect(result.cycles[i].estimatedBtc).toBeGreaterThan(result.cycles[i - 1].estimatedBtc);
    }
  });

  it('cycle 1 reward equals the simple-interest reward (no prior accumulation)', () => {
    const oneCycle = calculateStackingYield({
      ...BASE_INPUT,
      totalLockBlocks: BLOCKS_PER_CYCLE,
    });
    const sixCycles = calculateStackingYield(BASE_INPUT);
    // First cycle reward must be identical regardless of total cycle count
    expect(oneCycle.totalBtc).toBeCloseTo(sixCycles.cycles[0].estimatedBtc, 10);
  });

  it('compound totalBtc diverges visibly from simple at 26 cycles (1 year at 10% APY)', () => {
    // At 10% APY, 26 cycles ≈ 1 year. Compound should beat simple by a measurable margin.
    const result = calculateStackingYield({
      stxAmount: 100_000,
      totalLockBlocks: BLOCKS_PER_CYCLE * 26,
      annualisedYieldPct: 10,
    });
    const flatReward = result.cycles[0].estimatedBtc;
    const simpleTotal = flatReward * 26;
    expect(result.totalBtc).toBeGreaterThan(simpleTotal);
  });

  it('cycle 2 reward is greater than cycle 1 reward under compounding', () => {
    const result = calculateStackingYield({
      ...BASE_INPUT,
      totalLockBlocks: BLOCKS_PER_CYCLE * 2,
    });
    expect(result.cycles[1].estimatedBtc).toBeGreaterThan(result.cycles[0].estimatedBtc);
  });

  it('totalBtc with 12 cycles compound should exceed simple linear total', () => {
    const compoundResult = calculateStackingYield({
      stxAmount: 10_000,
      totalLockBlocks: BLOCKS_PER_CYCLE * 12,
      annualisedYieldPct: 10,
    });
    // Simple linear total = 12 * cycleReward (flat)
    const simpleCycleReward = compoundResult.cycles[0].estimatedBtc;
    const simpleTotal = simpleCycleReward * 12;
    expect(compoundResult.totalBtc).toBeGreaterThan(simpleTotal);
  });
});
