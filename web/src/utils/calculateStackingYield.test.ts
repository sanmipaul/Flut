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
  it('estimatedBtc is the same for each cycle (fixed rate model)', () => {
    const result = calculateStackingYield(BASE_INPUT);
    const firstReward = result.cycles[0].estimatedBtc;
    result.cycles.forEach((cycle) => {
      expect(cycle.estimatedBtc).toBeCloseTo(firstReward, 10);
    });
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
