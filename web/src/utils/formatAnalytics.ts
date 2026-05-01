/**
 * formatAnalytics
 *
 * Thin display-formatting helpers used by VaultAnalyticsDashboard.
 * All functions are pure and return localised strings.
 */

import { safeFormatBlockDuration } from './blockDurationUtils';

/** Format a whole-STX number for display (locale-aware, no decimals for round numbers). */
export function formatStxAmount(stx: number): string {
  if (!Number.isFinite(stx) || stx === 0) return '0 STX';
  return `${stx.toLocaleString(undefined, { maximumFractionDigits: 2 })} STX`;
}

/**
 * Convert a block count to a human-readable duration string.
 * Mirrors the logic in useLockProgress for consistency.
 * Returns '—' for 0, negative, NaN, or Infinity.
 */
export function formatBlockDuration(blocks: number): string {
  return safeFormatBlockDuration(blocks);
}

/** Format a percentage value as "42%". */
export function formatPct(pct: number): string {
  return `${pct}%`;
}

/** Format a vault count with singular/plural label. */
export function formatVaultCount(count: number): string {
  return `${count} vault${count !== 1 ? 's' : ''}`;
}
