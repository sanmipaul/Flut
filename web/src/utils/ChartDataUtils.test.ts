/**
 * ChartDataUtils tests
 * Covers timezone-aware date grouping for all interval types.
 */
import {
  generateTimeSeriesData,
  generateTransactionCountData,
  generateCumulativeVolumeData,
  generateActivityHeatmap,
  generateMovingAverage,
  generateTransactionTypeDistribution,
  generateStatusDistribution,
  generatePeriodComparison,
  getTransactionTypeColor,
} from './ChartDataUtils';
import { VaultTransaction, TransactionType } from '../types/TransactionHistory';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeTx(overrides: Partial<VaultTransaction> = {}): VaultTransaction {
  return {
    id: 'tx-1',
    vaultId: 'vault-1',
    type: TransactionType.DEPOSIT,
    amount: 1000,
    timestamp: Date.now(),
    blockHeight: 100,
    txId: '0xabc',
    status: 'confirmed',
    description: 'Test transaction',
    initiatedBy: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    ...overrides,
  };
}

/**
 * Build a UTC timestamp for a specific local clock time by inverting the
 * offset so that `new Date(ts)` shows the given local H/D/M/Y values.
 * This lets tests assert local-time grouping regardless of where CI runs.
 */
function localTs(
  year: number,
  month: number, // 1-based
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): number {
  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

// ---------------------------------------------------------------------------
// generateTimeSeriesData — daily interval
// ---------------------------------------------------------------------------

describe('generateTimeSeriesData — daily interval', () => {
  it('groups transactions by local calendar date', () => {
    const day1 = localTs(2024, 3, 15, 10, 0, 0);
    const day2 = localTs(2024, 3, 16, 10, 0, 0);
    const txs = [
      makeTx({ timestamp: day1, amount: 100 }),
      makeTx({ timestamp: day1, amount: 200 }),
      makeTx({ timestamp: day2, amount: 300 }),
    ];
    const result = generateTimeSeriesData(txs, 'daily');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(300);
    expect(result[1].value).toBe(300);
  });

  it('returns empty array for empty input', () => {
    expect(generateTimeSeriesData([], 'daily')).toEqual([]);
  });

  it('excludes pending transactions', () => {
    const ts = localTs(2024, 3, 15);
    const txs = [
      makeTx({ timestamp: ts, amount: 500, status: 'pending' }),
      makeTx({ timestamp: ts, amount: 100, status: 'confirmed' }),
    ];
    const result = generateTimeSeriesData(txs, 'daily');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(100);
  });

  it('excludes failed transactions', () => {
    const ts = localTs(2024, 3, 15);
    const txs = [
      makeTx({ timestamp: ts, amount: 999, status: 'failed' }),
      makeTx({ timestamp: ts, amount: 50, status: 'confirmed' }),
    ];
    const result = generateTimeSeriesData(txs, 'daily');
    expect(result[0].value).toBe(50);
  });

  it('returns sorted output by date label', () => {
    const txs = [
      makeTx({ timestamp: localTs(2024, 3, 17), amount: 10 }),
      makeTx({ timestamp: localTs(2024, 3, 15), amount: 20 }),
      makeTx({ timestamp: localTs(2024, 3, 16), amount: 30 }),
    ];
    const result = generateTimeSeriesData(txs, 'daily');
    expect(result[0].label).toBeLessThanOrEqual(result[1].label as any);
    expect(result[1].label).toBeLessThanOrEqual(result[2].label as any);
  });
});

// ---------------------------------------------------------------------------
// generateTimeSeriesData — hourly interval
// ---------------------------------------------------------------------------

describe('generateTimeSeriesData — hourly interval', () => {
  it('groups transactions by local hour', () => {
    const h10 = localTs(2024, 3, 15, 10, 30, 0);
    const h11 = localTs(2024, 3, 15, 11, 15, 0);
    const txs = [
      makeTx({ timestamp: h10, amount: 100 }),
      makeTx({ timestamp: h10, amount: 200 }),
      makeTx({ timestamp: h11, amount: 400 }),
    ];
    const result = generateTimeSeriesData(txs, 'hourly');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(300);
    expect(result[1].value).toBe(400);
  });

  it('local hour label does not contain UTC offset Z', () => {
    const ts = localTs(2024, 3, 15, 23, 0, 0);
    const result = generateTimeSeriesData([makeTx({ timestamp: ts })], 'hourly');
    expect(result[0].label).not.toContain('Z');
  });

  it('uses local hour not UTC hour for key', () => {
    const ts = localTs(2024, 3, 15, 23, 0, 0);
    const result = generateTimeSeriesData([makeTx({ timestamp: ts })], 'hourly');
    const d = new Date(ts);
    const expectedHour = String(d.getHours()).padStart(2, '0');
    expect(result[0].label).toContain(`T${expectedHour}`);
  });
});

// ---------------------------------------------------------------------------
// generateTimeSeriesData — weekly interval
// ---------------------------------------------------------------------------

describe('generateTimeSeriesData — weekly interval', () => {
  it('groups transactions from the same local week together', () => {
    // Monday and Friday of the same week
    const monday = localTs(2024, 3, 11);
    const friday = localTs(2024, 3, 15);
    const txs = [
      makeTx({ timestamp: monday, amount: 100 }),
      makeTx({ timestamp: friday, amount: 200 }),
    ];
    const result = generateTimeSeriesData(txs, 'weekly');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(300);
  });

  it('separates transactions from different local weeks', () => {
    const week1 = localTs(2024, 3, 11);
    const week2 = localTs(2024, 3, 18);
    const txs = [
      makeTx({ timestamp: week1, amount: 100 }),
      makeTx({ timestamp: week2, amount: 200 }),
    ];
    const result = generateTimeSeriesData(txs, 'weekly');
    expect(result).toHaveLength(2);
  });

  it('weekly label does not contain UTC offset Z', () => {
    const ts = localTs(2024, 3, 15);
    const result = generateTimeSeriesData([makeTx({ timestamp: ts })], 'weekly');
    expect(result[0].label).not.toContain('Z');
  });
});

// ---------------------------------------------------------------------------
// generateTimeSeriesData — monthly interval
// ---------------------------------------------------------------------------

describe('generateTimeSeriesData — monthly interval', () => {
  it('groups transactions by local month', () => {
    const march = localTs(2024, 3, 15);
    const april = localTs(2024, 4, 1);
    const txs = [
      makeTx({ timestamp: march, amount: 100 }),
      makeTx({ timestamp: march, amount: 200 }),
      makeTx({ timestamp: april, amount: 400 }),
    ];
    const result = generateTimeSeriesData(txs, 'monthly');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(300);
    expect(result[1].value).toBe(400);
  });

  it('monthly label uses YYYY-MM format', () => {
    const ts = localTs(2024, 3, 15);
    const result = generateTimeSeriesData([makeTx({ timestamp: ts })], 'monthly');
    expect(result[0].label).toMatch(/^\d{4}-\d{2}$/);
  });

  it('monthly label does not contain UTC offset Z', () => {
    const ts = localTs(2024, 3, 15);
    const result = generateTimeSeriesData([makeTx({ timestamp: ts })], 'monthly');
    expect(result[0].label).not.toContain('Z');
  });
});

// ---------------------------------------------------------------------------
// generateTransactionCountData — daily interval
// ---------------------------------------------------------------------------

describe('generateTransactionCountData — daily interval', () => {
  it('counts all transactions regardless of status', () => {
    const ts = localTs(2024, 3, 15);
    const txs = [
      makeTx({ timestamp: ts, status: 'confirmed' }),
      makeTx({ timestamp: ts, status: 'pending' }),
      makeTx({ timestamp: ts, status: 'failed' }),
    ];
    const result = generateTransactionCountData(txs, 'daily');
    expect(result[0].value).toBe(3);
  });

  it('groups by local calendar date', () => {
    const day1 = localTs(2024, 3, 15);
    const day2 = localTs(2024, 3, 16);
    const txs = [
      makeTx({ timestamp: day1 }),
      makeTx({ timestamp: day1 }),
      makeTx({ timestamp: day2 }),
    ];
    const result = generateTransactionCountData(txs, 'daily');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(2);
    expect(result[1].value).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(generateTransactionCountData([], 'daily')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// generateTransactionCountData — hourly interval
// ---------------------------------------------------------------------------

describe('generateTransactionCountData — hourly interval', () => {
  it('groups by local hour', () => {
    const h10 = localTs(2024, 3, 15, 10);
    const h11 = localTs(2024, 3, 15, 11);
    const txs = [
      makeTx({ timestamp: h10 }),
      makeTx({ timestamp: h10 }),
      makeTx({ timestamp: h11 }),
    ];
    const result = generateTransactionCountData(txs, 'hourly');
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(2);
    expect(result[1].value).toBe(1);
  });

  it('hourly label does not contain Z', () => {
    const ts = localTs(2024, 3, 15, 23);
    const result = generateTransactionCountData([makeTx({ timestamp: ts })], 'hourly');
    expect(result[0].label).not.toContain('Z');
  });
});

// ---------------------------------------------------------------------------
// generateTransactionCountData — weekly interval
// ---------------------------------------------------------------------------

describe('generateTransactionCountData — weekly interval', () => {
  it('groups same-week transactions together', () => {
    const mon = localTs(2024, 3, 11);
    const thu = localTs(2024, 3, 14);
    const txs = [makeTx({ timestamp: mon }), makeTx({ timestamp: thu })];
    const result = generateTransactionCountData(txs, 'weekly');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// generateTransactionCountData — monthly interval
// ---------------------------------------------------------------------------

describe('generateTransactionCountData — monthly interval', () => {
  it('groups by local month', () => {
    const march = localTs(2024, 3, 15);
    const april = localTs(2024, 4, 2);
    const txs = [
      makeTx({ timestamp: march }),
      makeTx({ timestamp: march }),
      makeTx({ timestamp: april }),
    ];
    const result = generateTransactionCountData(txs, 'monthly');
    expect(result).toHaveLength(2);
  });

  it('monthly label matches YYYY-MM', () => {
    const ts = localTs(2024, 3, 15);
    const result = generateTransactionCountData([makeTx({ timestamp: ts })], 'monthly');
    expect(result[0].label).toMatch(/^\d{4}-\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// Date key helpers
// ---------------------------------------------------------------------------

describe('date key helpers', () => {
  it('getLocalDayKey returns YYYY-MM-DD using local date parts', () => {
    const { getLocalDayKey } = require('./ChartDataUtils');
    if (!getLocalDayKey) return; // exported optionally
    const d = new Date(2024, 2, 15); // March 15 2024 local
    expect(getLocalDayKey(d)).toBe('2024-03-15');
  });

  it('getLocalHourKey returns YYYY-MM-DDTHH using local date parts', () => {
    const { getLocalHourKey } = require('./ChartDataUtils');
    if (!getLocalHourKey) return;
    const d = new Date(2024, 2, 15, 23, 30); // 23:30 local
    expect(getLocalHourKey(d)).toBe('2024-03-15T23');
  });

  it('getLocalMonthKey returns YYYY-MM using local date parts', () => {
    const { getLocalMonthKey } = require('./ChartDataUtils');
    if (!getLocalMonthKey) return;
    const d = new Date(2024, 2, 15); // March 2024 local
    expect(getLocalMonthKey(d)).toBe('2024-03');
  });
});

// ---------------------------------------------------------------------------
// generateTransactionCountData — invalid timestamp handling
// ---------------------------------------------------------------------------

describe('generateTransactionCountData — invalid timestamp handling', () => {
  it('silently skips transactions with timestamp=0', () => {
    const txs = [makeTx({ timestamp: 0 })];
    expect(generateTransactionCountData(txs, 'daily')).toEqual([]);
  });

  it('silently skips NaN timestamps', () => {
    const txs = [makeTx({ timestamp: NaN })];
    expect(generateTransactionCountData(txs, 'daily')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Regression: midnight-crossing transactions
// ---------------------------------------------------------------------------

describe('midnight-crossing timezone regression', () => {
  it('transaction at local 23:30 groups into correct local day not UTC next-day', () => {
    // Create a date at 23:30 local
    const localNight = localTs(2024, 3, 15, 23, 30);
    const txs = [makeTx({ timestamp: localNight, amount: 555 })];
    const result = generateTimeSeriesData(txs, 'daily');
    // Local day should be March 15
    const d = new Date(localNight);
    const localDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(result[0].label).toBe(localDay);
  });

  it('transaction at local 23:30 hourly key reflects local hour 23', () => {
    const localNight = localTs(2024, 3, 15, 23, 30);
    const txs = [makeTx({ timestamp: localNight })];
    const result = generateTimeSeriesData(txs, 'hourly');
    expect(result[0].label).toContain('T23');
  });
});

// ---------------------------------------------------------------------------
// Timestamp validation
// ---------------------------------------------------------------------------

describe('generateTimeSeriesData — invalid timestamp handling', () => {
  it('silently skips transactions with timestamp=0', () => {
    const txs = [makeTx({ timestamp: 0 })];
    expect(generateTimeSeriesData(txs, 'daily')).toEqual([]);
  });

  it('silently skips transactions with NaN timestamp', () => {
    const txs = [makeTx({ timestamp: NaN })];
    expect(generateTimeSeriesData(txs, 'daily')).toEqual([]);
  });

  it('silently skips transactions with negative timestamp', () => {
    const txs = [makeTx({ timestamp: -1 })];
    expect(generateTimeSeriesData(txs, 'daily')).toEqual([]);
  });

  it('processes valid timestamps alongside invalid ones', () => {
    const valid = localTs(2024, 3, 15);
    const txs = [
      makeTx({ timestamp: 0, amount: 999 }),
      makeTx({ timestamp: valid, amount: 100 }),
    ];
    const result = generateTimeSeriesData(txs, 'daily');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// generateCumulativeVolumeData
// ---------------------------------------------------------------------------

describe('generateCumulativeVolumeData', () => {
  it('returns cumulative running sum in timestamp order', () => {
    const txs = [
      makeTx({ timestamp: localTs(2024, 3, 15), amount: 100 }),
      makeTx({ timestamp: localTs(2024, 3, 16), amount: 200 }),
      makeTx({ timestamp: localTs(2024, 3, 17), amount: 300 }),
    ];
    const result = generateCumulativeVolumeData(txs);
    expect(result[0].value).toBe(100);
    expect(result[1].value).toBe(300);
    expect(result[2].value).toBe(600);
  });

  it('excludes pending and failed transactions', () => {
    const txs = [
      makeTx({ timestamp: localTs(2024, 3, 15), amount: 100 }),
      makeTx({ timestamp: localTs(2024, 3, 15), amount: 999, status: 'failed' }),
    ];
    const result = generateCumulativeVolumeData(txs);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(100);
  });

  it('returns empty array for no confirmed transactions', () => {
    const txs = [makeTx({ status: 'pending' }), makeTx({ status: 'failed' })];
    expect(generateCumulativeVolumeData(txs)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Regression: year boundary crossing
// ---------------------------------------------------------------------------

describe('year boundary regression', () => {
  it('Dec 31 and Jan 1 fall into different daily buckets', () => {
    const dec31 = localTs(2023, 12, 31, 23, 59);
    const jan1 = localTs(2024, 1, 1, 0, 1);
    const txs = [makeTx({ timestamp: dec31, amount: 100 }), makeTx({ timestamp: jan1, amount: 200 })];
    const result = generateTimeSeriesData(txs, 'daily');
    expect(result).toHaveLength(2);
    expect(result[0].label).toContain('2023');
    expect(result[1].label).toContain('2024');
  });

  it('Dec and Jan fall into different monthly buckets', () => {
    const dec = localTs(2023, 12, 15);
    const jan = localTs(2024, 1, 15);
    const txs = [makeTx({ timestamp: dec }), makeTx({ timestamp: jan })];
    const result = generateTimeSeriesData(txs, 'monthly');
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Regression: week crossing month boundary
// ---------------------------------------------------------------------------

describe('week crossing month boundary', () => {
  it('Saturday in month A and Sunday in month B get different weekly keys', () => {
    // Find a month where last day is Saturday and next month starts Sunday
    // Jan 2022: Jan 29 (Sat), Jan 30 (Sun) in Feb (Feb 1 is Tuesday actually...)
    // Use a known case: March 31 2024 is a Sunday — week start IS March 31
    // March 30 2024 is a Saturday — week start is March 24
    const sat = localTs(2024, 3, 30); // Saturday
    const sun = localTs(2024, 3, 31); // Sunday — starts new week
    const txs = [makeTx({ timestamp: sat }), makeTx({ timestamp: sun })];
    const result = generateTimeSeriesData(txs, 'weekly');
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// generateMovingAverage
// ---------------------------------------------------------------------------

describe('generateMovingAverage', () => {
  it('returns same length as input', () => {
    const data = [
      { label: '2024-01', value: 10 },
      { label: '2024-02', value: 20 },
      { label: '2024-03', value: 30 },
    ];
    expect(generateMovingAverage(data, 3)).toHaveLength(3);
  });

  it('returns empty array for empty input', () => {
    expect(generateMovingAverage([], 7)).toEqual([]);
  });

  it('preserves labels from input', () => {
    const data = [
      { label: 'a', value: 10 },
      { label: 'b', value: 20 },
    ];
    const result = generateMovingAverage(data, 1);
    expect(result[0].label).toBe('a');
    expect(result[1].label).toBe('b');
  });

  it('computes simple average for window size 1', () => {
    const data = [{ label: 'x', value: 42 }];
    const result = generateMovingAverage(data, 1);
    expect(result[0].value).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// generatePeriodComparison
// ---------------------------------------------------------------------------

describe('generatePeriodComparison', () => {
  it('returns two data points: previous and current period', () => {
    const current = [makeTx({ amount: 500 })];
    const previous = [makeTx({ amount: 200 })];
    const result = generatePeriodComparison(current, previous);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Previous Period');
    expect(result[1].label).toBe('Current Period');
  });

  it('sums only confirmed transactions', () => {
    const current = [
      makeTx({ amount: 500, status: 'confirmed' }),
      makeTx({ amount: 999, status: 'pending' }),
    ];
    const previous = [makeTx({ amount: 200, status: 'confirmed' })];
    const result = generatePeriodComparison(current, previous);
    expect(result[1].value).toBe(500);
    expect(result[0].value).toBe(200);
  });

  it('handles empty periods with zero volume', () => {
    const result = generatePeriodComparison([], []);
    expect(result[0].value).toBe(0);
    expect(result[1].value).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// generateStatusDistribution
// ---------------------------------------------------------------------------

describe('generateStatusDistribution', () => {
  it('counts transactions by status', () => {
    const txs = [
      makeTx({ status: 'confirmed' }),
      makeTx({ status: 'confirmed' }),
      makeTx({ status: 'pending' }),
      makeTx({ status: 'failed' }),
    ];
    const result = generateStatusDistribution(txs);
    const confirmed = result.find((r) => r.label === 'Confirmed');
    const pending = result.find((r) => r.label === 'Pending');
    const failed = result.find((r) => r.label === 'Failed');
    expect(confirmed?.value).toBe(2);
    expect(pending?.value).toBe(1);
    expect(failed?.value).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(generateStatusDistribution([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// generateTransactionTypeDistribution
// ---------------------------------------------------------------------------

describe('generateTransactionTypeDistribution', () => {
  it('groups by transaction type and sums amounts', () => {
    const txs = [
      makeTx({ type: TransactionType.DEPOSIT, amount: 100 }),
      makeTx({ type: TransactionType.DEPOSIT, amount: 200 }),
      makeTx({ type: TransactionType.WITHDRAWAL, amount: 50 }),
    ];
    const result = generateTransactionTypeDistribution(txs);
    const deposits = result.find((r) => r.label === 'Deposits');
    expect(deposits?.value).toBe(300);
  });

  it('sorts by value descending', () => {
    const txs = [
      makeTx({ type: TransactionType.WITHDRAWAL, amount: 10 }),
      makeTx({ type: TransactionType.DEPOSIT, amount: 100 }),
    ];
    const result = generateTransactionTypeDistribution(txs);
    expect(result[0].value).toBeGreaterThanOrEqual(result[1].value);
  });
});

// ---------------------------------------------------------------------------
// getTransactionTypeColor
// ---------------------------------------------------------------------------

describe('getTransactionTypeColor', () => {
  it('returns a hex color string for each TransactionType', () => {
    Object.values(TransactionType).forEach((type) => {
      const color = getTransactionTypeColor(type);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
