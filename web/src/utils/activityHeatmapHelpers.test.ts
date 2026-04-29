/**
 * activityHeatmapHelpers tests
 */
import {
  heatmapSlotKey,
  parseSlotKey,
  slotsToHeatmapData,
  isValidHeatmapTimestamp,
  MAX_HEATMAP_SLOTS,
  normalizeHeatmapValues,
  sortHeatmapData,
} from './activityHeatmapHelpers';

// ---------------------------------------------------------------------------
// Total unique slots produced for a full week
// ---------------------------------------------------------------------------

describe('full week coverage', () => {
  it('a week of transactions produces at most MAX_HEATMAP_SLOTS distinct keys', () => {
    const keys = new Set<string>();
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const d = new Date(2024, 2, 10 + day, hour);
        keys.add(heatmapSlotKey(d));
      }
    }
    expect(keys.size).toBe(MAX_HEATMAP_SLOTS);
  });
});

// ---------------------------------------------------------------------------
// heatmapSlotKey
// ---------------------------------------------------------------------------

describe('heatmapSlotKey', () => {
  it('returns "{dayOfWeek}-{hour}" for a given date', () => {
    // March 11 2024 is a Monday (day=1), at 14:00
    const d = new Date(2024, 2, 11, 14, 30);
    expect(heatmapSlotKey(d)).toBe('1-14');
  });

  it('uses local day-of-week, not UTC', () => {
    const d = new Date(2024, 2, 11, 23, 30); // local 23:30 Monday
    const expected = `${d.getDay()}-${d.getHours()}`;
    expect(heatmapSlotKey(d)).toBe(expected);
  });

  it('handles Sunday (day=0)', () => {
    const d = new Date(2024, 2, 10, 10); // Sunday March 10 2024
    expect(heatmapSlotKey(d)).toBe('0-10');
  });

  it('handles Saturday (day=6)', () => {
    const d = new Date(2024, 2, 16, 22); // Saturday March 16 2024
    expect(heatmapSlotKey(d)).toBe('6-22');
  });

  it('handles midnight (hour=0)', () => {
    const d = new Date(2024, 2, 11, 0, 0);
    expect(heatmapSlotKey(d)).toBe('1-0');
  });

  it('handles 23:00', () => {
    const d = new Date(2024, 2, 11, 23, 0);
    expect(heatmapSlotKey(d)).toBe('1-23');
  });
});

// ---------------------------------------------------------------------------
// parseSlotKey
// ---------------------------------------------------------------------------

describe('parseSlotKey', () => {
  it('parses "1-14" into row=1, col=14', () => {
    expect(parseSlotKey('1-14')).toEqual({ row: 1, col: 14 });
  });

  it('parses "0-0" into row=0, col=0', () => {
    expect(parseSlotKey('0-0')).toEqual({ row: 0, col: 0 });
  });

  it('parses "6-23" into row=6, col=23', () => {
    expect(parseSlotKey('6-23')).toEqual({ row: 6, col: 23 });
  });

  it('is the inverse of heatmapSlotKey', () => {
    const d = new Date(2024, 2, 11, 14);
    const key = heatmapSlotKey(d);
    const parsed = parseSlotKey(key);
    expect(parsed.row).toBe(d.getDay());
    expect(parsed.col).toBe(d.getHours());
  });
});

// ---------------------------------------------------------------------------
// slotsToHeatmapData
// ---------------------------------------------------------------------------

describe('slotsToHeatmapData', () => {
  it('converts a Map to HeatmapData array', () => {
    const slots = new Map<string, number>([['1-14', 3], ['2-9', 1]]);
    const result = slotsToHeatmapData(slots);
    expect(result).toHaveLength(2);
    const slot1 = result.find((r) => r.label === '1-14')!;
    expect(slot1.row).toBe(1);
    expect(slot1.col).toBe(14);
    expect(slot1.value).toBe(3);
  });

  it('returns empty array for empty Map', () => {
    expect(slotsToHeatmapData(new Map())).toEqual([]);
  });

  it('each item has label, value, row, col properties', () => {
    const slots = new Map<string, number>([['3-8', 5]]);
    const [item] = slotsToHeatmapData(slots);
    expect(item).toHaveProperty('label');
    expect(item).toHaveProperty('value');
    expect(item).toHaveProperty('row');
    expect(item).toHaveProperty('col');
  });
});

