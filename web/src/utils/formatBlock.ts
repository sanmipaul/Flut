/**
 * formatBlock
 *
 * Formats a Stacks block height into a human-readable string.
 * Used consistently across VaultHistoryItem and VaultDetail.
 *
 * @example formatBlock(12345) → "Block #12,345"
 */
export function formatBlock(blockHeight: number): string {
  return `Block #${blockHeight.toLocaleString()}`;
}

/**
 * Estimates calendar days from a block count assuming ~10 min/block.
 * @example estimateDaysFromBlocks(2016) → 14
 */
export function estimateDaysFromBlocks(blocks: number): number {
  const MINUTES_PER_BLOCK = 10;
  const MINUTES_PER_DAY = 24 * 60;
  return Math.ceil((blocks * MINUTES_PER_BLOCK) / MINUTES_PER_DAY);
}

/**
 * Estimates hours from a block count for short durations.
 * @example estimateHoursFromBlocks(6) → 1
 */
export function estimateHoursFromBlocks(blocks: number): number {
  const MINUTES_PER_BLOCK = 10;
  return Math.ceil((blocks * MINUTES_PER_BLOCK) / 60);
}
