/**
 * useLockProgress
 *
 * Calculates the progress of a vault's lock period given block heights.
 * Returns a memoised LockProgressState that updates when any input changes.
 *
 * Usage:
 *   const progress = useLockProgress({ createdAt, unlockHeight, currentBlockHeight, isWithdrawn });
 */
import { useMemo } from 'react';
import {
  LockProgressState,
  VaultLockStatus,
  BLOCKS_PER_DAY,
  BLOCKS_PER_HOUR,
} from '../types/LockProgress';

export interface UseLockProgressInput {
  /** Block height at which the vault was created */
  createdAt: number;
  /** Block height at which the vault unlocks */
  unlockHeight: number;
  /** Current network block height */
  currentBlockHeight: number;
  /** Whether the vault has already been withdrawn */
  isWithdrawn: boolean;
}

/**
 * Convert a block count to a human-readable time estimate string.
 * @example blocksToTimeString(1440) → "~10 days"
 */
export function blocksToTimeString(blocks: number): string {
  if (blocks <= 0) return 'now';
  if (blocks < BLOCKS_PER_HOUR) {
    const minutes = Math.ceil(blocks * 10);
    return `~${minutes} min`;
  }
  if (blocks < BLOCKS_PER_DAY) {
    const hours = Math.ceil(blocks / BLOCKS_PER_HOUR);
    return `~${hours} hr`;
  }
  const days = Math.ceil(blocks / BLOCKS_PER_DAY);
  return `~${days} day${days !== 1 ? 's' : ''}`;
}

export function useLockProgress(input: UseLockProgressInput): LockProgressState {
  const { createdAt, unlockHeight, currentBlockHeight, isWithdrawn } = input;

  return useMemo((): LockProgressState => {
    if (isWithdrawn) {
      return {
        percentComplete: 100,
        blocksRemaining: 0,
        totalLockBlocks: Math.max(0, unlockHeight - createdAt),
        blocksElapsed: Math.max(0, unlockHeight - createdAt),
        timeRemaining: 'Withdrawn',
        status: 'withdrawn',
      };
    }

    const totalLockBlocks = Math.max(0, unlockHeight - createdAt);
    const blocksElapsed = Math.max(0, currentBlockHeight - createdAt);
    const blocksRemaining = Math.max(0, unlockHeight - currentBlockHeight);
    const isUnlocked = currentBlockHeight >= unlockHeight;

    const percentComplete =
      totalLockBlocks === 0
        ? 100
        : Math.min(100, Math.round((blocksElapsed / totalLockBlocks) * 100));

    const status: VaultLockStatus = isUnlocked ? 'unlocked' : 'locked';

    const timeRemaining = isUnlocked ? 'Unlocked' : blocksToTimeString(blocksRemaining);

    return {
      percentComplete,
      blocksRemaining,
      totalLockBlocks,
      blocksElapsed,
      timeRemaining,
      status,
    };
  }, [createdAt, unlockHeight, currentBlockHeight, isWithdrawn]);
}
