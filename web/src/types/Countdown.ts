/**
 * Countdown types
 *
 * Shapes used by useCountdown and VaultCountdown to represent the live
 * time-remaining display for a vault lock period.
 *
 * Block time on Stacks mainnet averages ~10 minutes per block.
 */

/** Seconds remaining broken into display units. */
export interface CountdownUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** The overall lifecycle phase of the countdown. */
export type CountdownPhase = 'counting' | 'imminent' | 'unlocked' | 'withdrawn';

/**
 * Full state returned by useCountdown on every tick.
 *
 * - `counting`  — more than 1 hour remaining
 * - `imminent`  — less than 1 hour remaining but still locked
 * - `unlocked`  — the vault has reached its unlock height
 * - `withdrawn` — the vault funds have been withdrawn
 */
export interface CountdownState {
  units: CountdownUnits;
  /** Total seconds remaining (0 when unlocked/withdrawn). */
  totalSecondsRemaining: number;
  phase: CountdownPhase;
  /** Formatted string for screen readers, e.g. "2 days 3 hours 14 minutes". */
  ariaLabel: string;
}

/** Input required by useCountdown. */
export interface UseCountdownInput {
  /** Block height at which the vault was created. */
  createdAt: number;
  /** Block height at which the vault becomes withdrawable. */
  unlockHeight: number;
  /** Current chain block height. */
  currentBlockHeight: number;
  /** True when the vault has already been withdrawn. */
  isWithdrawn: boolean;
}

/** Stacks mainnet average: 1 block ≈ 600 seconds (10 minutes). */
export const SECONDS_PER_BLOCK = 600;
