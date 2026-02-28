import { describe, it, expect } from 'vitest';
import {
  MICROSTX_PER_STX,
  MAX_STX_SUPPLY,
  MAX_USTX_SUPPLY,
  MIN_DISPLAYABLE_STX,
  STX_SYMBOL,
  COMPACT_THRESHOLD_MILLION,
  COMPACT_THRESHOLD_THOUSAND,
} from './stxConstants';

describe('STX constants', () => {
  it('MICROSTX_PER_STX is 1_000_000', () => {
    expect(MICROSTX_PER_STX).toBe(1_000_000);
  });

  it('MAX_STX_SUPPLY is 1.818 billion', () => {
    expect(MAX_STX_SUPPLY).toBe(1_818_000_000);
  });

  it('MAX_USTX_SUPPLY equals MAX_STX_SUPPLY * MICROSTX_PER_STX', () => {
    expect(MAX_USTX_SUPPLY).toBe(MAX_STX_SUPPLY * MICROSTX_PER_STX);
  });

  it('MIN_DISPLAYABLE_STX is 1 / MICROSTX_PER_STX', () => {
    expect(MIN_DISPLAYABLE_STX).toBeCloseTo(0.000001, 6);
  });

  it('STX_SYMBOL is "STX"', () => {
    expect(STX_SYMBOL).toBe('STX');
  });

  it('COMPACT_THRESHOLD_MILLION is 1_000_000', () => {
    expect(COMPACT_THRESHOLD_MILLION).toBe(1_000_000);
  });

  it('COMPACT_THRESHOLD_THOUSAND is 1_000', () => {
    expect(COMPACT_THRESHOLD_THOUSAND).toBe(1_000);
  });
});
