/**
 * dateKeyUtils tests
 * Verifies that all date key helpers return correct local-timezone values.
 */
import {
  padDatePart,
  getLocalHourKey,
  getLocalDayKey,
  getLocalWeekStartKey,
  getLocalMonthKey,
  getLocalYearKey,
  getIntervalKey,
  isValidTimestamp,
  toLocalISODate,
  toLocalISOMonth,
} from './dateKeyUtils';

// ---------------------------------------------------------------------------
// padDatePart
// ---------------------------------------------------------------------------

describe('padDatePart', () => {
  it('pads single-digit numbers with a leading zero', () => {
    expect(padDatePart(1)).toBe('01');
    expect(padDatePart(9)).toBe('09');
  });

  it('does not pad two-digit numbers', () => {
    expect(padDatePart(10)).toBe('10');
    expect(padDatePart(99)).toBe('99');
  });

  it('handles zero', () => {
    expect(padDatePart(0)).toBe('00');
  });
});

// ---------------------------------------------------------------------------
// getLocalHourKey
// ---------------------------------------------------------------------------

describe('getLocalHourKey', () => {
  it('returns YYYY-MM-DDTHH using local date parts', () => {
    const d = new Date(2024, 2, 15, 23, 45); // March 15 2024, 23:45 local
    const key = getLocalHourKey(d);
    expect(key).toBe('2024-03-15T23');
  });

  it('zero-pads month and day', () => {
    const d = new Date(2024, 0, 5, 8); // Jan 5, 08:00 local
    expect(getLocalHourKey(d)).toBe('2024-01-05T08');
  });

  it('does not contain Z suffix', () => {
    const d = new Date(2024, 2, 15, 23, 45);
    expect(getLocalHourKey(d)).not.toContain('Z');
  });

  it('key sorts correctly for consecutive hours', () => {
    const h10 = getLocalHourKey(new Date(2024, 2, 15, 10));
    const h11 = getLocalHourKey(new Date(2024, 2, 15, 11));
    expect(h10.localeCompare(h11)).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// getLocalDayKey
// ---------------------------------------------------------------------------

describe('getLocalDayKey', () => {
  it('returns YYYY-MM-DD using local date parts', () => {
    const d = new Date(2024, 2, 15); // March 15 2024 local
    expect(getLocalDayKey(d)).toBe('2024-03-15');
  });

  it('zero-pads single-digit months and days', () => {
    const d = new Date(2024, 0, 7); // Jan 7 local
    expect(getLocalDayKey(d)).toBe('2024-01-07');
  });

  it('does not contain T or Z', () => {
    const d = new Date(2024, 2, 15);
    expect(getLocalDayKey(d)).not.toContain('T');
    expect(getLocalDayKey(d)).not.toContain('Z');
  });

  it('keys sort correctly across dates', () => {
    const d1 = getLocalDayKey(new Date(2024, 2, 14));
    const d2 = getLocalDayKey(new Date(2024, 2, 15));
    expect(d1.localeCompare(d2)).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// getLocalWeekStartKey
// ---------------------------------------------------------------------------

describe('getLocalWeekStartKey', () => {
  it('returns the Sunday of the week containing the date', () => {
    // March 15 2024 is a Friday; Sunday of that week is March 10
    const d = new Date(2024, 2, 15); // Friday March 15
    const key = getLocalWeekStartKey(d);
    // week start should be Sunday March 10
    const sun = new Date(2024, 2, 10);
    expect(key).toBe(getLocalDayKey(sun));
  });

  it('returns the same key for all days in the same week', () => {
    const sunday = getLocalWeekStartKey(new Date(2024, 2, 10));
    const monday = getLocalWeekStartKey(new Date(2024, 2, 11));
    const saturday = getLocalWeekStartKey(new Date(2024, 2, 16));
    expect(sunday).toBe(monday);
    expect(monday).toBe(saturday);
  });

  it('returns different keys for adjacent weeks', () => {
    const week1 = getLocalWeekStartKey(new Date(2024, 2, 10));
    const week2 = getLocalWeekStartKey(new Date(2024, 2, 17));
    expect(week1).not.toBe(week2);
  });
});

// ---------------------------------------------------------------------------
// getLocalMonthKey
// ---------------------------------------------------------------------------

describe('getLocalMonthKey', () => {
  it('returns YYYY-MM using local date parts', () => {
    const d = new Date(2024, 2, 15); // March 2024 local
    expect(getLocalMonthKey(d)).toBe('2024-03');
  });

  it('zero-pads single-digit months', () => {
    const d = new Date(2024, 0, 15); // January local
    expect(getLocalMonthKey(d)).toBe('2024-01');
  });

  it('keys sort correctly across months', () => {
    const jan = getLocalMonthKey(new Date(2024, 0, 1));
    const feb = getLocalMonthKey(new Date(2024, 1, 1));
    expect(jan.localeCompare(feb)).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// getLocalYearKey
// ---------------------------------------------------------------------------

describe('getLocalYearKey', () => {
  it('returns the local 4-digit year as string', () => {
    const d = new Date(2024, 6, 4);
    expect(getLocalYearKey(d)).toBe('2024');
  });
});

// ---------------------------------------------------------------------------
// getIntervalKey dispatch
// ---------------------------------------------------------------------------

describe('getIntervalKey', () => {
  const d = new Date(2024, 2, 15, 14, 30); // March 15 2024 14:30 local

  it('returns hourly key for "hourly"', () => {
    expect(getIntervalKey(d, 'hourly')).toBe(getLocalHourKey(d));
  });

  it('returns daily key for "daily"', () => {
    expect(getIntervalKey(d, 'daily')).toBe(getLocalDayKey(d));
  });

  it('returns weekly key for "weekly"', () => {
    expect(getIntervalKey(d, 'weekly')).toBe(getLocalWeekStartKey(d));
  });

  it('returns monthly key for "monthly"', () => {
    expect(getIntervalKey(d, 'monthly')).toBe(getLocalMonthKey(d));
  });
});

// ---------------------------------------------------------------------------
// isValidTimestamp
// ---------------------------------------------------------------------------

describe('isValidTimestamp', () => {
  it('accepts a normal recent timestamp', () => {
    expect(isValidTimestamp(Date.now())).toBe(true);
  });

  it('accepts a timestamp for year 2024', () => {
    expect(isValidTimestamp(new Date(2024, 0, 1).getTime())).toBe(true);
  });

  it('rejects zero', () => {
    expect(isValidTimestamp(0)).toBe(false);
  });

  it('rejects negative values', () => {
    expect(isValidTimestamp(-1000)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidTimestamp(NaN)).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(isValidTimestamp(Infinity)).toBe(false);
  });

  it('rejects a timestamp before year 2000', () => {
    expect(isValidTimestamp(new Date(1999, 0, 1).getTime())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toLocalISODate
// ---------------------------------------------------------------------------

describe('toLocalISODate', () => {
  it('returns YYYY-MM-DD from a timestamp using local date', () => {
    const ts = new Date(2024, 2, 15).getTime();
    expect(toLocalISODate(ts)).toBe('2024-03-15');
  });

  it('result matches getLocalDayKey for the same date', () => {
    const d = new Date(2024, 5, 20);
    expect(toLocalISODate(d.getTime())).toBe(getLocalDayKey(d));
  });
});

// ---------------------------------------------------------------------------
// Sortability guarantees
// ---------------------------------------------------------------------------

describe('all key types sort correctly lexicographically', () => {
  const dates = [
    new Date(2024, 0, 1, 0),
    new Date(2024, 5, 15, 12),
    new Date(2024, 11, 31, 23),
  ];

  it('hourly keys sort in date order', () => {
    const keys = dates.map(getLocalHourKey);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it('daily keys sort in date order', () => {
    const keys = dates.map(getLocalDayKey);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it('monthly keys sort in date order', () => {
    const keys = dates.map(getLocalMonthKey);
    const sorted = [...keys].sort();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].localeCompare(sorted[i])).toBeLessThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// toLocalISOMonth
// ---------------------------------------------------------------------------

describe('toLocalISOMonth', () => {
  it('returns YYYY-MM from a timestamp using local date', () => {
    const ts = new Date(2024, 2, 15).getTime();
    expect(toLocalISOMonth(ts)).toBe('2024-03');
  });

  it('result matches getLocalMonthKey for the same date', () => {
    const d = new Date(2024, 5, 20);
    expect(toLocalISOMonth(d.getTime())).toBe(getLocalMonthKey(d));
  });
});
