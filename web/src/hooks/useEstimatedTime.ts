/**
 * useEstimatedTime
 *
 * Converts a block count or a future block height into a human-readable
 * "estimated time" string — e.g. "~14 days" or "~3 hours".
 *
 * Because Stacks block times are approximately 10 minutes, simple arithmetic
 * gives a reasonable estimate for UI display purposes.
 */
import { useMemo } from 'react';
import { estimateDaysFromBlocks, estimateHoursFromBlocks } from '../utils/formatBlock';

export interface UseEstimatedTimeOptions {
  /** Current block height (required when estimating time until a future block) */
  currentBlockHeight?: number;
}

export interface EstimatedTimeResult {
  /** Human-readable label, e.g. "~14 days" or "~3 hours" */
  label: string;
  /** Estimated number of minutes */
  minutes: number;
  /** Whether the target block has already passed */
  isPast: boolean;
}

const MINUTES_PER_BLOCK = 10;

/**
 * Converts remaining blocks to a readable duration label.
 */
function blocksToDurationLabel(blocks: number): string {
  if (blocks <= 0) return 'now';
  const minutes = blocks * MINUTES_PER_BLOCK;
  if (minutes < 60) return `~${minutes} min`;
  const hours = estimateHoursFromBlocks(blocks);
  if (hours < 48) return `~${hours} hour${hours !== 1 ? 's' : ''}`;
  const days = estimateDaysFromBlocks(blocks);
  return `~${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Returns an EstimatedTimeResult for a given future block height.
 */
export function useEstimatedTime(
  targetBlockHeight: number,
  options: UseEstimatedTimeOptions = {}
): EstimatedTimeResult {
  const { currentBlockHeight = 0 } = options;

  return useMemo(() => {
    const remaining = targetBlockHeight - currentBlockHeight;

    if (remaining <= 0) {
      return { label: 'now', minutes: 0, isPast: true };
    }

    const minutes = remaining * MINUTES_PER_BLOCK;
    const label = blocksToDurationLabel(remaining);

    return { label, minutes, isPast: false };
  }, [targetBlockHeight, currentBlockHeight]);
}

/**
 * Pure function version — useful for testing or non-hook contexts.
 */
export function estimateTimeLabel(
  targetBlockHeight: number,
  currentBlockHeight = 0
): string {
  const remaining = targetBlockHeight - currentBlockHeight;
  if (remaining <= 0) return 'now';
  return blocksToDurationLabel(remaining);
}
