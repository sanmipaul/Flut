import { renderHook, act } from '@testing-library/react';
import { useStackingYield } from './useStackingYield';
import {
  DEFAULT_APY_PCT,
  MIN_APY_PCT,
  MAX_APY_PCT,
  BLOCKS_PER_CYCLE,
} from '../types/StackingYield';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_INPUT = {
  stxAmount: 10_000,
  totalLockBlocks: BLOCKS_PER_CYCLE * 6,
};

const SHORT_INPUT = {
  stxAmount: 10_000,
  totalLockBlocks: BLOCKS_PER_CYCLE - 1, // < 1 cycle
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useStackingYield — initial state', () => {
  it('initialises apyPct to DEFAULT_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.apyPct).toBe(DEFAULT_APY_PCT);
  });

  it('exposes minApy equal to MIN_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.minApy).toBe(MIN_APY_PCT);
  });

  it('exposes maxApy equal to MAX_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.maxApy).toBe(MAX_APY_PCT);
  });

  it('returns a yieldResult object', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.yieldResult).toBeDefined();
    expect(typeof result.current.yieldResult.hasYield).toBe('boolean');
  });

  it('returns hasYield=true for a valid lock period', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.yieldResult.hasYield).toBe(true);
  });

  it('returns hasYield=false for lock period shorter than one cycle', () => {
    const { result } = renderHook(() => useStackingYield(SHORT_INPUT));
    expect(result.current.yieldResult.hasYield).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// setApyPct
// ---------------------------------------------------------------------------

describe('useStackingYield — setApyPct', () => {
  it('updates apyPct when called with a valid value', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(15));
    expect(result.current.apyPct).toBe(15);
  });

  it('clamps values below MIN_APY_PCT to MIN_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(0));
    expect(result.current.apyPct).toBe(MIN_APY_PCT);
  });

  it('clamps values above MAX_APY_PCT to MAX_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(100));
    expect(result.current.apyPct).toBe(MAX_APY_PCT);
  });

  it('rounds fractional values to nearest integer', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(12.7));
    expect(result.current.apyPct).toBe(13);
  });

  it('rounds 12.4 down to 12', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(12.4));
    expect(result.current.apyPct).toBe(12);
  });

  it('clamps negative to MIN_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(-5));
    expect(result.current.apyPct).toBe(MIN_APY_PCT);
  });

  it('accepts MIN_APY_PCT without clamping', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(MIN_APY_PCT));
    expect(result.current.apyPct).toBe(MIN_APY_PCT);
  });

  it('accepts MAX_APY_PCT without clamping', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(MAX_APY_PCT));
    expect(result.current.apyPct).toBe(MAX_APY_PCT);
  });
});

// ---------------------------------------------------------------------------
// resetApy
// ---------------------------------------------------------------------------

describe('useStackingYield — resetApy', () => {
  it('resets apyPct back to DEFAULT_APY_PCT', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(20));
    expect(result.current.apyPct).toBe(20);
    act(() => result.current.resetApy());
    expect(result.current.apyPct).toBe(DEFAULT_APY_PCT);
  });

  it('resetApy works even if apyPct is already default', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.resetApy());
    expect(result.current.apyPct).toBe(DEFAULT_APY_PCT);
  });
});

// ---------------------------------------------------------------------------
// yieldResult reactivity
// ---------------------------------------------------------------------------

describe('useStackingYield — yieldResult reactivity', () => {
  it('yieldResult updates when apyPct changes', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    const totalBtcAt10 = result.current.yieldResult.totalBtc;
    act(() => result.current.setApyPct(20));
    const totalBtcAt20 = result.current.yieldResult.totalBtc;
    expect(totalBtcAt20).toBeGreaterThan(totalBtcAt10);
  });

  it('yieldResult.effectiveYieldPct matches apyPct', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(15));
    expect(result.current.yieldResult.effectiveYieldPct).toBe(15);
  });

  it('yieldResult.fullCycleCount is 6 for a 6-cycle lock period', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.yieldResult.fullCycleCount).toBe(6);
  });

  it('yieldResult.cycles has 6 entries for a 6-cycle lock period', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    expect(result.current.yieldResult.cycles).toHaveLength(6);
  });

  it('totalBtc increases with higher APY after setApyPct', () => {
    const { result } = renderHook(() => useStackingYield(BASE_INPUT));
    act(() => result.current.setApyPct(MIN_APY_PCT));
    const lowTotal = result.current.yieldResult.totalBtc;
    act(() => result.current.setApyPct(MAX_APY_PCT));
    const highTotal = result.current.yieldResult.totalBtc;
    expect(highTotal).toBeGreaterThan(lowTotal);
  });
});
