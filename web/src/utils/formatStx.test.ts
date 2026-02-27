import { describe, it, expect } from 'vitest';
import {
  formatStx,
  formatMicroStx,
  formatStxWhole,
  formatStxPenalty,
  parseStxInput,
} from './formatStx';

// Use 'en-US' locale so tests produce consistent output regardless of CI locale
const locale = 'en-US';

describe('formatStx', () => {
  it('formats a whole number with symbol', () => {
    const result = formatStx(500, { locale });
    expect(result).toBe('500 STX');
  });

  it('formats with 2 decimal places by default', () => {
    const result = formatStx(1.5, { locale });
    expect(result).toContain('1.5');
    expect(result).toContain('STX');
  });

  it('formats large number with locale separator', () => {
    const result = formatStx(1_234_567, { locale });
    expect(result).toContain('1,234,567');
    expect(result).toContain('STX');
  });

  it('hides symbol when showSymbol=false', () => {
    const result = formatStx(100, { showSymbol: false, locale });
    expect(result).not.toContain('STX');
  });

  it('compact mode: millions', () => {
    const result = formatStx(1_200_000, { compact: true, locale, decimals: 1 });
    expect(result).toContain('1.2M');
    expect(result).toContain('STX');
  });

  it('compact mode: thousands', () => {
    const result = formatStx(5_500, { compact: true, locale, decimals: 1 });
    expect(result).toContain('5.5k');
  });

  it('compact mode: small amounts skip abbreviation', () => {
    const result = formatStx(999, { compact: true, locale });
    expect(result).not.toContain('k');
    expect(result).not.toContain('M');
  });

  it('converts from microSTX when fromMicroStx=true', () => {
    const result = formatStx(1_500_000, { fromMicroStx: true, locale });
    expect(result).toContain('1.5');
    expect(result).toContain('STX');
  });

  it('handles 0 gracefully', () => {
    const result = formatStx(0, { locale });
    expect(result).toBe('0 STX');
  });

  it('returns placeholder for NaN', () => {
    const result = formatStx(NaN, { locale });
    expect(result).toContain('—');
  });

  it('returns placeholder for Infinity', () => {
    const result = formatStx(Infinity, { locale });
    expect(result).toContain('—');
  });
});

describe('formatMicroStx', () => {
  it('converts 1 STX', () => {
    expect(formatMicroStx(1_000_000)).toContain('1');
    expect(formatMicroStx(1_000_000)).toContain('STX');
  });

  it('shows 6 decimal places for 1 uSTX', () => {
    const result = formatMicroStx(1);
    expect(result).toContain('0.000001');
  });

  it('hides symbol when showSymbol=false', () => {
    expect(formatMicroStx(1_000_000, false)).not.toContain('STX');
  });
});

describe('formatStxWhole', () => {
  it('rounds to nearest whole', () => {
    const result = formatStxWhole(1_234_567.89, false);
    expect(result).toContain('1');
    expect(result).not.toContain('.');
  });
});

describe('formatStxPenalty', () => {
  it('formats a penalty with minus sign and fee label', () => {
    const result = formatStxPenalty(50);
    expect(result).toContain('−');
    expect(result).toContain('50');
    expect(result).toContain('fee');
    expect(result).toContain('STX');
  });
});

describe('parseStxInput', () => {
  it('parses a plain number string', () => {
    expect(parseStxInput('500')).toBe(500);
  });

  it('parses a decimal string', () => {
    expect(parseStxInput('1.5')).toBe(1.5);
  });

  it('parses a comma-separated number', () => {
    expect(parseStxInput('1,234,567')).toBe(1_234_567);
  });

  it('parses compact k suffix', () => {
    expect(parseStxInput('5k')).toBe(5_000);
  });

  it('parses compact K suffix (uppercase)', () => {
    expect(parseStxInput('5K')).toBe(5_000);
  });

  it('parses compact M suffix', () => {
    expect(parseStxInput('1.2M')).toBeCloseTo(1_200_000, 0);
  });

  it('returns NaN for invalid input', () => {
    expect(parseStxInput('abc')).toBeNaN();
  });

  it('trims whitespace', () => {
    expect(parseStxInput('  100  ')).toBe(100);
  });
});
