import { describe, it, expect } from 'vitest';
import {
  microStxToStx,
  stxToMicroStx,
  stxToMicroStxRound,
  isValidMicroStxAmount,
  isValidStxAmount,
  clampStx,
} from './stxConversion';

describe('microStxToStx', () => {
  it('converts 1 STX worth of uSTX', () => {
    expect(microStxToStx(1_000_000)).toBe(1);
  });

  it('converts 1.5 STX', () => {
    expect(microStxToStx(1_500_000)).toBe(1.5);
  });

  it('converts 0 uSTX', () => {
    expect(microStxToStx(0)).toBe(0);
  });

  it('handles fractional uSTX (sub-cent)', () => {
    expect(microStxToStx(1)).toBeCloseTo(0.000001, 6);
  });
});

describe('stxToMicroStx', () => {
  it('converts 1 STX to 1_000_000 uSTX', () => {
    expect(stxToMicroStx(1)).toBe(1_000_000);
  });

  it('rounds down fractional uSTX', () => {
    // 1.0000005 STX = 1_000_000.5 uSTX → floors to 1_000_000
    expect(stxToMicroStx(1.0000005)).toBe(1_000_000);
  });

  it('converts 0 STX to 0 uSTX', () => {
    expect(stxToMicroStx(0)).toBe(0);
  });
});

describe('stxToMicroStxRound', () => {
  it('rounds to nearest uSTX', () => {
    expect(stxToMicroStxRound(1.0000005)).toBe(1_000_001);
  });

  it('rounds 0.5 uSTX up', () => {
    expect(stxToMicroStxRound(0.0000005)).toBe(1);
  });
});

describe('isValidMicroStxAmount', () => {
  it('returns true for valid integer', () => {
    expect(isValidMicroStxAmount(1_000_000)).toBe(true);
  });

  it('returns true for 0', () => {
    expect(isValidMicroStxAmount(0)).toBe(true);
  });

  it('returns false for negative', () => {
    expect(isValidMicroStxAmount(-1)).toBe(false);
  });

  it('returns false for float', () => {
    expect(isValidMicroStxAmount(1.5)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidMicroStxAmount(NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidMicroStxAmount(Infinity)).toBe(false);
  });
});

describe('isValidStxAmount', () => {
  it('returns true for positive decimal', () => {
    expect(isValidStxAmount(1.5)).toBe(true);
  });

  it('returns true for 0', () => {
    expect(isValidStxAmount(0)).toBe(true);
  });

  it('returns false for negative', () => {
    expect(isValidStxAmount(-0.01)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidStxAmount(NaN)).toBe(false);
  });
});

describe('clampStx', () => {
  it('returns value within range unchanged', () => {
    expect(clampStx(50, 100)).toBe(50);
  });

  it('clamps to max', () => {
    expect(clampStx(200, 100)).toBe(100);
  });

  it('clamps to 0 for negative', () => {
    expect(clampStx(-10, 100)).toBe(0);
  });
});
