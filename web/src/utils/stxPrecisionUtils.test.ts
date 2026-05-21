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
