/** One Stacks block is mined approximately every 10 minutes. */
export const BLOCKS_PER_HOUR = 6;
/** 6 blocks/hr × 24 hr = 144 blocks/day. */
export const BLOCKS_PER_DAY = 144;
/** 144 × 7 = 1008 blocks/week. */
export const BLOCKS_PER_WEEK = 1008;
/** 144 × 30 = 4320 blocks/month (30-day approximation). */
export const BLOCKS_PER_MONTH = 4320;

export const INVALID_DURATION = '—';

/** Returns true if n is a finite positive number. */
export function isValidBlockCount(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/** Returns true if n is NaN. */
export function isNaNBlockCount(n: number): boolean {
  return Number.isNaN(n);
}

/** Returns true if n is positive or negative Infinity. */
export function isInfiniteBlockCount(n: number): boolean {
  return n === Infinity || n === -Infinity;
}

/** Convert blocks to approximate minutes (1 Stacks block ≈ 10 minutes). */
export function blocksToApproxMinutes(blocks: number): number {
  return Math.ceil(blocks * 10);
}

/** Convert blocks to approximate hours. */
export function blocksToApproxHours(blocks: number): number {
  return Math.ceil(blocks / BLOCKS_PER_HOUR);
}

/** Convert blocks to approximate days. */
export function blocksToDays(blocks: number): number {
  return Math.ceil(blocks / BLOCKS_PER_DAY);
}

/** Format a block count as a minutes string, e.g. "~30 min". */
export function formatBlocksAsMinutes(blocks: number): string {
  return `~${blocksToApproxMinutes(blocks)} min`;
}

/** Format a block count as an hours string, e.g. "~2 hr". */
export function formatBlocksAsHours(blocks: number): string {
  return `~${blocksToApproxHours(blocks)} hr`;
}

/** Format a block count as a days string with pluralization, e.g. "~3 days". */
export function formatBlocksAsDays(blocks: number): string {
  const days = blocksToDays(blocks);
  return `~${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Safely format a block count as a human-readable duration.
 *
 * Returns INVALID_DURATION ('—') for any input that is not a finite positive
 * number: 0, negative, NaN, +Infinity, and -Infinity all yield '—'.
 *
 * This is a pure function — it never throws.
 *
 * @param blocks - Number of Stacks blocks
 * @returns Human-readable duration string or '—'
 */
export function safeFormatBlockDuration(blocks: number): string {
  if (!isValidBlockCount(blocks)) return INVALID_DURATION;
  if (blocks < BLOCKS_PER_HOUR) return formatBlocksAsMinutes(blocks);
  if (blocks < BLOCKS_PER_DAY) return formatBlocksAsHours(blocks);
  return formatBlocksAsDays(blocks);
}
