import { formatStxAmount, formatBlockDuration, formatPct, formatVaultCount } from './formatAnalytics';

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
