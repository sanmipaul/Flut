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
