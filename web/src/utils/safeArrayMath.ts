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
