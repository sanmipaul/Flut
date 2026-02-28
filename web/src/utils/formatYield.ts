/**
 * formatYield
 *
 * Display-formatting helpers for stacking yield values.
 */

/**
 * Format a fractional BTC value for display.
 * Small values are shown in satoshis (< 0.001 BTC); larger values in BTC.
 */
export function formatBtcAmount(btc: number): string {
  if (!Number.isFinite(btc) || btc <= 0) return '0 BTC';
  if (btc < 0.001) {
    const sats = Math.round(btc * 100_000_000);
    return `${sats.toLocaleString()} sats`;
  }
  return `${btc.toFixed(6)} BTC`;
}

/** Format a yield percentage as "10.0% APY". */
export function formatYieldPct(pct: number): string {
  return `${pct.toFixed(1)}% APY`;
}

/** Format a cycle count as "12 cycles (~24 weeks)". */
export function formatCycleCount(cycles: number): string {
  const weeks = cycles * 2;
  return `${cycles} cycle${cycles !== 1 ? 's' : ''} (~${weeks} week${weeks !== 1 ? 's' : ''})`;
}

/** Format a small STX value with locale separators. */
export function formatStxShort(stx: number): string {
  if (stx >= 1_000_000) return `${(stx / 1_000_000).toFixed(2)}M STX`;
  if (stx >= 1_000) return `${(stx / 1_000).toFixed(1)}k STX`;
  return `${stx.toLocaleString()} STX`;
}
