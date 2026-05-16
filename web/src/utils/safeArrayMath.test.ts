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

describe('arrayMax', () => {
  it('returns the largest value', () => {
    expect(arrayMax([3, 1, 4, 1, 5, 9])).toBe(9);
  });

  it('returns the single element for a one-item array', () => {
    expect(arrayMax([42])).toBe(42);
  });

  it('handles negative numbers', () => {
    expect(arrayMax([-5, -2, -8])).toBe(-2);
  });

  it('returns -Infinity for empty array', () => {
    expect(arrayMax([])).toBe(-Infinity);
  });

  it('matches Math.max for small arrays', () => {
    const arr = [7, 3, 9, 1, 6];
    expect(arrayMax(arr)).toBe(Math.max(...arr));
  });
});

describe('arrayMin', () => {
  it('returns the smallest value', () => {
    expect(arrayMin([3, 1, 4, 1, 5, 9])).toBe(1);
  });

  it('returns the single element for a one-item array', () => {
    expect(arrayMin([42])).toBe(42);
  });

  it('handles negative numbers', () => {
    expect(arrayMin([-5, -2, -8])).toBe(-8);
  });

  it('returns Infinity for empty array', () => {
    expect(arrayMin([])).toBe(Infinity);
  });

  it('matches Math.min for small arrays', () => {
    const arr = [7, 3, 9, 1, 6];
    expect(arrayMin(arr)).toBe(Math.min(...arr));
  });
});
