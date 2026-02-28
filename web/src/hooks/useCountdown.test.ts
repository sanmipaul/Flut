import { renderHook, act } from '@testing-library/react';
import { useCountdown } from './useCountdown';
import type { UseCountdownInput } from '../types/Countdown';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const locked: UseCountdownInput = {
  createdAt: 100,
  unlockHeight: 300,      // 200 blocks remaining
  currentBlockHeight: 100,
  isWithdrawn: false,
};

const unlocked: UseCountdownInput = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 250, // past unlock
  isWithdrawn: false,
};

const withdrawn: UseCountdownInput = {
  createdAt: 100,
  unlockHeight: 200,
  currentBlockHeight: 300,
  isWithdrawn: true,
};

const imminent: UseCountdownInput = {
  createdAt: 100,
  unlockHeight: 106,    // 6 blocks = 3600 s = exactly 1 hr, so 5 blocks = imminent
  currentBlockHeight: 101, // 5 blocks remaining = 3000 s < 3600 s
  isWithdrawn: false,
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useCountdown — initial state', () => {
  it('phase is "counting" when many blocks remain', () => {
    const { result } = renderHook(() => useCountdown(locked));
    expect(result.current.phase).toBe('counting');
  });

  it('phase is "unlocked" when currentBlockHeight >= unlockHeight', () => {
    const { result } = renderHook(() => useCountdown(unlocked));
    expect(result.current.phase).toBe('unlocked');
  });

  it('phase is "withdrawn" when isWithdrawn is true', () => {
    const { result } = renderHook(() => useCountdown(withdrawn));
    expect(result.current.phase).toBe('withdrawn');
  });

  it('phase is "imminent" when < 1 hour remains', () => {
    const { result } = renderHook(() => useCountdown(imminent));
    expect(result.current.phase).toBe('imminent');
  });

  it('totalSecondsRemaining is 0 when unlocked', () => {
    const { result } = renderHook(() => useCountdown(unlocked));
    expect(result.current.totalSecondsRemaining).toBe(0);
  });

  it('totalSecondsRemaining is 0 when withdrawn', () => {
    const { result } = renderHook(() => useCountdown(withdrawn));
    expect(result.current.totalSecondsRemaining).toBe(0);
  });

  it('totalSecondsRemaining > 0 when locked', () => {
    const { result } = renderHook(() => useCountdown(locked));
    expect(result.current.totalSecondsRemaining).toBeGreaterThan(0);
  });

  it('ariaLabel is "Unlocked" when unlocked', () => {
    const { result } = renderHook(() => useCountdown(unlocked));
    expect(result.current.ariaLabel).toBe('Unlocked');
  });

  it('ariaLabel is "Withdrawn" when withdrawn', () => {
    const { result } = renderHook(() => useCountdown(withdrawn));
    expect(result.current.ariaLabel).toBe('Withdrawn');
  });

  it('ariaLabel contains "remaining" when counting', () => {
    const { result } = renderHook(() => useCountdown(locked));
    expect(result.current.ariaLabel).toContain('remaining');
  });
});

// ---------------------------------------------------------------------------
// Units decomposition
// ---------------------------------------------------------------------------

describe('useCountdown — units decomposition', () => {
  it('units have days when many blocks remain', () => {
    // 200 blocks * 600 s = 120,000 s = 1.38 days
    const { result } = renderHook(() => useCountdown(locked));
    expect(result.current.units.days).toBeGreaterThanOrEqual(1);
  });

  it('units are all zero when unlocked', () => {
    const { result } = renderHook(() => useCountdown(unlocked));
    const { days, hours, minutes, seconds } = result.current.units;
    expect(days + hours + minutes + seconds).toBe(0);
  });

  it('units are all zero when withdrawn', () => {
    const { result } = renderHook(() => useCountdown(withdrawn));
    const { days, hours, minutes, seconds } = result.current.units;
    expect(days + hours + minutes + seconds).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tick behaviour
// ---------------------------------------------------------------------------

describe('useCountdown — tick behaviour', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('totalSecondsRemaining decreases by 1 after 1 second', () => {
    const { result } = renderHook(() => useCountdown(locked));
    const initial = result.current.totalSecondsRemaining;
    act(() => { jest.advanceTimersByTime(1_000); });
    expect(result.current.totalSecondsRemaining).toBe(initial - 1);
  });

  it('does not decrement when unlocked', () => {
    const { result } = renderHook(() => useCountdown(unlocked));
    act(() => { jest.advanceTimersByTime(5_000); });
    expect(result.current.totalSecondsRemaining).toBe(0);
  });

  it('does not decrement when withdrawn', () => {
    const { result } = renderHook(() => useCountdown(withdrawn));
    act(() => { jest.advanceTimersByTime(5_000); });
    expect(result.current.totalSecondsRemaining).toBe(0);
  });
});
