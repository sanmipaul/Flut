/**
 * safeArrayMath
 *
 * Array reduction helpers that replace spread-based Math.min/Math.max calls.
 *
 * Problem: `Math.max(...arr)` passes every element as a separate function
 * argument. JavaScript engines store function arguments on the call stack,
 * which has a fixed depth. Arrays with more than ~100k–250k elements cause a
 * "Maximum call stack size exceeded" RangeError.
 *
 * Fix: use Array.prototype.reduce, which walks the array iteratively in O(n)
 * time and O(1) stack space regardless of array length.
 *
 * All exported functions are pure and never throw.
 */

/** Returns true if the array has no elements. */
export function isEmptyArray<T>(arr: T[]): boolean {
  return arr.length === 0;
}

/**
 * Returns the maximum value in a number array using reduce.
 * Safe for arrays of any length — does not spread into function arguments.
 * Returns -Infinity for an empty array (same semantics as Math.max()).
 *
 * @example arrayMax([3, 1, 4]) // 4
 * @example arrayMax([])        // -Infinity
 */
export function arrayMax(arr: number[]): number {
  if (isEmptyArray(arr)) return -Infinity;
  return arr.reduce((max, n) => (n > max ? n : max), arr[0]);
}

/**
 * Returns the minimum value in a number array using reduce.
 * Safe for arrays of any length — does not spread into function arguments.
 * Returns Infinity for an empty array (same semantics as Math.min()).
 *
 * @example arrayMin([3, 1, 4]) // 1
 * @example arrayMin([])        // Infinity
 */
export function arrayMin(arr: number[]): number {
  if (isEmptyArray(arr)) return Infinity;
  return arr.reduce((min, n) => (n < min ? n : min), arr[0]);
}

/**
 * Returns the sum of all values in a number array. Returns 0 for empty arrays.
 *
 * @example arraySum([1, 2, 3]) // 6
 * @example arraySum([])        // 0
 */
export function arraySum(arr: number[]): number {
  return arr.reduce((sum, n) => sum + n, 0);
}

/**
 * Returns the arithmetic mean of a number array. Returns 0 for empty arrays.
 *
 * @example arrayMean([1, 2, 3]) // 2
 * @example arrayMean([])        // 0
 */
export function arrayMean(arr: number[]): number {
  if (isEmptyArray(arr)) return 0;
  return arraySum(arr) / arr.length;
}

/**
 * Like arrayMax but returns 0 instead of -Infinity for empty arrays.
 * Preferred over arrayMax when the domain is non-negative (e.g. block counts).
 *
 * @example safeArrayMax([3, 1, 4]) // 4
 * @example safeArrayMax([])        // 0
 */
export function safeArrayMax(arr: number[]): number {
  if (isEmptyArray(arr)) return 0;
  return arrayMax(arr);
}

/**
 * Like arrayMin but returns 0 instead of Infinity for empty arrays.
 * Preferred over arrayMin when the domain is non-negative (e.g. block counts).
 *
 * @example safeArrayMin([3, 1, 4]) // 1
 * @example safeArrayMin([])        // 0
 */
export function safeArrayMin(arr: number[]): number {
  if (isEmptyArray(arr)) return 0;
  return arrayMin(arr);
}