// ---------------------------------------------------------------------------
// MAX_HEATMAP_SLOTS
// ---------------------------------------------------------------------------

describe('MAX_HEATMAP_SLOTS', () => {
  it('equals 168 (7 days × 24 hours)', () => {
    expect(MAX_HEATMAP_SLOTS).toBe(168);
  });
});

// ---------------------------------------------------------------------------
// normalizeHeatmapValues
// ---------------------------------------------------------------------------

describe('normalizeHeatmapValues', () => {
  it('scales the max value to 1', () => {
    const data = [
      { label: '1-9', value: 10, row: 1, col: 9 },
      { label: '2-9', value: 5, row: 2, col: 9 },
    ];
    const result = normalizeHeatmapValues(data);
    expect(result[0].value).toBe(1);
    expect(result[1].value).toBeCloseTo(0.5);
  });

  it('returns empty array unchanged', () => {
    expect(normalizeHeatmapValues([])).toEqual([]);
  });

  it('returns array unchanged when max is 0', () => {
    const data = [{ label: '1-9', value: 0, row: 1, col: 9 }];
    const result = normalizeHeatmapValues(data);
    expect(result[0].value).toBe(0);
  });

  it('does not mutate the original array', () => {
    const data = [{ label: '1-9', value: 10, row: 1, col: 9 }];
    const original = data[0].value;
    normalizeHeatmapValues(data);
    expect(data[0].value).toBe(original);
  });

  it('all values in result are in range [0, 1]', () => {
    const data = [
      { label: '0-0', value: 3, row: 0, col: 0 },
      { label: '1-9', value: 7, row: 1, col: 9 },
      { label: '6-23', value: 15, row: 6, col: 23 },
    ];
    const result = normalizeHeatmapValues(data);
    result.forEach((item) => {
      expect(item.value).toBeGreaterThanOrEqual(0);
      expect(item.value).toBeLessThanOrEqual(1);
    });
  });
});

// ---------------------------------------------------------------------------
// isValidHeatmapTimestamp
// ---------------------------------------------------------------------------

describe('isValidHeatmapTimestamp', () => {
  it('accepts a normal recent timestamp', () => {
    expect(isValidHeatmapTimestamp(Date.now())).toBe(true);
  });

  it('rejects 0', () => {
    expect(isValidHeatmapTimestamp(0)).toBe(false);
  });

  it('rejects negative values', () => {
    expect(isValidHeatmapTimestamp(-1000)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidHeatmapTimestamp(NaN)).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(isValidHeatmapTimestamp(Infinity)).toBe(false);
  });

  it('rejects -Infinity', () => {
    expect(isValidHeatmapTimestamp(-Infinity)).toBe(false);
  });

  it('accepts a timestamp for year 2010', () => {
    expect(isValidHeatmapTimestamp(new Date(2010, 0, 1).getTime())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sortHeatmapData
// ---------------------------------------------------------------------------

describe('sortHeatmapData', () => {
  it('sorts by row ascending, then col ascending', () => {
    const data = [
      { label: '3-5', value: 1, row: 3, col: 5 },
      { label: '1-9', value: 2, row: 1, col: 9 },
      { label: '1-3', value: 3, row: 1, col: 3 },
    ];
    const result = sortHeatmapData(data);
    expect(result[0]).toMatchObject({ row: 1, col: 3 });
    expect(result[1]).toMatchObject({ row: 1, col: 9 });
    expect(result[2]).toMatchObject({ row: 3, col: 5 });
  });

  it('returns empty array for empty input', () => {
    expect(sortHeatmapData([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const data = [
      { label: '3-5', value: 1, row: 3, col: 5 },
      { label: '1-9', value: 2, row: 1, col: 9 },
    ];
    const original = [...data];
    sortHeatmapData(data);
    expect(data[0]).toEqual(original[0]);
  });

  it('handles single-item array', () => {
    const data = [{ label: '2-10', value: 5, row: 2, col: 10 }];
    expect(sortHeatmapData(data)).toHaveLength(1);
  });
});
