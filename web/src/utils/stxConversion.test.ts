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

  it('converts 1.1 STX to exactly 1_100_000 uSTX', () => {
    expect(stxToMicroStx(1.1)).toBe(1_100_000);
  });

  it('converts 0.1 STX to exactly 100_000 uSTX', () => {
    expect(stxToMicroStx(0.1)).toBe(100_000);
  });

  it('converts 2.2 STX to exactly 2_200_000 uSTX', () => {
    expect(stxToMicroStx(2.2)).toBe(2_200_000);
  });

  it('converts 1.3 STX to exactly 1_300_000 uSTX', () => {
    expect(stxToMicroStx(1.3)).toBe(1_300_000);
  });

  it('converts all tenths 0.1–0.9 to exact multiples of 100_000', () => {
    for (let i = 1; i <= 9; i++) {
      expect(stxToMicroStx(i / 10)).toBe(i * 100_000);
    }
  });

  it('converts tenths 1.1–1.9 to correct uSTX values', () => {
    for (let i = 1; i <= 9; i++) {
      const stx = 1 + i / 10;
      expect(stxToMicroStx(stx)).toBe(1_000_000 + i * 100_000);
    }
  });

  it('converts 1.5 STX to 1_500_000 uSTX', () => {
    expect(stxToMicroStx(1.5)).toBe(1_500_000);
  });

  it('result is always a non-negative integer', () => {
    [0, 0.1, 1, 1.1, 2.5, 100].forEach((stx) => {
      const result = stxToMicroStx(stx);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  it('still floors genuinely fractional results', () => {
    // 1.0000005 * 1e6 = 1000000.5 → floor = 1_000_000
    expect(stxToMicroStx(1.0000005)).toBe(1_000_000);
  });

  it('converts 100 STX to 100_000_000 uSTX', () => {
    expect(stxToMicroStx(100)).toBe(100_000_000);
  });
});

describe('stxToMicroStxRound — regression after precision fix', () => {
  it('stxToMicroStxRound(1.1) is 1_100_000', () => {
    expect(stxToMicroStxRound(1.1)).toBe(1_100_000);
  });

  it('stxToMicroStxRound(1.0000005) rounds up to 1_000_001', () => {
    expect(stxToMicroStxRound(1.0000005)).toBe(1_000_001);
  });

  it('stxToMicroStxRound(0.5) is 500_000', () => {
    expect(stxToMicroStxRound(0.5)).toBe(500_000);
  });
});

describe('stxToMicroStx — round-trip with microStxToStx', () => {
  it('round-trips integer STX values exactly', () => {
    [1, 5, 10, 100, 1000].forEach((stx) => {
      expect(microStxToStx(stxToMicroStx(stx))).toBe(stx);
    });
  });

  it('round-trips 0 exactly', () => {
    expect(microStxToStx(stxToMicroStx(0))).toBe(0);
  });
});

describe('stxToMicroStx — monotone property', () => {
  it('larger STX always yields >= uSTX', () => {
    const pairs = [[0.1, 0.2], [1, 2], [10, 11]];
    pairs.forEach(([small, large]) => {
      expect(stxToMicroStx(large)).toBeGreaterThanOrEqual(stxToMicroStx(small));
    });
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
