/**
 * LockProgress
 *
 * Types for the vault lock progress indicator. Captures the
 * calculated state of a vault's lock timeline at a given block height.
 */

/**
 * The overall status of a vault's lock.
 * - 'locked'    : Lock period is still active
 * - 'unlocked'  : Lock period has elapsed, funds can be withdrawn
 * - 'withdrawn' : Funds have already been withdrawn
 */
export type VaultLockStatus = 'locked' | 'unlocked' | 'withdrawn';

/**
 * All derived values describing where a vault sits in its lock timeline.
 */
export interface LockProgressState {
  /** 0–100 percentage of the lock duration that has elapsed */
  percentComplete: number;
  /** Number of blocks remaining until the unlock height (0 when unlocked) */
  blocksRemaining: number;
  /** Total length of the lock period in blocks */
  totalLockBlocks: number;
  /** Number of blocks elapsed since creation */
  blocksElapsed: number;
  /** Human-readable time estimate for the remaining lock period */
  timeRemaining: string;
  /** Current status of the vault lock */
  status: VaultLockStatus;
}

/** Average Stacks block time in minutes (10-minute target) */
export const BLOCKS_PER_MINUTE = 1 / 10;
/** Approximate Stacks blocks per day */
export const BLOCKS_PER_DAY = 144;
/** Approximate Stacks blocks per hour */
export const BLOCKS_PER_HOUR = 6;
