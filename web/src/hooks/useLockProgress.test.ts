import { renderHook } from '@testing-library/react';
import { useLockProgress, blocksToTimeString } from './useLockProgress';

describe('blocksToTimeString', () => {
  it('returns "now" for 0 blocks', () => {
    expect(blocksToTimeString(0)).toBe('now');
  });

  it('returns "now" for negative blocks', () => {
    expect(blocksToTimeString(-5)).toBe('now');
  });

  it('returns minutes for less than one hour of blocks', () => {
    // 3 blocks = 30 minutes
    const result = blocksToTimeString(3);
    expect(result).toContain('min');
  });

  it('returns hours for 1–23 hours of blocks', () => {
    // 12 blocks = 2 hours
    const result = blocksToTimeString(12);
    expect(result).toContain('hr');
  });

  it('returns days for 1+ day of blocks', () => {
    // 288 blocks = 2 days
    const result = blocksToTimeString(288);
    expect(result).toContain('day');
  });

  it('pluralises days correctly', () => {
    expect(blocksToTimeString(288)).toContain('days');
  });

  it('does not pluralise a single day', () => {
    // 144 blocks = 1 day
    const result = blocksToTimeString(144);
    expect(result).toBe('~1 day');
  });

  it('returns hours for exactly BLOCKS_PER_HOUR blocks', () => {
    // 6 blocks = exactly 1 hour boundary
    const result = blocksToTimeString(6);
    expect(result).toContain('hr');
  });

  it('returns minutes for 5 blocks (just under 1 hour)', () => {
    const result = blocksToTimeString(5);
    expect(result).toContain('min');
  });

  it('returns days for exactly BLOCKS_PER_DAY blocks', () => {
    const result = blocksToTimeString(144);
    expect(result).toContain('day');
  });

  it('starts with ~ prefix', () => {
    expect(blocksToTimeString(10)).toMatch(/^~/);
  });
});

describe('useLockProgress', () => {
  const base = {
    createdAt: 100,
    unlockHeight: 200,
    currentBlockHeight: 150,
    isWithdrawn: false,
  };

  it('calculates 50% when halfway through lock period', () => {
    const { result } = renderHook(() => useLockProgress(base));
    expect(result.current.percentComplete).toBe(50);
  });

  it('calculates totalLockBlocks correctly', () => {
    const { result } = renderHook(() => useLockProgress(base));
    expect(result.current.totalLockBlocks).toBe(100);
  });

  it('calculates blocksRemaining correctly', () => {
    const { result } = renderHook(() => useLockProgress(base));
    expect(result.current.blocksRemaining).toBe(50);
  });

  it('reports status=locked when not yet at unlock height', () => {
    const { result } = renderHook(() => useLockProgress(base));
    expect(result.current.status).toBe('locked');
  });

  it('reports status=unlocked when at or past unlock height', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 200 })
    );
    expect(result.current.status).toBe('unlocked');
  });

  it('reports percentComplete=100 when unlocked', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 250 })
    );
    expect(result.current.percentComplete).toBe(100);
  });

  it('reports status=withdrawn when isWithdrawn is true', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, isWithdrawn: true })
    );
    expect(result.current.status).toBe('withdrawn');
  });

  it('clamps percentComplete to 100 even past unlock height', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 9999 })
    );
    expect(result.current.percentComplete).toBe(100);
  });

  it('returns 0 blocksRemaining when unlocked', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 300 })
    );
    expect(result.current.blocksRemaining).toBe(0);
  });

  it('handles zero-length lock period gracefully', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, createdAt: 100, unlockHeight: 100 })
    );
    expect(result.current.percentComplete).toBe(100);
  });

  it('timeRemaining is "Unlocked" when status is unlocked', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 200 })
    );
    expect(result.current.timeRemaining).toBe('Unlocked');
  });

  it('timeRemaining is "Withdrawn" when isWithdrawn is true', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, isWithdrawn: true })
    );
    expect(result.current.timeRemaining).toBe('Withdrawn');
  });

  it('blocksElapsed is 0 when currentBlockHeight equals createdAt', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 100 })
    );
    expect(result.current.blocksElapsed).toBe(0);
    expect(result.current.percentComplete).toBe(0);
  });

  it('withdrawn state has percentComplete=100 regardless of currentBlockHeight', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 110, isWithdrawn: true })
    );
    expect(result.current.percentComplete).toBe(100);
  });

  it('calculates blocksElapsed correctly at 75%', () => {
    const { result } = renderHook(() =>
      useLockProgress({ ...base, currentBlockHeight: 175 })
    );
    expect(result.current.blocksElapsed).toBe(75);
    expect(result.current.percentComplete).toBe(75);
  });
});
