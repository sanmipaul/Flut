/**
 * stxConversion
 *
 * Pure functions for converting between STX and microSTX (uSTX).
 *
 * The Stacks blockchain stores all balances as integers in uSTX.
 * All on-chain values should be treated as uSTX; convert to STX
 * only for display purposes.
 *
 * Precision note
 * --------------
 * JavaScript's IEEE-754 doubles cannot represent many decimal fractions
 * exactly. Naively multiplying 1.1 * 1_000_000 yields 1_099_999.999...
 * which Math.floor then truncates to 1_099_999 — one uSTX short.
 *
 * stxToMicroStx and stxToMicroStxRound correct this via stxPrecisionUtils,
 * which snaps values within CONVERSION_EPSILON (1e-9) of an integer to that
 * integer before applying floor/round.
 */
import { MICROSTX_PER_STX } from './stxConstants';
import { safeMicroStxFloor, safeMicroStxRound } from './stxPrecisionUtils';

/**
 * Convert a microSTX integer to its STX decimal equivalent.
 * @example microStxToStx(1_500_000) → 1.5
 */
export function microStxToStx(uStx: number): number {
  return uStx / MICROSTX_PER_STX;
}

/**
 * Convert a STX decimal value to its microSTX integer equivalent.
 * Always rounds down to avoid spending more than intended.
 * Corrects IEEE-754 float drift (e.g. 1.1 * 1e6 = 1_099_999.999...) before
 * flooring, so 1.1 STX correctly returns 1_100_000 uSTX.
 * @example stxToMicroStx(1.5) → 1_500_000
 * @example stxToMicroStx(1.1) → 1_100_000
 */
export function stxToMicroStx(stx: number): number {
  return safeMicroStxFloor(stx);
}

/**
 * Convert a STX decimal to microSTX, rounding to the nearest uSTX.
 * Useful when the caller controls rounding (e.g. fee calculations).
 * Corrects IEEE-754 float drift before rounding.
 * @example stxToMicroStxRound(1.0000005) → 1_000_001
 * @example stxToMicroStxRound(1.1)       → 1_100_000
 */
export function stxToMicroStxRound(stx: number): number {
  return safeMicroStxRound(stx);
}

/**
 * Returns true when the value is safely representable as microSTX
 * without floating-point precision loss.
 */
export function isValidMicroStxAmount(uStx: number): boolean {
  return Number.isFinite(uStx) && Number.isInteger(uStx) && uStx >= 0;
}

/**
 * Returns true for a valid STX decimal amount (≥ 0, finite, ≤ MAX_STX_SUPPLY).
 */
export function isValidStxAmount(stx: number): boolean {
  return Number.isFinite(stx) && stx >= 0;
}

/**
 * Clamps a STX value to [0, maxStx].
 */
export function clampStx(stx: number, maxStx: number): number {
  return Math.min(Math.max(0, stx), maxStx);
}
