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

describe('arraySum', () => {
  it('sums a normal array', () => {
    expect(arraySum([1, 2, 3, 4])).toBe(10);
  });

  it('returns 0 for empty array', () => {
    expect(arraySum([])).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(arraySum([-1, -2, 3])).toBe(0);
  });

  it('returns the single element for one-item array', () => {
    expect(arraySum([99])).toBe(99);
  });
});

describe('arrayMean', () => {
  it('computes mean of [1, 2, 3]', () => {
    expect(arrayMean([1, 2, 3])).toBeCloseTo(2);
  });

  it('returns 0 for empty array', () => {
    expect(arrayMean([])).toBe(0);
  });

  it('returns the value itself for a single-element array', () => {
    expect(arrayMean([7])).toBe(7);
  });

  it('handles arrays with all equal values', () => {
    expect(arrayMean([5, 5, 5, 5])).toBe(5);
  });
});

describe('safeArrayMax', () => {
  it('returns 0 for empty array', () => {
    expect(safeArrayMax([])).toBe(0);
  });

  it('returns max for non-empty array', () => {
    expect(safeArrayMax([3, 1, 4])).toBe(4);
  });
});

describe('safeArrayMin', () => {
  it('returns 0 for empty array', () => {
    expect(safeArrayMin([])).toBe(0);
  });

  it('returns min for non-empty array', () => {
    expect(safeArrayMin([3, 1, 4])).toBe(1);
  });
});

describe('large array — no stack overflow', () => {
  const big = Array.from({ length: 200_000 }, (_, i) => i);

  it('arrayMax does not throw for 200k elements', () => {
    expect(() => arrayMax(big)).not.toThrow();
  });

  it('arrayMin does not throw for 200k elements', () => {
    expect(() => arrayMin(big)).not.toThrow();
  });

  it('arrayMax returns the correct maximum', () => {
    expect(arrayMax(big)).toBe(199_999);
  });

  it('arrayMin returns the correct minimum', () => {
    expect(arrayMin(big)).toBe(0);
  });
});

describe('arrayMax — all-equal values', () => {
  it('returns that value when all elements are equal', () => {
    expect(arrayMax([7, 7, 7, 7])).toBe(7);
  });
});

describe('arrayMin — all-equal values', () => {
  it('returns that value when all elements are equal', () => {
    expect(arrayMin([3, 3, 3])).toBe(3);
  });
});

describe('arraySum — negative values', () => {
  it('correctly sums an array of all negatives', () => {
    expect(arraySum([-1, -2, -3])).toBe(-6);
  });

  it('returns 0 for a balanced positive/negative array', () => {
    expect(arraySum([-5, 5])).toBe(0);
  });
});

describe('arrayMean — parametrised accuracy', () => {
  it.each([
    { arr: [0, 10], expected: 5 },
    { arr: [1, 3, 5, 7], expected: 4 },
    { arr: [100], expected: 100 },
  ])('mean of $arr is $expected', ({ arr, expected }) => {
    expect(arrayMean(arr)).toBeCloseTo(expected);
  });
});

describe('arrayMax/arrayMin — monotone property', () => {
  it('arrayMax of a superset is >= arrayMax of subset', () => {
    const subset = [1, 5, 3];
    const superset = [...subset, 10];
    expect(arrayMax(superset)).toBeGreaterThanOrEqual(arrayMax(subset));
  });

  it('arrayMin of a superset is <= arrayMin of subset', () => {
    const subset = [5, 8, 3];
    const superset = [...subset, 1];
    expect(arrayMin(superset)).toBeLessThanOrEqual(arrayMin(subset));
  });
});

describe('safeArrayMax/safeArrayMin — never NaN', () => {
  it('safeArrayMax never returns NaN', () => {
    expect(Number.isNaN(safeArrayMax([]))).toBe(false);
    expect(Number.isNaN(safeArrayMax([1, 2]))).toBe(false);
  });

  it('safeArrayMin never returns NaN', () => {
    expect(Number.isNaN(safeArrayMin([]))).toBe(false);
    expect(Number.isNaN(safeArrayMin([1, 2]))).toBe(false);
  });
});
