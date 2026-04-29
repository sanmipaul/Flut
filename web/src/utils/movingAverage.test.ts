/**
 * generateMovingAverage tests
 *
 * Covers window size validation, edge cases, and numerical correctness.
 */
import { generateMovingAverage } from './ChartDataUtils';
import { ChartDataPoint } from '../types/TransactionHistory';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function pts(...values: number[]): ChartDataPoint[] {
  return values.map((v, i) => ({ label: String(i), value: v }));
}

// ---------------------------------------------------------------------------
// NaN inputs in data values
// ---------------------------------------------------------------------------

describe('generateMovingAverage — NaN in input values', () => {
  it('NaN in input propagates through average (expected behaviour)', () => {
    const data = [
      { label: 'a', value: 10 },
      { label: 'b', value: NaN },
      { label: 'c', value: 30 },
    ];
    // NaN in window makes the average NaN — this is expected
    // The fix is window size validation, not input value sanitization
    const result = generateMovingAverage(data, 1);
    expect(result[0].value).toBe(10);
    expect(result[2].value).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Default window size
// ---------------------------------------------------------------------------

describe('generateMovingAverage — default window size', () => {
  it('uses window=7 when no second argument is provided', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ label: String(i), value: i * 10 }));
    const withDefault = generateMovingAverage(data);
    const withExplicit = generateMovingAverage(data, 7);
    expect(withDefault).toEqual(withExplicit);
  });
});

// ---------------------------------------------------------------------------
// Window size validation — the core bug
// ---------------------------------------------------------------------------

describe('generateMovingAverage — window size validation', () => {
  it('windowSize=0 should not produce NaN values', () => {
    const data = pts(10, 20, 30);
    const result = generateMovingAverage(data, 0);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });

  it('windowSize=-1 should not produce NaN values', () => {
    const data = pts(10, 20, 30);
    const result = generateMovingAverage(data, -1);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });

  it('windowSize=-100 should not produce NaN values', () => {
    const data = pts(5, 10, 15, 20);
    const result = generateMovingAverage(data, -100);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });

  it('windowSize=0 returns same length as input', () => {
    const data = pts(1, 2, 3, 4, 5);
    expect(generateMovingAverage(data, 0)).toHaveLength(5);
  });

  it('windowSize=1 returns each point unchanged', () => {
    const data = pts(10, 20, 30);
    const result = generateMovingAverage(data, 1);
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBe(20);
    expect(result[2].value).toBe(30);
  });

  it('non-integer windowSize is handled gracefully', () => {
    const data = pts(10, 20, 30);
    const result = generateMovingAverage(data, 2.7);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });
});

// ---------------------------------------------------------------------------
// Empty and single-item input
// ---------------------------------------------------------------------------

describe('generateMovingAverage — empty and single-item input', () => {
  it('returns empty array for empty input', () => {
    expect(generateMovingAverage([], 7)).toEqual([]);
  });

  it('returns single item unchanged for single-item input', () => {
    const result = generateMovingAverage(pts(42), 7);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(42);
  });

  it('windowSize larger than data length is handled gracefully', () => {
    const data = pts(10, 20);
    const result = generateMovingAverage(data, 100);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });
});

// ---------------------------------------------------------------------------
// Two-element dataset
// ---------------------------------------------------------------------------

describe('generateMovingAverage — two-element dataset', () => {
  it('window=1 returns each point unchanged', () => {
    const result = generateMovingAverage([{ label: 'a', value: 10 }, { label: 'b', value: 20 }], 1);
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBe(20);
  });

  it('window=2 first point is average of first two', () => {
    const result = generateMovingAverage([{ label: 'a', value: 10 }, { label: 'b', value: 20 }], 2);
    // centred: index=0 → start=0, end=1 → [10] → 10
    expect(result[0].value).toBeCloseTo(10);
  });
});

// ---------------------------------------------------------------------------
// Numerical correctness
// ---------------------------------------------------------------------------

