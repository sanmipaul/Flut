import {
  CONVERSION_EPSILON,
  STX_DECIMAL_PLACES,
  isNearInteger,
  snapToNearestInteger,
  safeMicroStxFloor,
  safeMicroStxRound,
} from './stxPrecisionUtils';

describe('CONVERSION_EPSILON', () => {
  it('is a small positive number', () => {
    expect(CONVERSION_EPSILON).toBeGreaterThan(0);
    expect(CONVERSION_EPSILON).toBeLessThan(1e-7);
  });
});

describe('STX_DECIMAL_PLACES', () => {
  it('is 6', () => {
    expect(STX_DECIMAL_PLACES).toBe(6);
  });
});

describe('isNearInteger', () => {
  it('returns true for exact integers', () => {
    expect(isNearInteger(1_100_000)).toBe(true);
    expect(isNearInteger(0)).toBe(true);
  });

  it('returns true for the float error produced by 1.1 * 1e6', () => {
    expect(isNearInteger(1.1 * 1_000_000)).toBe(true);
  });

  it('returns true for the float error produced by 0.1 * 1e6', () => {
    expect(isNearInteger(0.1 * 1_000_000)).toBe(true);
  });

  it('returns false for genuinely fractional values', () => {
    expect(isNearInteger(1_000_000.5)).toBe(false);
  });

  it('returns false for 0.5', () => {
    expect(isNearInteger(0.5)).toBe(false);
  });
});

describe('snapToNearestInteger', () => {
  it('snaps 1.1 * 1e6 to 1_100_000', () => {
    expect(snapToNearestInteger(1.1 * 1_000_000)).toBe(1_100_000);
  });

  it('snaps 0.1 * 1e6 to 100_000', () => {
    expect(snapToNearestInteger(0.1 * 1_000_000)).toBe(100_000);
  });

  it('leaves genuinely fractional 1_000_000.5 unchanged', () => {
    expect(snapToNearestInteger(1_000_000.5)).toBe(1_000_000.5);
  });

  it('leaves exact integers unchanged', () => {
    expect(snapToNearestInteger(1_500_000)).toBe(1_500_000);
  });

  it('snaps 2.2 * 1e6 to 2_200_000', () => {
    expect(snapToNearestInteger(2.2 * 1_000_000)).toBe(2_200_000);
  });
});

describe('safeMicroStxFloor', () => {
  it('converts 1.1 STX to exactly 1_100_000', () => {
    expect(safeMicroStxFloor(1.1)).toBe(1_100_000);
  });

  it('converts 0.1 STX to exactly 100_000', () => {
    expect(safeMicroStxFloor(0.1)).toBe(100_000);
  });

  it('converts 2.2 STX to exactly 2_200_000', () => {
    expect(safeMicroStxFloor(2.2)).toBe(2_200_000);
  });

  it('still floors genuinely fractional values', () => {
    expect(safeMicroStxFloor(1.0000005)).toBe(1_000_000);
  });

  it('converts 1 STX to 1_000_000 exactly', () => {
    expect(safeMicroStxFloor(1)).toBe(1_000_000);
  });

  it('converts 0 STX to 0', () => {
    expect(safeMicroStxFloor(0)).toBe(0);
  });
});

describe('safeMicroStxRound', () => {
  it('rounds 1.0000005 STX up to 1_000_001', () => {
    expect(safeMicroStxRound(1.0000005)).toBe(1_000_001);
  });

  it('converts 1.1 STX to exactly 1_100_000 (no float error)', () => {
    expect(safeMicroStxRound(1.1)).toBe(1_100_000);
  });

  it('converts 0 STX to 0', () => {
    expect(safeMicroStxRound(0)).toBe(0);
  });

  it('converts 1.5 STX to 1_500_000', () => {
    expect(safeMicroStxRound(1.5)).toBe(1_500_000);
  });
});

describe('stxPrecisionUtils — never-NaN safety', () => {
  it('isNearInteger never throws', () => {
    expect(() => isNearInteger(NaN)).not.toThrow();
    expect(() => isNearInteger(Infinity)).not.toThrow();
  });

  it('snapToNearestInteger returns a number for any finite input', () => {
    expect(Number.isFinite(snapToNearestInteger(1.1 * 1_000_000))).toBe(true);
    expect(Number.isFinite(snapToNearestInteger(0))).toBe(true);
  });

  it('safeMicroStxFloor result is always an integer', () => {
    [0.1, 0.5, 1.1, 2.2, 100].forEach((stx) => {
      expect(Number.isInteger(safeMicroStxFloor(stx))).toBe(true);
    });
  });

  it('safeMicroStxRound result is always an integer', () => {
    [0.1, 0.5, 1.1, 2.2, 100].forEach((stx) => {
      expect(Number.isInteger(safeMicroStxRound(stx))).toBe(true);
    });
  });
});

describe('safeMicroStxFloor — all tenths 0.1-0.9', () => {
  it.each(
    Array.from({ length: 9 }, (_, i) => [i + 1, (i + 1) * 100_000] as [number, number])
  )('safeMicroStxFloor(%i/10) = %i', (num, expected) => {
    expect(safeMicroStxFloor(num / 10)).toBe(expected);
  });
});

describe('CONVERSION_EPSILON — is small enough not to affect 0.5 uSTX', () => {
  it('0.5 uSTX boundary is not affected by CONVERSION_EPSILON', () => {
    // 0.5 is much larger than CONVERSION_EPSILON, so genuinely half-uSTX stays fractional
    expect(isNearInteger(0.5)).toBe(false);
    expect(snapToNearestInteger(0.5)).toBe(0.5);
  });
});

describe('snapToNearestInteger — does not mutate near-correct values', () => {
  it('exact integer 1_500_000 is returned as-is', () => {
    expect(snapToNearestInteger(1_500_000)).toBe(1_500_000);
    expect(snapToNearestInteger(1_500_000)).toStrictEqual(1_500_000);
  });

  it('genuinely fractional 500.7 is returned unchanged', () => {
    expect(snapToNearestInteger(500.7)).toBe(500.7);
  });
});

describe('safeMicroStxFloor — parametrised common fractions', () => {
  it.each([
    [0.1, 100_000],
    [0.2, 200_000],
    [0.3, 300_000],
    [0.5, 500_000],
    [1.1, 1_100_000],
    [1.2, 1_200_000],
    [2.5, 2_500_000],
    [10.1, 10_100_000],
  ])('safeMicroStxFloor(%s STX) = %i uSTX', (stx, expected) => {
    expect(safeMicroStxFloor(stx)).toBe(expected);
  });
});
