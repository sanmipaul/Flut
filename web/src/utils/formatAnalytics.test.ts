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

describe('formatBlockDuration — regression suite', () => {
  it('original positive behaviour still works for 3 blocks', () => {
    expect(formatBlockDuration(3)).toContain('min');
  });

  it('original positive behaviour still works for 12 blocks', () => {
    expect(formatBlockDuration(12)).toContain('hr');
  });

  it('original positive behaviour still works for 144 blocks', () => {
    expect(formatBlockDuration(144)).toBe('~1 day');
  });

  it('original positive behaviour still works for 288 blocks', () => {
    expect(formatBlockDuration(288)).toBe('~2 days');
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

  it('very large block count returns days', () => {
    expect(formatBlockDuration(10_000)).toContain('day');
  });

  it('2 blocks returns ~20 min', () => {
    expect(formatBlockDuration(2)).toContain('20');
    expect(formatBlockDuration(2)).toContain('min');
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

describe('formatBlockDuration — Infinity input', () => {
  it('returns "—" for Infinity', () => {
    expect(formatBlockDuration(Infinity)).toBe('—');
  });

  it('does not produce a string containing "Infinity"', () => {
    expect(formatBlockDuration(Infinity)).not.toContain('Infinity');
  });
});

describe('formatBlockDuration — NaN input', () => {
  it('returns "—" for NaN', () => {
    expect(formatBlockDuration(NaN)).toBe('—');
  });

  it('does not produce a string containing "NaN"', () => {
    expect(formatBlockDuration(NaN)).not.toContain('NaN');
  });
});

describe('formatBlockDuration — -Infinity input', () => {
  it('returns "—" for -Infinity', () => {
    expect(formatBlockDuration(-Infinity)).toBe('—');
  });

  it('does not produce a string containing "-Infinity"', () => {
    expect(formatBlockDuration(-Infinity)).not.toContain('Infinity');
  });
});

describe('formatStxAmount — negative values', () => {
  it('returns "0 STX" for negative integers', () => {
    expect(formatStxAmount(-5)).toBe('0 STX');
  });

  it('returns "0 STX" for large negative amounts', () => {
    expect(formatStxAmount(-1000)).toBe('0 STX');
  });
});
