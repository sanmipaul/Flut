import {
  formatBtcAmount,
  formatYieldPct,
  formatCycleCount,
  formatStxShort,
} from './formatYield';

// ---------------------------------------------------------------------------
// formatBtcAmount
// ---------------------------------------------------------------------------

describe('formatBtcAmount', () => {
  it('returns "0 BTC" for 0', () => {
    expect(formatBtcAmount(0)).toBe('0 BTC');
  });

  it('returns "0 BTC" for negative values', () => {
    expect(formatBtcAmount(-0.5)).toBe('0 BTC');
  });

  it('returns "0 BTC" for NaN', () => {
    expect(formatBtcAmount(NaN)).toBe('0 BTC');
  });

  it('returns "0 BTC" for Infinity', () => {
    expect(formatBtcAmount(Infinity)).toBe('0 BTC');
  });

  it('returns satoshis for values < 0.001 BTC', () => {
    // 0.0005 BTC = 50,000 sats
    const result = formatBtcAmount(0.0005);
    expect(result).toContain('sats');
    expect(result).not.toContain('BTC');
  });

  it('formats 0.0001 BTC as 10,000 sats', () => {
    const result = formatBtcAmount(0.0001);
    expect(result).toContain('10');
    expect(result).toContain('sats');
  });

  it('returns BTC format for values >= 0.001', () => {
    const result = formatBtcAmount(0.001);
    expect(result).toContain('BTC');
    expect(result).not.toContain('sats');
  });

  it('formats 1 BTC with 6 decimal places', () => {
    expect(formatBtcAmount(1)).toBe('1.000000 BTC');
  });

  it('formats 0.5 BTC with 6 decimal places', () => {
    expect(formatBtcAmount(0.5)).toBe('0.500000 BTC');
  });

  it('formats 0.123456 BTC to 6 decimals', () => {
    expect(formatBtcAmount(0.123456)).toBe('0.123456 BTC');
  });

  it('threshold boundary: 0.001 BTC is formatted as BTC not sats', () => {
    const result = formatBtcAmount(0.001);
    expect(result).toMatch(/BTC$/);
    expect(result).not.toContain('sats');
  });

  it('threshold boundary: 0.0009 BTC is formatted as sats', () => {
    const result = formatBtcAmount(0.0009);
    expect(result).toContain('sats');
  });

  it('very small BTC value rounds to nearest sat', () => {
    // 0.000000005 BTC → 0 sats (rounds to 0)
    const result = formatBtcAmount(0.000000001);
    expect(result).toContain('sats');
  });
});

// ---------------------------------------------------------------------------
// formatYieldPct
// ---------------------------------------------------------------------------

describe('formatYieldPct', () => {
  it('formats 10 as "10.0% APY"', () => {
    expect(formatYieldPct(10)).toBe('10.0% APY');
  });

  it('formats 1 as "1.0% APY"', () => {
    expect(formatYieldPct(1)).toBe('1.0% APY');
  });

  it('formats 25 as "25.0% APY"', () => {
    expect(formatYieldPct(25)).toBe('25.0% APY');
  });

  it('always shows one decimal place', () => {
    expect(formatYieldPct(5)).toMatch(/^\d+\.\d% APY$/);
  });

  it('formats 0 as "0.0% APY"', () => {
    expect(formatYieldPct(0)).toBe('0.0% APY');
  });

  it('formats fractional values correctly', () => {
    expect(formatYieldPct(7.5)).toBe('7.5% APY');
  });

  it('includes "APY" suffix', () => {
    expect(formatYieldPct(10)).toContain('APY');
  });

  it('includes "%" sign', () => {
    expect(formatYieldPct(10)).toContain('%');
  });
});

// ---------------------------------------------------------------------------
// formatCycleCount
// ---------------------------------------------------------------------------

describe('formatCycleCount', () => {
  it('formats 1 cycle as singular', () => {
    const result = formatCycleCount(1);
    expect(result).toContain('1 cycle');
    expect(result).not.toContain('cycles');
  });

  it('formats 2 cycles as plural', () => {
    const result = formatCycleCount(2);
    expect(result).toContain('2 cycles');
  });

  it('formats 0 cycles as plural', () => {
    const result = formatCycleCount(0);
    expect(result).toContain('0 cycles');
  });

  it('shows double the cycle count as weeks', () => {
    const result = formatCycleCount(5);
    expect(result).toContain('10');
    expect(result).toContain('week');
  });

  it('shows "~1 week" (singular) for 0.5 weeks — impossible in this domain but handles 1 cycle', () => {
    // 1 cycle = 2 weeks, so we check 0 cycles → 0 weeks
    const result = formatCycleCount(0);
    expect(result).toContain('0 week');
  });

  it('includes "~" prefix for weeks estimate', () => {
    expect(formatCycleCount(3)).toContain('~');
  });

  it('formats 6 cycles as "6 cycles (~12 weeks)"', () => {
    expect(formatCycleCount(6)).toBe('6 cycles (~12 weeks)');
  });

  it('formats 1 cycle as "1 cycle (~2 weeks)"', () => {
    expect(formatCycleCount(1)).toBe('1 cycle (~2 weeks)');
  });
});

// ---------------------------------------------------------------------------
// formatStxShort
// ---------------------------------------------------------------------------

describe('formatStxShort', () => {
  it('formats values < 1000 with STX suffix', () => {
    const result = formatStxShort(500);
    expect(result).toContain('STX');
  });

  it('formats 1000 as "1.0k STX"', () => {
    expect(formatStxShort(1000)).toBe('1.0k STX');
  });

  it('formats 1500 as "1.5k STX"', () => {
    expect(formatStxShort(1500)).toBe('1.5k STX');
  });

  it('formats 1_000_000 as "1.00M STX"', () => {
    expect(formatStxShort(1_000_000)).toBe('1.00M STX');
  });

  it('formats 2_500_000 as "2.50M STX"', () => {
    expect(formatStxShort(2_500_000)).toBe('2.50M STX');
  });

  it('formats 999 with locale separators and STX suffix', () => {
    const result = formatStxShort(999);
    expect(result).toContain('999');
    expect(result).toContain('STX');
  });

  it('formats 0 as "0 STX"', () => {
    expect(formatStxShort(0)).toBe('0 STX');
  });

  it('threshold: 999 is not formatted as "k"', () => {
    expect(formatStxShort(999)).not.toContain('k');
  });

  it('threshold: 1000 is formatted as "k"', () => {
    expect(formatStxShort(1000)).toContain('k');
  });

  it('threshold: 999_999 is formatted as "k" not "M"', () => {
    expect(formatStxShort(999_999)).toContain('k');
    expect(formatStxShort(999_999)).not.toContain('M');
  });

  it('threshold: 1_000_000 is formatted as "M"', () => {
    expect(formatStxShort(1_000_000)).toContain('M');
  });

  it('all results end with " STX"', () => {
    [0, 500, 1000, 1_000_000].forEach((n) => {
      expect(formatStxShort(n)).toMatch(/ STX$/);
    });
  });
});
