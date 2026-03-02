import {
  BLOCKS_PER_CYCLE,
  SATOSHIS_PER_BTC,
  DEFAULT_APY_PCT,
  MIN_APY_PCT,
  MAX_APY_PCT,
} from './StackingYield';
import type {
  StackingYieldInput,
  StackingYieldResult,
  StackingCycleReward,
} from './StackingYield';

describe('StackingYield constants', () => {
  it('BLOCKS_PER_CYCLE is 2100', () => expect(BLOCKS_PER_CYCLE).toBe(2_100));
  it('SATOSHIS_PER_BTC is 100_000_000', () => expect(SATOSHIS_PER_BTC).toBe(100_000_000));
  it('DEFAULT_APY_PCT is 10', () => expect(DEFAULT_APY_PCT).toBe(10));
  it('MIN_APY_PCT is 1', () => expect(MIN_APY_PCT).toBe(1));
  it('MAX_APY_PCT is 25', () => expect(MAX_APY_PCT).toBe(25));
  it('MIN_APY_PCT < DEFAULT_APY_PCT < MAX_APY_PCT', () => {
    expect(MIN_APY_PCT).toBeLessThan(DEFAULT_APY_PCT);
    expect(DEFAULT_APY_PCT).toBeLessThan(MAX_APY_PCT);
  });
});

describe('StackingYieldInput interface', () => {
  it('can be constructed with required fields', () => {
    const input: StackingYieldInput = {
      stxAmount: 1000,
      totalLockBlocks: 10_000,
      annualisedYieldPct: 10,
    };
    expect(input.stxAmount).toBe(1000);
  });
});

describe('StackingCycleReward interface', () => {
  it('can be constructed with all fields', () => {
    const cycle: StackingCycleReward = {
      cycleNumber: 1,
      estimatedBtc: 0.005,
      cumulativeBtc: 0.005,
    };
    expect(cycle.cycleNumber).toBe(1);
    expect(cycle.cumulativeBtc).toBeGreaterThanOrEqual(cycle.estimatedBtc);
  });
});

describe('StackingYieldResult interface', () => {
  it('can be constructed with all fields', () => {
    const result: StackingYieldResult = {
      cycles: [],
      totalBtc: 0,
      fullCycleCount: 0,
      effectiveYieldPct: 10,
      hasYield: false,
    };
    expect(result.hasYield).toBe(false);
  });

  it('hasYield is true when cycles exist', () => {
    const result: StackingYieldResult = {
      cycles: [{ cycleNumber: 1, estimatedBtc: 0.01, cumulativeBtc: 0.01 }],
      totalBtc: 0.01,
      fullCycleCount: 1,
      effectiveYieldPct: 10,
      hasYield: true,
    };
    expect(result.hasYield).toBe(true);
    expect(result.cycles.length).toBe(result.fullCycleCount);
  });
});
