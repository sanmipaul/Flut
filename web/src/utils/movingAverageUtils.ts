/**
 * movingAverageUtils
 *
 * Pure helpers for computing moving averages over ChartDataPoint arrays.
 * All functions are side-effect free and safe to call in useMemo.
 *
 * The core invariant upheld by every average function:
 *   - Output length === input length (no data is dropped).
 *   - All output values are finite (no NaN or Infinity).
 *   - The input array is never mutated.
 *   - Invalid window sizes (0, negative, NaN) are silently clamped to 1.
 */
import { ChartDataPoint } from '../types/TransactionHistory';

// ---------------------------------------------------------------------------
// Window size helpers
// ---------------------------------------------------------------------------

/**
 * Clamp a requested window size to a valid range [1, dataLength].
 *
 * - window <= 0 is treated as 1 (identity: each point is its own average)
 * - window > dataLength is clamped to dataLength (full-array average)
 * - Non-integer values are floored to the nearest integer >= 1
 *
 * @example clampWindowSize(0, 10)   → 1
 * @example clampWindowSize(3, 10)   → 3
 * @example clampWindowSize(100, 10) → 10
 * @example clampWindowSize(2.7, 10) → 2
 */
export function clampWindowSize(windowSize: number, dataLength: number): number {
  if (!Number.isFinite(windowSize) || windowSize <= 0) return 1;
  const floored = Math.floor(windowSize);
  return Math.min(floored, Math.max(1, dataLength));
}

/**
 * Returns true when the window size is a valid integer >= 1.
 *
 * Does not check whether the window fits within a particular dataset —
 * use `clampWindowSize` to normalize before passing to average functions.
 */
export function isValidWindowSize(windowSize: number): boolean {
  return Number.isInteger(windowSize) && windowSize >= 1;
}

/**
 * The default window size used by `generateMovingAverage`.
 * A 7-point window is idiomatic for daily data (one week of smoothing).
 */
export const DEFAULT_WINDOW_SIZE = 7;

// ---------------------------------------------------------------------------
// Window boundary helpers
// ---------------------------------------------------------------------------

/**
 * Compute the start index of the sliding window centred at position `i`.
 * Uses a symmetric window: half the window extends left, half right.
 * Never returns a negative index.
 *
 * @example windowStart(5, 3) → 4   // i=5, extends 1 left
 * @example windowStart(0, 7) → 0   // clamped to 0
 */
export function windowStart(i: number, windowSize: number): number {
  return Math.max(0, i - Math.floor(windowSize / 2));
}

/**
 * Compute the exclusive end index of the sliding window centred at `i`.
 * Never exceeds `dataLength`.
 *
 * @example windowEnd(5, 3, 10) → 7   // i=5, extends 2 right
 * @example windowEnd(9, 7, 10) → 10  // clamped to dataLength
 */
export function windowEnd(i: number, windowSize: number, dataLength: number): number {
  return Math.min(dataLength, i + Math.ceil(windowSize / 2));
}

// ---------------------------------------------------------------------------
// Average computation
// ---------------------------------------------------------------------------

/**
 * Compute the arithmetic mean of an array of numbers.
 * Returns 0 for an empty array instead of NaN.
 *
 * The 0-fallback means that functions built on top of this helper always
 * produce finite output without requiring callers to handle NaN.
 *
 * @example arithmeticMean([10, 20, 30]) → 20
 * @example arithmeticMean([])           → 0  (not NaN)
 */
export function arithmeticMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Compute a trailing (backward-looking) moving average over ChartDataPoints.
 *
 * For each point at index i, the window spans [i - windowSize + 1, i].
 * Points near the start of the array use however many points are available
 * (no warm-up padding).
 *
 * This variant is useful for financial-style charts where the smoothed line
 * should only use historical values, not future ones.
 *
 * @param data       - Input data points
 * @param windowSize - Trailing window size (clamped to [1, data.length])
 */
export function trailingMovingAverage(
  data: ChartDataPoint[],
  windowSize: number
): ChartDataPoint[] {
  if (data.length === 0) return [];
  const safeWindow = clampWindowSize(windowSize, data.length);

  return data.map((point, i) => {
    const start = Math.max(0, i - safeWindow + 1);
    const slice = data.slice(start, i + 1);
    return {
      label: point.label,
      value: arithmeticMean(slice.map((p) => p.value)),
    };
  });
}

/**
 * Compute a linearly-weighted trailing moving average (WMA).
 *
 * More recent points receive higher weights. For a window of size w at index i:
 *   weight[j] = (j - start + 1)  (1 for oldest, w for most recent)
 *
 * Useful when recent data should be emphasised over older data.
 * Falls back to a simple average when only one point is available.
 *
 * Invalid window sizes are clamped via `clampWindowSize`.
 */
export function weightedMovingAverage(
  data: ChartDataPoint[],
  windowSize: number
): ChartDataPoint[] {
  if (data.length === 0) return [];
  const safeWindow = clampWindowSize(windowSize, data.length);

  return data.map((point, i) => {
    const start = Math.max(0, i - safeWindow + 1);
    const slice = data.slice(start, i + 1);
    let weightedSum = 0;
    let totalWeight = 0;
    slice.forEach((p, j) => {
      const weight = j + 1;
      weightedSum += p.value * weight;
      totalWeight += weight;
    });
    return {
      label: point.label,
      value: totalWeight === 0 ? 0 : weightedSum / totalWeight,
    };
  });
}

/**
 * Compute a centred moving average over a ChartDataPoint array.
 *
 * The window is symmetric: for point at index i, it spans
 *   [i - floor(w/2), i + ceil(w/2))
 * clipped to [0, data.length).
 *
 * This is a pure function — the original array is not mutated.
 *
 * @param data       - Input data points
 * @param windowSize - Number of data points to average (must be >= 1)
 * @returns A new array of the same length with smoothed values
 */
export function centredMovingAverage(
  data: ChartDataPoint[],
  windowSize: number
): ChartDataPoint[] {
  if (data.length === 0) return [];
  const safeWindow = clampWindowSize(windowSize, data.length);

  return data.map((point, i) => {
    const start = windowStart(i, safeWindow);
    const end = windowEnd(i, safeWindow, data.length);
    const slice = data.slice(start, end);
    return {
      label: point.label,
      value: arithmeticMean(slice.map((p) => p.value)),
    };
  });
}
