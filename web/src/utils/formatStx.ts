/**
 * formatStx
 *
 * Formats an STX amount for display. Supports:
 *   - Locale-aware number formatting (commas, decimals)
 *   - Configurable decimal precision
 *   - Compact mode: 1,200,000 → "1.2M STX"
 *   - Symbol suffix control
 *   - microSTX input with automatic conversion
 *
 * All functions treat the input as STX unless `fromMicroStx` is set.
 */
import {
  MICROSTX_PER_STX,
  STX_SYMBOL,
  COMPACT_THRESHOLD_MILLION,
  COMPACT_THRESHOLD_THOUSAND,
} from './stxConstants';
import { microStxToStx } from './stxConversion';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface FormatStxOptions {
  /** Number of decimal places to show (default: 2) */
  decimals?: number;
  /** Whether to show the STX symbol suffix (default: true) */
  showSymbol?: boolean;
  /** Compact display: 1_200_000 → "1.2M" (default: false) */
  compact?: boolean;
  /** Treat the input as microSTX and auto-convert (default: false) */
  fromMicroStx?: boolean;
  /** Locale for number formatting (default: user's locale) */
  locale?: string;
}

// ---------------------------------------------------------------------------
// Core formatter
// ---------------------------------------------------------------------------

/**
 * Format an STX (or uSTX) amount for human display.
 *
 * @example
 *   formatStx(1234567.89)                    → "1,234,567.89 STX"
 *   formatStx(1234567, { compact: true })     → "1.23M STX"
 *   formatStx(1500000, { fromMicroStx: true }) → "1.50 STX"
 *   formatStx(0.000001)                       → "0.000001 STX"
 */
export function formatStx(
  amount: number,
  options: FormatStxOptions = {}
): string {
  const {
    decimals = 2,
    showSymbol = true,
    compact = false,
    fromMicroStx = false,
    locale,
  } = options;

  const stx = fromMicroStx ? microStxToStx(amount) : amount;

  if (!Number.isFinite(stx)) return showSymbol ? `— ${STX_SYMBOL}` : '—';

  let formatted: string;

  if (compact) {
    formatted = compactFormat(stx, decimals, locale);
  } else {
    formatted = stx.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  return showSymbol ? `${formatted} ${STX_SYMBOL}` : formatted;
}

/**
 * Format for compact display: abbreviates millions (M) and thousands (k).
 */
function compactFormat(stx: number, decimals: number, locale?: string): string {
  if (stx >= COMPACT_THRESHOLD_MILLION) {
    const val = stx / COMPACT_THRESHOLD_MILLION;
    return `${val.toLocaleString(locale, { maximumFractionDigits: decimals })}M`;
  }
  if (stx >= COMPACT_THRESHOLD_THOUSAND) {
    const val = stx / COMPACT_THRESHOLD_THOUSAND;
    return `${val.toLocaleString(locale, { maximumFractionDigits: decimals })}k`;
  }
  return stx.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

// ---------------------------------------------------------------------------
// Specialised helpers
// ---------------------------------------------------------------------------

/**
 * Formats microSTX as STX with full precision (up to 6 decimal places).
 * Ideal for on-chain amounts where every uSTX matters.
 * @example formatMicroStx(1_500_001) → "1.500001 STX"
 */
export function formatMicroStx(uStx: number, showSymbol = true): string {
  const stx = microStxToStx(uStx);
  const formatted = stx.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
  return showSymbol ? `${formatted} ${STX_SYMBOL}` : formatted;
}

/**
 * Formats a STX amount rounded to the nearest whole number.
 * Useful for quick summary displays.
 * @example formatStxWhole(1234567.89) → "1,234,568 STX"
 */
export function formatStxWhole(amount: number, showSymbol = true): string {
  return formatStx(Math.round(amount), { decimals: 0, showSymbol });
}

/**
 * Formats a STX penalty amount with explicit "fee" labelling.
 * @example formatStxPenalty(100) → "−100 STX (fee)"
 */
export function formatStxPenalty(penaltyStx: number): string {
  const formatted = penaltyStx.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `−${formatted} ${STX_SYMBOL} (fee)`;
}

/**
 * Parses a user-typed string into a STX number.
 * Returns NaN for non-numeric input.
 * Handles common input patterns: "1,234.56", "1.5M", "500k".
 */
export function parseStxInput(raw: string): number {
  const cleaned = raw.trim().replace(/,/g, '');

  // Handle compact suffixes
  const compactMatch = cleaned.match(/^([0-9.]+)\s*([kKmM])$/);
  if (compactMatch) {
    const num = parseFloat(compactMatch[1]);
    const suffix = compactMatch[2].toLowerCase();
    if (!Number.isFinite(num)) return NaN;
    return suffix === 'm' ? num * MICROSTX_PER_STX : num * 1000;
  }

  return parseFloat(cleaned);
}