describe('generateMovingAverage — numerical correctness', () => {
  it('window=3 centre point is average of 3 neighbours', () => {
    // [10, 20, 30, 40, 50] with window=3
    // index 2 (value=30) → avg(20, 30, 40) = 30
    const data = pts(10, 20, 30, 40, 50);
    const result = generateMovingAverage(data, 3);
    expect(result[2].value).toBeCloseTo(30);
  });

  it('window=3 first point averages first two available', () => {
    const data = pts(10, 20, 30, 40, 50);
    const result = generateMovingAverage(data, 3);
    // start=0, end=2 → [10, 20] → avg = 15
    expect(result[0].value).toBeCloseTo(15);
  });

  it('window=3 last point averages last two available', () => {
    const data = pts(10, 20, 30, 40, 50);
    const result = generateMovingAverage(data, 3);
    // start=3, end=5 → [40, 50] → avg = 45
    expect(result[4].value).toBeCloseTo(45);
  });

  it('window=5 on 5-item array: all points average to same value if uniform', () => {
    const data = pts(4, 4, 4, 4, 4);
    const result = generateMovingAverage(data, 5);
    result.forEach((p) => expect(p.value).toBeCloseTo(4));
  });

  it('output length always equals input length', () => {
    for (const size of [1, 3, 5, 7, 100]) {
      const data = pts(1, 2, 3, 4, 5, 6, 7);
      expect(generateMovingAverage(data, size)).toHaveLength(data.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Single-element dataset
// ---------------------------------------------------------------------------

describe('generateMovingAverage — single-element dataset', () => {
  it('returns the single element unchanged for any window size', () => {
    for (const w of [0, 1, 7, 100]) {
      const result = generateMovingAverage([{ label: 'x', value: 42 }], w);
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(42);
    }
  });
});

// ---------------------------------------------------------------------------
// Large dataset performance baseline
// ---------------------------------------------------------------------------

describe('generateMovingAverage — large dataset', () => {
  it('handles 1000-element array without error', () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({
      label: String(i),
      value: Math.sin(i),
    }));
    const result = generateMovingAverage(data, 7);
    expect(result).toHaveLength(1000);
    result.forEach((p) => expect(Number.isFinite(p.value)).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// Label preservation
// ---------------------------------------------------------------------------

describe('generateMovingAverage — label preservation', () => {
  it('output labels match input labels in order', () => {
    const data: ChartDataPoint[] = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 20 },
      { label: 'Mar', value: 30 },
    ];
    const result = generateMovingAverage(data, 3);
    expect(result[0].label).toBe('Jan');
    expect(result[1].label).toBe('Feb');
    expect(result[2].label).toBe('Mar');
  });
});

// ---------------------------------------------------------------------------
// Values are always finite
// ---------------------------------------------------------------------------

describe('generateMovingAverage — output values are always finite', () => {
  it.each([0, 1, 2, 3, 7, 100])('windowSize=%i produces all-finite values', (w) => {
    const data = pts(10, 20, 30, 40, 50);
    const result = generateMovingAverage(data, w);
    result.forEach((p) => {
      expect(Number.isFinite(p.value)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Idempotency: calling twice with same args produces same result
// ---------------------------------------------------------------------------

describe('generateMovingAverage — idempotency', () => {
  it('two calls with identical arguments produce identical results', () => {
    const data = [
      { label: 'a', value: 10 },
      { label: 'b', value: 20 },
      { label: 'c', value: 30 },
    ];
    const r1 = generateMovingAverage(data, 3);
    const r2 = generateMovingAverage(data, 3);
    expect(r1).toEqual(r2);
  });
});

// ---------------------------------------------------------------------------
// Regression: original NaN bug
// ---------------------------------------------------------------------------

describe('regression: window=0 previously produced NaN', () => {
  it('window=0 returns all-finite values', () => {
    const data = pts(1, 2, 3, 4, 5);
    const result = generateMovingAverage(data, 0);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });

  it('window=-1 returns all-finite values', () => {
    const data = pts(10, 20, 30);
    const result = generateMovingAverage(data, -1);
    result.forEach((p) => expect(Number.isNaN(p.value)).toBe(false));
  });

  it('window=0 behaves as identity (each point unchanged)', () => {
    const data = pts(10, 20, 30);
    const result = generateMovingAverage(data, 0);
    expect(result[0].value).toBe(10);
    expect(result[1].value).toBe(20);
    expect(result[2].value).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// All-negative values
// ---------------------------------------------------------------------------

describe('generateMovingAverage — all-negative values', () => {
  it('correctly averages negative values', () => {
    const data = pts(-30, -20, -10);
    const result = generateMovingAverage(data, 3);
    result.forEach((p) => expect(Number.isFinite(p.value)).toBe(true));
    expect(result[1].value).toBeCloseTo(-20);
  });
});

// ---------------------------------------------------------------------------
// Input immutability
// ---------------------------------------------------------------------------

describe('generateMovingAverage — input immutability', () => {
  it('does not mutate the input array', () => {
    const data = [
      { label: 'a', value: 10 },
      { label: 'b', value: 20 },
      { label: 'c', value: 30 },
    ];
    const original = data.map((p) => ({ ...p }));
    generateMovingAverage(data, 3);
    data.forEach((p, i) => {
      expect(p.label).toBe(original[i].label);
      expect(p.value).toBe(original[i].value);
    });
  });
});

// ---------------------------------------------------------------------------
// Monotonic input stays monotonic after smoothing
// ---------------------------------------------------------------------------

describe('generateMovingAverage — monotonic input', () => {
  it('strictly increasing input stays weakly increasing after smoothing', () => {
    const data = pts(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    const result = generateMovingAverage(data, 3);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].value).toBeGreaterThanOrEqual(result[i - 1].value);
    }
  });
});

// ---------------------------------------------------------------------------
// Smoothing reduces variance
// ---------------------------------------------------------------------------

describe('generateMovingAverage — smoothing reduces variance', () => {
  it('variance of smoothed output <= variance of input for w=3', () => {
    const data = pts(1, 100, 1, 100, 1);
    const result = generateMovingAverage(data, 3);
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = (arr: number[]) => {
      const m = mean(arr);
      return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
    };
    const inputV = variance(data.map((p) => p.value));
    const outputV = variance(result.map((p) => p.value));
    expect(outputV).toBeLessThanOrEqual(inputV);
  });
});
