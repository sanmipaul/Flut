/**
 * formatAnalytics
 *
 * Thin display-formatting helpers used by VaultAnalyticsDashboard.
 * All functions are pure and return localised strings.
 */

const BLOCKS_PER_DAY = 144;
const BLOCKS_PER_HOUR = 6;

/** Format a whole-STX number for display (locale-aware, no decimals for round numbers). */
export function formatStxAmount(stx: number): string {
  if (!Number.isFinite(stx) || stx === 0) return '0 STX';
  return `${stx.toLocaleString(undefined, { maximumFractionDigits: 2 })} STX`;
}

/**
 * Convert a block count to a human-readable duration string.
 * Mirrors the logic in useLockProgress for consistency.
 */
export function formatBlockDuration(blocks: number): string {
  if (blocks <= 0) return '—';
  if (blocks < BLOCKS_PER_HOUR) return `~${Math.ceil(blocks * 10)} min`;
  if (blocks < BLOCKS_PER_DAY) return `~${Math.ceil(blocks / BLOCKS_PER_HOUR)} hr`;
  const days = Math.ceil(blocks / BLOCKS_PER_DAY);
  return `~${days} day${days !== 1 ? 's' : ''}`;
}

/** Format a percentage value as "42%". */
export function formatPct(pct: number): string {
  return `${pct}%`;
}

/** Format a vault count with singular/plural label. */
export function formatVaultCount(count: number): string {
  return `${count} vault${count !== 1 ? 's' : ''}`;
}
