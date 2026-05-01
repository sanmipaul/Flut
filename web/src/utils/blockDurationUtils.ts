export const BLOCKS_PER_HOUR = 6;
export const BLOCKS_PER_DAY = 144;
export const BLOCKS_PER_WEEK = 1008;
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
