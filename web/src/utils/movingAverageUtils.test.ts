/**
 * movingAverageUtils tests
 */
import {
  clampWindowSize,
  isValidWindowSize,
  windowStart,
  windowEnd,
  arithmeticMean,
  centredMovingAverage,
  trailingMovingAverage,
  weightedMovingAverage,
  DEFAULT_WINDOW_SIZE,
} from './movingAverageUtils';
import { ChartDataPoint } from '../types/TransactionHistory';

function pts(...values: number[]): ChartDataPoint[] {
  return values.map((v, i) => ({ label: String(i), value: v }));
}

// ---------------------------------------------------------------------------
// Parametrised: all average functions produce finite-only output
// ---------------------------------------------------------------------------

describe.each([
  ['centredMovingAverage', centredMovingAverage],
  ['trailingMovingAverage', trailingMovingAverage],
  ['weightedMovingAverage', weightedMovingAverage],
] as const)('%s — never produces NaN', (_name, fn) => {
  const invalidWindows = [0, -1, -100, NaN, Infinity, -Infinity];
  it.each(invalidWindows)('window=%s returns finite values', (w) => {
    const data = pts(5, 10, 15, 20);
    fn(data, w as number).forEach((p) => expect(Number.isFinite(p.value)).toBe(true));
  });

  it('empty input returns empty array', () => {
    expect(fn([], 7)).toEqual([]);
  });

  it('output length equals input length', () => {
    const data = pts(1, 2, 3, 4, 5);
    expect(fn(data, 3)).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// clampWindowSize
// ---------------------------------------------------------------------------

describe('clampWindowSize', () => {
  it('clamps 0 to 1', () => {
    expect(clampWindowSize(0, 10)).toBe(1);
  });

  it('clamps negative to 1', () => {
    expect(clampWindowSize(-5, 10)).toBe(1);
  });

  it('passes through a value within range', () => {
    expect(clampWindowSize(3, 10)).toBe(3);
  });

  it('clamps to dataLength when windowSize exceeds it', () => {
    expect(clampWindowSize(100, 5)).toBe(5);
  });

  it('floors non-integer window size', () => {
    expect(clampWindowSize(3.9, 10)).toBe(3);
  });

  it('clamps NaN to 1', () => {
    expect(clampWindowSize(NaN, 10)).toBe(1);
  });

  it('clamps Infinity to dataLength', () => {
    expect(clampWindowSize(Infinity, 7)).toBe(7);
  });

  it('returns 1 when dataLength is 0', () => {
    expect(clampWindowSize(5, 0)).toBe(1);
  });

  it('returns 1 when dataLength is 1', () => {
    expect(clampWindowSize(5, 1)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// clampWindowSize — extended edge cases
// ---------------------------------------------------------------------------

describe('clampWindowSize — extended edge cases', () => {
  it('clamps window=1 to 1 (no change)', () => {
    expect(clampWindowSize(1, 10)).toBe(1);
  });

  it('equals dataLength when window === dataLength', () => {
    expect(clampWindowSize(5, 5)).toBe(5);
  });

  it('negative dataLength treated as 1', () => {
    expect(clampWindowSize(3, -5)).toBe(1);
  });

  it('result is always an integer', () => {
    for (const w of [0, 1, 2.9, 3.1, 7, 100]) {
      const result = clampWindowSize(w, 10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('result is always >= 1', () => {
    for (const w of [-100, -1, 0, 0.5, 1]) {
      expect(clampWindowSize(w, 10)).toBeGreaterThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// isValidWindowSize
// ---------------------------------------------------------------------------

describe('isValidWindowSize', () => {
  it('accepts positive integer', () => {
    expect(isValidWindowSize(1)).toBe(true);
    expect(isValidWindowSize(7)).toBe(true);
  });

  it('rejects 0', () => {
    expect(isValidWindowSize(0)).toBe(false);
  });

  it('rejects negative integer', () => {
    expect(isValidWindowSize(-1)).toBe(false);
  });

  it('rejects non-integer', () => {
    expect(isValidWindowSize(2.5)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidWindowSize(NaN)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// windowStart
// ---------------------------------------------------------------------------

describe('windowStart', () => {
  it('returns 0 for first element regardless of window', () => {
    expect(windowStart(0, 7)).toBe(0);
  });

  it('extends left by floor(w/2) for a centred element', () => {
    // i=5, w=3 → start = max(0, 5 - 1) = 4
    expect(windowStart(5, 3)).toBe(4);
  });

  it('never returns negative', () => {
    expect(windowStart(1, 7)).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// windowEnd
// ---------------------------------------------------------------------------

describe('windowEnd', () => {
  it('returns dataLength for last element', () => {
    expect(windowEnd(9, 7, 10)).toBe(10);
  });

  it('extends right by ceil(w/2)', () => {
    // i=5, w=3 → end = min(10, 5 + 2) = 7
    expect(windowEnd(5, 3, 10)).toBe(7);
  });

  it('never exceeds dataLength', () => {
    expect(windowEnd(8, 100, 10)).toBeLessThanOrEqual(10);
  });
});

// ---------------------------------------------------------------------------
// arithmeticMean
// ---------------------------------------------------------------------------

describe('arithmeticMean', () => {
  it('returns correct mean for a simple array', () => {
    expect(arithmeticMean([10, 20, 30])).toBeCloseTo(20);
  });

  it('returns 0 for empty array (not NaN)', () => {
    expect(arithmeticMean([])).toBe(0);
  });

  it('returns the value itself for single-element array', () => {
    expect(arithmeticMean([42])).toBe(42);
  });

  it('handles all-zero array', () => {
    expect(arithmeticMean([0, 0, 0])).toBe(0);
  });

  it('handles negative values', () => {
    expect(arithmeticMean([-10, 10])).toBeCloseTo(0);
  });
});

// ---------------------------------------------------------------------------
// centredMovingAverage
// ---------------------------------------------------------------------------

describe('centredMovingAverage', () => {
  it('returns empty array for empty input', () => {
    expect(centredMovingAverage([], 7)).toEqual([]);
  });

  it('output has same length as input', () => {
    const data = pts(1, 2, 3, 4, 5);
    expect(centredMovingAverage(data, 3)).toHaveLength(5);
  });

  it('window=1: each output equals its input value', () => {
    const data = pts(10, 20, 30);
    const result = centredMovingAverage(data, 1);
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBe(20);
    expect(result[2].value).toBe(30);
  });

  it('window=0 is treated as window=1 (no NaN)', () => {
    const data = pts(10, 20, 30);
    const result = centredMovingAverage(data, 0);
    result.forEach((p) => expect(Number.isFinite(p.value)).toBe(true));
  });

  it('negative window is treated as window=1 (no NaN)', () => {
    const data = pts(10, 20, 30);
    const result = centredMovingAverage(data, -5);
    result.forEach((p) => expect(Number.isFinite(p.value)).toBe(true));
  });

  it('preserves input labels', () => {
    const data: ChartDataPoint[] = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ];
    const result = centredMovingAverage(data, 1);
    expect(result[0].label).toBe('A');
    expect(result[1].label).toBe('B');
  });

  it('does not mutate the input array', () => {
    const data = pts(1, 2, 3, 4, 5);
    const original = data.map((p) => p.value);
    centredMovingAverage(data, 3);
    data.forEach((p, i) => expect(p.value).toBe(original[i]));
  });

  it('window=3: centre of uniform array returns that value', () => {
    const data = pts(5, 5, 5, 5, 5);
    const result = centredMovingAverage(data, 3);
    result.forEach((p) => expect(p.value).toBeCloseTo(5));
  });

  it('window > data.length: clamps to full average', () => {
    const data = pts(10, 20, 30);
    // clamped to 3, average = 20
    const result = centredMovingAverage(data, 100);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });

  it('all output values are finite regardless of window size', () => {
    const data = pts(5, 10, 15, 20, 25);
    for (const w of [0, 1, 2, 3, 7, 100, -1]) {
      centredMovingAverage(data, w).forEach((p) => {
        expect(Number.isFinite(p.value)).toBe(true);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// trailingMovingAverage
// ---------------------------------------------------------------------------

describe('trailingMovingAverage', () => {
  it('returns empty for empty input', () => {
    expect(trailingMovingAverage([], 3)).toEqual([]);
  });

  it('first point is always its own value (only one data point available)', () => {
    const data = pts(42, 10, 20);
    const result = trailingMovingAverage(data, 3);
    expect(result[0].value).toBe(42);
  });

  it('window=2 second point is average of first two', () => {
    const data = pts(10, 20, 30);
    const result = trailingMovingAverage(data, 2);
    expect(result[1].value).toBeCloseTo(15); // avg(10, 20)
  });

  it('window=3 third point is average of first three', () => {
    const data = pts(10, 20, 30, 40);
    const result = trailingMovingAverage(data, 3);
    expect(result[2].value).toBeCloseTo(20); // avg(10, 20, 30)
  });

  it('does not use future values', () => {
    // If trailing uses future data, result[0] would not equal input[0]
    const data = pts(10, 100, 100);
    const result = trailingMovingAverage(data, 2);
    expect(result[0].value).toBe(10);
  });

  it('all values are finite for any window size', () => {
    const data = pts(5, 10, 15);
    for (const w of [0, 1, 2, 3, 100, -1]) {
      trailingMovingAverage(data, w).forEach((p) => {
        expect(Number.isFinite(p.value)).toBe(true);
      });
    }
  });

  it('preserves labels', () => {
    const data: ChartDataPoint[] = [{ label: 'X', value: 5 }, { label: 'Y', value: 10 }];
    const result = trailingMovingAverage(data, 2);
    expect(result[0].label).toBe('X');
    expect(result[1].label).toBe('Y');
  });
});

// ---------------------------------------------------------------------------
// weightedMovingAverage
// ---------------------------------------------------------------------------

describe('weightedMovingAverage', () => {
  it('returns empty for empty input', () => {
    expect(weightedMovingAverage([], 3)).toEqual([]);
  });

  it('first point equals its own value', () => {
    const data = pts(10, 20, 30);
    const result = weightedMovingAverage(data, 3);
    expect(result[0].value).toBe(10);
  });

  it('produces finite values for all valid window sizes', () => {
    const data = pts(1, 2, 3, 4, 5);
    for (const w of [1, 2, 3, 5, 10]) {
      weightedMovingAverage(data, w).forEach((p) =>
        expect(Number.isFinite(p.value)).toBe(true)
      );
    }
  });

  it('invalid window sizes produce finite values', () => {
    const data = pts(1, 2, 3);
    for (const w of [0, -1, NaN]) {
      weightedMovingAverage(data, w).forEach((p) =>
        expect(Number.isFinite(p.value)).toBe(true)
      );
    }
  });

  it('recent values are weighted more than older values', () => {
    // [1, 100] with window=2
    // WMA = (1*1 + 100*2) / (1+2) = 201/3 = 67
    // Simple MA = (1+100)/2 = 50.5
    const data = pts(1, 100);
    const wma = weightedMovingAverage(data, 2);
    const sma = trailingMovingAverage(data, 2);
    expect(wma[1].value).toBeGreaterThan(sma[1].value);
  });

  it('preserves labels', () => {
    const data: ChartDataPoint[] = [{ label: 'A', value: 1 }, { label: 'B', value: 2 }];
    const result = weightedMovingAverage(data, 2);
    expect(result[0].label).toBe('A');
    expect(result[1].label).toBe('B');
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_WINDOW_SIZE
// ---------------------------------------------------------------------------

describe('DEFAULT_WINDOW_SIZE', () => {
  it('equals 7', () => {
    expect(DEFAULT_WINDOW_SIZE).toBe(7);
  });
});
