/**
 * STX unit constants.
 *
 * The Stacks blockchain stores all balances in microSTX (uSTX).
 * 1 STX = 1,000,000 microSTX.
 *
 * These constants are the single source of truth for any code
 * that converts between the two units.
 */

/** Number of microSTX in 1 STX */
export const MICROSTX_PER_STX = 1_000_000;

/** Maximum total supply of STX (1.818 billion STX) */
export const MAX_STX_SUPPLY = 1_818_000_000;

/** Maximum total supply in microSTX */
export const MAX_USTX_SUPPLY = MAX_STX_SUPPLY * MICROSTX_PER_STX;

/** Minimum displayable STX amount (1 microSTX expressed as STX) */
export const MIN_DISPLAYABLE_STX = 1 / MICROSTX_PER_STX;

/** Currency symbol used throughout the UI */
export const STX_SYMBOL = 'STX';

/** Thresholds for compact notation */
export const COMPACT_THRESHOLD_MILLION  = 1_000_000;
export const COMPACT_THRESHOLD_THOUSAND = 1_000;
