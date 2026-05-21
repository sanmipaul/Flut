/**
 * stxPrecisionUtils
 *
 * Helpers that correct IEEE-754 floating-point representation errors when
 * converting between STX and microSTX.
 *
 * Problem
 * -------
 * JavaScript's Number type stores values in 64-bit IEEE-754 double precision.
 * Many decimal fractions (0.1, 0.2, 1.1 …) cannot be represented exactly,
 * so multiplying them by 1_000_000 produces values slightly below the true
 * integer result:
 *
 *   1.1 * 1_000_000  →  1_099_999.999 999 999 8   (not 1_100_000)
 *   Math.floor(...)  →  1_099_999                  (wrong!)
 *
 * Fix
 * ---
 * Before flooring, snap values that are within CONVERSION_EPSILON of an
 * integer to that integer. The epsilon (1e-9) is orders of magnitude smaller
 * than 0.5 uSTX, so it cannot accidentally round genuinely fractional amounts.
 *
 * All functions are pure and never throw.
 */

import { MICROSTX_PER_STX } from './stxConstants';

/**
 * Maximum distance from an integer that is treated as a float rounding error.
 * Chosen to be much smaller than 0.5 (half a uSTX) so it cannot corrupt
 * intentionally fractional results.
 */
export const CONVERSION_EPSILON = 1e-9;

/** Number of decimal places in the STX unit (1 STX = 10^6 uSTX). */
export const STX_DECIMAL_PLACES = 6;

/**
 * Returns true when `value` is within CONVERSION_EPSILON of a whole number.
 * Used to detect IEEE-754 representation drift before rounding operations.
 *
 * @example isNearInteger(1099999.9999999998) // true  (1.1 * 1e6 float error)
 * @example isNearInteger(1000000.5)          // false (genuinely fractional)
 */
export function isNearInteger(value: number): boolean {
  return Math.abs(value - Math.round(value)) < CONVERSION_EPSILON;
}

/**
 * If `value` is within CONVERSION_EPSILON of a whole number, returns that
 * integer; otherwise returns `value` unchanged.
 *
 * @example snapToNearestInteger(1099999.9999999998) // 1100000
 * @example snapToNearestInteger(1000000.5)          // 1000000.5 (unchanged)
 */
export function snapToNearestInteger(value: number): number {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < CONVERSION_EPSILON ? rounded : value;
}

/**
 * Convert STX to microSTX using floor semantics, correcting IEEE-754 drift.
 *
 * Equivalent to Math.floor(stx * MICROSTX_PER_STX) but first snaps values
 * that are within CONVERSION_EPSILON of a whole number to that integer,
 * preventing 1.1 * 1e6 → 1_099_999.999... from flooring to 1_099_999.
 *
 * @example safeMicroStxFloor(1.1) // 1_100_000 (not 1_099_999)
 * @example safeMicroStxFloor(1.0000005) // 1_000_000 (genuinely fractional → floored)
 */
export function safeMicroStxFloor(stx: number): number {
  return Math.floor(snapToNearestInteger(stx * MICROSTX_PER_STX));
}

/**
 * Convert STX to microSTX using round semantics, correcting IEEE-754 drift.
 *
 * @example safeMicroStxRound(1.0000005) // 1_000_001 (rounds up as expected)
 * @example safeMicroStxRound(1.1)       // 1_100_000 (float error corrected)
 */
export function safeMicroStxRound(stx: number): number {
  return Math.round(snapToNearestInteger(stx * MICROSTX_PER_STX));
}
