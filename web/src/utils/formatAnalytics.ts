/**
 * formatAnalytics
 *
 * Thin display-formatting helpers used by VaultAnalyticsDashboard.
 * All functions are pure and return localised strings.
 *
 * STX amounts are formatted via the canonical formatStx utility to ensure
 * consistent display across the application.
 */
import { formatStx } from './formatStx';

import { safeFormatBlockDuration } from './blockDurationUtils';

/** Format a whole-STX number for display (locale-aware, no decimals for round numbers). */
export function formatStxAmount(stx: number): string {
  if (!Number.isFinite(stx)) return '0 STX';
  if (stx === 0) return '0 STX';
  return formatStx(stx, { decimals: 2, showSymbol: true });
}

/**
 * Format a microSTX amount as STX for analytics display.
 * Converts from microSTX before formatting.
 */
export function formatMicroStxAmount(uStx: number): string {
  if (!Number.isFinite(uStx)) return '0 STX';
  if (uStx === 0) return '0 STX';
  return formatStx(uStx, { fromMicroStx: true, decimals: 2, showSymbol: true });
}

/**
 * Convert a block count to a human-readable duration string.
 * Mirrors the logic in useLockProgress for consistency.
 *
 * Returns '—' for 0, negative, NaN, +Infinity, and -Infinity — all of which
 * represent a block count that cannot be meaningfully displayed as a duration.
 *
 * @see safeFormatBlockDuration in blockDurationUtils for the implementation
 */
export function formatBlockDuration(blocks: number): string {
  return safeFormatBlockDuration(blocks);
}

/** Format a percentage value as "42%".
 * @example formatPct(42) → "42%"
 */
export function formatPct(pct: number): string {
  return `${pct}%`;
}

/** Format a vault count with singular/plural label.
 * @example formatVaultCount(1) → "1 vault"
 * @example formatVaultCount(5) → "5 vaults"
 */
export function formatVaultCount(count: number): string {
  return `${count} vault${count !== 1 ? 's' : ''}`;
}
