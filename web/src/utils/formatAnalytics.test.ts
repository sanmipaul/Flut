import { formatStxAmount, formatMicroStxAmount, formatBlockDuration, formatPct, formatVaultCount } from './formatAnalytics';

describe('formatStxAmount', () => {
  it('returns "0 STX" for 0', () => {
    expect(formatStxAmount(0)).toBe('0 STX');
  });

  it('includes STX suffix', () => {
    expect(formatStxAmount(1000)).toContain('STX');
  });

  it('formats whole numbers without unnecessary decimals', () => {
    const result = formatStxAmount(1000);
    expect(result).toContain('1');
  });

  it('returns "0 STX" for non-finite values', () => {
    expect(formatStxAmount(Infinity)).toBe('0 STX');
    expect(formatStxAmount(NaN)).toBe('0 STX');
  });

  it('delegates to formatStx — result ends with " STX"', () => {
    expect(formatStxAmount(500)).toMatch(/ STX$/);
  });

  it('formats negative values via formatStx', () => {
    const result = formatStxAmount(-100);
    expect(result).toContain('STX');
  });
});

describe('formatBlockDuration', () => {
  it('returns "—" for 0 blocks', () => {
    expect(formatBlockDuration(0)).toBe('—');
  });

  it('returns "—" for negative blocks', () => {
    expect(formatBlockDuration(-5)).toBe('—');
  });

  it('returns minutes for < 6 blocks', () => {
    expect(formatBlockDuration(3)).toContain('min');
  });

  it('returns hours for 6–143 blocks', () => {
    expect(formatBlockDuration(12)).toContain('hr');
  });

  it('returns days for 144+ blocks', () => {
    expect(formatBlockDuration(144)).toContain('day');
  });

  it('pluralises days for 2+ days', () => {
    expect(formatBlockDuration(288)).toContain('days');
  });

  it('does not pluralise for exactly 1 day', () => {
    expect(formatBlockDuration(144)).toBe('~1 day');
  });

  it('starts with ~ prefix', () => {
    expect(formatBlockDuration(10)).toMatch(/^~/);
  });
});

describe('formatPct', () => {
  it('appends % sign', () => {
    expect(formatPct(50)).toBe('50%');
  });

  it('works for 0%', () => {
    expect(formatPct(0)).toBe('0%');
  });

  it('works for 100%', () => {
    expect(formatPct(100)).toBe('100%');
  });

  it('works for decimal percentages', () => {
    expect(formatPct(33.3)).toBe('33.3%');
  });
});

describe('formatVaultCount', () => {
  it('uses singular "vault" for 1', () => {
    expect(formatVaultCount(1)).toBe('1 vault');
  });

  it('uses plural "vaults" for 0', () => {
    expect(formatVaultCount(0)).toBe('0 vaults');
  });

  it('uses plural "vaults" for 2+', () => {
    expect(formatVaultCount(5)).toBe('5 vaults');
  });

  it('uses plural "vaults" for large counts', () => {
    expect(formatVaultCount(100)).toBe('100 vaults');
  });
});

describe('formatBlockDuration — boundary values', () => {
  it('exactly 6 blocks returns hours', () => {
    expect(formatBlockDuration(6)).toContain('hr');
  });

  it('5 blocks (just under 1 hr) returns minutes', () => {
    expect(formatBlockDuration(5)).toContain('min');
  });

  it('exactly 144 blocks returns "~1 day"', () => {
    expect(formatBlockDuration(144)).toBe('~1 day');
  });

  it('143 blocks (just under 1 day) returns hours', () => {
    expect(formatBlockDuration(143)).toContain('hr');
  });

  it('1 block returns minutes', () => {
    expect(formatBlockDuration(1)).toContain('min');
  });
});

describe('formatStxAmount — large values', () => {
  it('formats large amounts without crashing', () => {
    expect(() => formatStxAmount(1_000_000)).not.toThrow();
  });

  it('contains "STX" suffix for large amount', () => {
    expect(formatStxAmount(1_000_000)).toContain('STX');
  });
});

describe('formatMicroStxAmount', () => {
  it('returns "0 STX" for 0', () => {
    expect(formatMicroStxAmount(0)).toBe('0 STX');
  });

  it('converts 1_000_000 uSTX to 1 STX', () => {
    expect(formatMicroStxAmount(1_000_000)).toContain('1');
    expect(formatMicroStxAmount(1_000_000)).toContain('STX');
  });

  it('returns "0 STX" for NaN', () => {
    expect(formatMicroStxAmount(NaN)).toBe('0 STX');
  });

  it('returns "0 STX" for Infinity', () => {
    expect(formatMicroStxAmount(Infinity)).toBe('0 STX');
  });

  it('result ends with " STX"', () => {
    expect(formatMicroStxAmount(1_500_000)).toMatch(/ STX$/);
  });
});
