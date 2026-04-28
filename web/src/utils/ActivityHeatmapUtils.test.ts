/**
 * ActivityHeatmapUtils tests
 *
 * Verifies that generateActivityHeatmap only counts confirmed transactions
 * and that related heatmap helpers behave correctly.
 */
import {
  generateActivityHeatmap,
  generateWeightedActivityHeatmap,
} from './ChartDataUtils';
import { VaultTransaction, TransactionType } from '../types/TransactionHistory';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTx(overrides: Partial<VaultTransaction> = {}): VaultTransaction {
  return {
    id: 'tx-1',
    vaultId: 'vault-1',
    type: TransactionType.DEPOSIT,
    amount: 1000,
    timestamp: new Date(2024, 2, 11, 14, 0, 0).getTime(), // Monday 14:00 local
    blockHeight: 100,
    txId: '0xabc',
    status: 'confirmed',
    description: 'Test',
    initiatedBy: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Status filtering — the core bug
// ---------------------------------------------------------------------------

describe('generateActivityHeatmap — status filtering', () => {
  it('only counts confirmed transactions', () => {
    const ts = new Date(2024, 2, 11, 14).getTime();
    const txs = [
      makeTx({ timestamp: ts, status: 'confirmed' }),
      makeTx({ timestamp: ts, status: 'confirmed' }),
      makeTx({ timestamp: ts, status: 'pending' }),
      makeTx({ timestamp: ts, status: 'failed' }),
    ];
    const result = generateActivityHeatmap(txs);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2);
  });

  it('excludes pending transactions from the count', () => {
    const ts = new Date(2024, 2, 11, 10).getTime();
    const txs = [makeTx({ timestamp: ts, status: 'pending' })];
    const result = generateActivityHeatmap(txs);
    expect(result).toHaveLength(0);
  });

  it('excludes failed transactions from the count', () => {
    const ts = new Date(2024, 2, 11, 10).getTime();
    const txs = [makeTx({ timestamp: ts, status: 'failed' })];
    const result = generateActivityHeatmap(txs);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when all transactions are unconfirmed', () => {
    const ts = new Date(2024, 2, 11, 10).getTime();
    const txs = [
      makeTx({ timestamp: ts, status: 'pending' }),
      makeTx({ timestamp: ts, status: 'failed' }),
    ];
    expect(generateActivityHeatmap(txs)).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(generateActivityHeatmap([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Heatmap structure
// ---------------------------------------------------------------------------

describe('generateActivityHeatmap — structure', () => {
  it('row equals the day-of-week for local time (0=Sun, 6=Sat)', () => {
    // March 11 2024 is a Monday (day=1)
    const ts = new Date(2024, 2, 11, 14).getTime();
    const d = new Date(ts);
    const result = generateActivityHeatmap([makeTx({ timestamp: ts })]);
    expect(result[0].row).toBe(d.getDay());
  });

  it('col equals the local hour (0-23)', () => {
    const ts = new Date(2024, 2, 11, 21).getTime();
    const d = new Date(ts);
    const result = generateActivityHeatmap([makeTx({ timestamp: ts })]);
    expect(result[0].col).toBe(d.getHours());
  });

  it('accumulates multiple transactions into the same slot', () => {
    const ts1 = new Date(2024, 2, 11, 9).getTime(); // Mon 09:xx
    const ts2 = new Date(2024, 2, 18, 9).getTime(); // Mon 09:xx (next week, same slot)
    const txs = [makeTx({ timestamp: ts1 }), makeTx({ timestamp: ts2 })];
    const result = generateActivityHeatmap(txs);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(2);
  });

  it('produces separate slots for different hours on the same day', () => {
    const t1 = new Date(2024, 2, 11, 9).getTime();
    const t2 = new Date(2024, 2, 11, 10).getTime();
    const txs = [makeTx({ timestamp: t1 }), makeTx({ timestamp: t2 })];
    const result = generateActivityHeatmap(txs);
    expect(result).toHaveLength(2);
  });

  it('produces separate slots for different days at the same hour', () => {
    const t1 = new Date(2024, 2, 11, 9).getTime(); // Monday
    const t2 = new Date(2024, 2, 12, 9).getTime(); // Tuesday
    const txs = [makeTx({ timestamp: t1 }), makeTx({ timestamp: t2 })];
    const result = generateActivityHeatmap(txs);
    expect(result).toHaveLength(2);
  });

  it('row values are in range 0-6', () => {
    const timestamps = Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 2, 10 + i, 12).getTime() // Sunday through Saturday
    );
    const txs = timestamps.map((timestamp) => makeTx({ timestamp }));
    const result = generateActivityHeatmap(txs);
    result.forEach((item) => {
      expect(item.row).toBeGreaterThanOrEqual(0);
      expect(item.row).toBeLessThanOrEqual(6);
    });
  });

  it('col values are in range 0-23', () => {
    const timestamps = Array.from({ length: 24 }, (_, i) =>
      new Date(2024, 2, 11, i).getTime()
    );
    const txs = timestamps.map((timestamp) => makeTx({ timestamp }));
    const result = generateActivityHeatmap(txs);
    result.forEach((item) => {
      expect(item.col).toBeGreaterThanOrEqual(0);
      expect(item.col).toBeLessThanOrEqual(23);
    });
  });
});

// ---------------------------------------------------------------------------
// All 7 days covered
// ---------------------------------------------------------------------------

describe('generateActivityHeatmap — full week coverage', () => {
  it('returns 7 distinct row values for transactions spread across a full week', () => {
    const timestamps = Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 2, 10 + i, 12).getTime()
    );
    const txs = timestamps.map((t) => makeTx({ timestamp: t }));
    const result = generateActivityHeatmap(txs);
    const rows = new Set(result.map((r) => r.row));
    expect(rows.size).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// generateWeightedActivityHeatmap
// ---------------------------------------------------------------------------

describe('generateWeightedActivityHeatmap', () => {
  it('sums amounts for confirmed transactions in same slot', () => {
    const ts = new Date(2024, 2, 11, 14).getTime();
    const txs = [
      makeTx({ timestamp: ts, amount: 500, status: 'confirmed' }),
      makeTx({ timestamp: ts, amount: 300, status: 'confirmed' }),
    ];
    const result = generateWeightedActivityHeatmap(txs);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(800);
  });

  it('excludes pending transactions from weighted count', () => {
    const ts = new Date(2024, 2, 11, 14).getTime();
    const txs = [
      makeTx({ timestamp: ts, amount: 500, status: 'pending' }),
    ];
    const result = generateWeightedActivityHeatmap(txs);
    expect(result).toHaveLength(0);
  });

  it('excludes failed transactions from weighted count', () => {
    const ts = new Date(2024, 2, 11, 14).getTime();
    const txs = [makeTx({ timestamp: ts, amount: 999, status: 'failed' })];
    const result = generateWeightedActivityHeatmap(txs);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(generateWeightedActivityHeatmap([])).toHaveLength(0);
  });

  it('row and col are correct for the weighted version', () => {
    const ts = new Date(2024, 2, 11, 9).getTime(); // Monday 09:00
    const d = new Date(ts);
    const result = generateWeightedActivityHeatmap([makeTx({ timestamp: ts })]);
    expect(result[0].row).toBe(d.getDay());
    expect(result[0].col).toBe(d.getHours());
  });

  it('produces different values than count-based heatmap when amounts differ', () => {
    const t1 = new Date(2024, 2, 11, 9).getTime();
    const t2 = new Date(2024, 2, 11, 10).getTime();
    const txs = [
      makeTx({ timestamp: t1, amount: 1000 }),
      makeTx({ timestamp: t2, amount: 1 }),
    ];
    const count = generateActivityHeatmap(txs);
    const weighted = generateWeightedActivityHeatmap(txs);
    expect(count[0].value).toBe(1);
    expect(count[1].value).toBe(1);
    expect(weighted[0].value).not.toBe(weighted[1].value);
  });
});

// ---------------------------------------------------------------------------
// Mixed status regression
// ---------------------------------------------------------------------------

describe('generateActivityHeatmap — mixed status regression', () => {
  it('does not double-count when pending and confirmed share the same slot', () => {
    const ts = new Date(2024, 2, 11, 14).getTime();
    const txs = [
      makeTx({ timestamp: ts, status: 'confirmed' }),
      makeTx({ timestamp: ts, status: 'pending' }),
      makeTx({ timestamp: ts, status: 'failed' }),
    ];
    const result = generateActivityHeatmap(txs);
    // Only the confirmed one should be counted
    expect(result[0].value).toBe(1);
  });

  it('confirmed and pending produce different counts than all-confirmed', () => {
    const ts = new Date(2024, 2, 11, 14).getTime();
    const allConfirmed = [
      makeTx({ timestamp: ts, status: 'confirmed' }),
      makeTx({ timestamp: ts, status: 'confirmed' }),
    ];
    const mixed = [
      makeTx({ timestamp: ts, status: 'confirmed' }),
      makeTx({ timestamp: ts, status: 'pending' }),
    ];
    const resultAll = generateActivityHeatmap(allConfirmed);
    const resultMixed = generateActivityHeatmap(mixed);
    expect(resultAll[0].value).toBe(2);
    expect(resultMixed[0].value).toBe(1);
  });
});
