import {
  isEmptyArray,
  arrayMax,
  arrayMin,
  arraySum,
  arrayMean,
  safeArrayMax,
  safeArrayMin,
} from './safeArrayMath';

describe('isEmptyArray', () => {
  it('returns true for []', () => {
    expect(isEmptyArray([])).toBe(true);
  });

  it('returns false for non-empty arrays', () => {
    expect(isEmptyArray([1])).toBe(false);
  });

  it('returns false for multi-element arrays', () => {
    expect(isEmptyArray([1, 2, 3])).toBe(false);
  });
});
