/**
 * safeArrayMath
 *
 * Array reduction helpers that replace spread-based Math.min/Math.max calls.
 * Using spread (Math.max(...arr)) blows the JS call stack for arrays with
 * more than ~100k elements; reduce-based versions are O(n) with O(1) stack.
 */

/** Returns true if the array has no elements. */
export function isEmptyArray<T>(arr: T[]): boolean {
  return arr.length === 0;
}

/**
 * Returns the maximum value in a number array using reduce.
 * Safe for arrays of any length — does not spread into function arguments.
 * Returns -Infinity for an empty array (same semantics as Math.max()).
 */
export function arrayMax(arr: number[]): number {
  if (isEmptyArray(arr)) return -Infinity;
  return arr.reduce((max, n) => (n > max ? n : max), arr[0]);
}

/**
 * Returns the minimum value in a number array using reduce.
 * Safe for arrays of any length — does not spread into function arguments.
 * Returns Infinity for an empty array (same semantics as Math.min()).
 */
export function arrayMin(arr: number[]): number {
  if (isEmptyArray(arr)) return Infinity;
  return arr.reduce((min, n) => (n < min ? n : min), arr[0]);
}
