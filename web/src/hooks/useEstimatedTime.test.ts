import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEstimatedTime, estimateTimeLabel } from './useEstimatedTime';

describe('estimateTimeLabel', () => {
  it('returns "now" when target block has passed', () => {
    expect(estimateTimeLabel(100, 200)).toBe('now');
  });

  it('returns "now" when target equals current', () => {
    expect(estimateTimeLabel(100, 100)).toBe('now');
  });

  it('returns minutes for short durations', () => {
    // 3 blocks = 30 minutes
    const label = estimateTimeLabel(103, 100);
    expect(label).toContain('30 min');
  });

  it('returns hours for medium durations (< 48h)', () => {
    // 12 blocks = 2 hours
    const label = estimateTimeLabel(112, 100);
    expect(label).toContain('hour');
  });

  it('returns days for long durations', () => {
    // 144 blocks = 1 day
    const label = estimateTimeLabel(244, 100);
    expect(label).toContain('day');
  });
});

describe('useEstimatedTime', () => {
  it('returns isPast=true when target block has passed', () => {
    const { result } = renderHook(() =>
      useEstimatedTime(100, { currentBlockHeight: 200 })
    );
    expect(result.current.isPast).toBe(true);
    expect(result.current.label).toBe('now');
  });

  it('returns isPast=false when target is in the future', () => {
    const { result } = renderHook(() =>
      useEstimatedTime(2116, { currentBlockHeight: 100 })
    );
    expect(result.current.isPast).toBe(false);
    expect(result.current.label).toContain('day');
  });

  it('reports correct minutes for remaining blocks', () => {
    const { result } = renderHook(() =>
      useEstimatedTime(110, { currentBlockHeight: 100 })
    );
    // 10 blocks × 10 min = 100 minutes
    expect(result.current.minutes).toBe(100);
  });

  it('defaults currentBlockHeight to 0 when not provided', () => {
    const { result } = renderHook(() => useEstimatedTime(6));
    // 6 blocks = 60 min = 1 hour
    expect(result.current.label).toContain('hour');
    expect(result.current.isPast).toBe(false);
  });
});
