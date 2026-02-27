/**
 * useStxFormat
 *
 * React hook that returns memoised STX formatting functions bound to
 * the current user locale (detected once on mount). This avoids
 * passing the locale option to every call site.
 *
 * Usage:
 *   const { fmt, fmtCompact, fmtMicro, fmtPenalty } = useStxFormat();
 *   <span>{fmt(vault.amount)}</span>
 */
import { useMemo } from 'react';
import {
  formatStx,
  formatMicroStx,
  formatStxWhole,
  formatStxPenalty,
  formatStxDiff,
  parseStxInput,
  type FormatStxOptions,
} from '../utils/formatStx';
import { microStxToStx, stxToMicroStx } from '../utils/stxConversion';

export interface UseStxFormatReturn {
  /**
   * Format a STX amount for standard display.
   * @example fmt(1234567) → "1,234,567 STX"
   */
  fmt: (amount: number, opts?: Omit<FormatStxOptions, 'locale'>) => string;

  /**
   * Compact display: abbreviates millions and thousands.
   * @example fmtCompact(1_200_000) → "1.2M STX"
   */
  fmtCompact: (amount: number, decimals?: number) => string;

  /**
   * Full-precision display for microSTX values.
   * @example fmtMicro(1_500_001) → "1.500001 STX"
   */
  fmtMicro: (uStx: number, showSymbol?: boolean) => string;

  /**
   * Whole-number display (rounds to nearest STX).
   * @example fmtWhole(1234.9) → "1,235 STX"
   */
  fmtWhole: (amount: number, showSymbol?: boolean) => string;

  /**
   * Penalty formatting with minus sign and fee label.
   * @example fmtPenalty(50) → "−50 STX (fee)"
   */
  fmtPenalty: (penaltyStx: number) => string;

  /**
   * Signed difference display (+/-) for history and comparison views.
   * @example fmtDiff(500) → "+500 STX"  fmtDiff(-100) → "−100 STX"
   */
  fmtDiff: (diffStx: number, decimals?: number) => string;

  /** Parse a user-typed string into STX number */
  parse: (raw: string) => number;

  /** Convert STX to microSTX */
  toMicro: (stx: number) => number;

  /** Convert microSTX to STX */
  fromMicro: (uStx: number) => number;

  /** The detected locale (e.g. "en-US") */
  locale: string;
}

export function useStxFormat(): UseStxFormatReturn {
  const locale = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().locale;
    } catch {
      return 'en-US';
    }
  }, []);

  return useMemo(
    () => ({
      fmt: (amount, opts = {}) => formatStx(amount, { locale, ...opts }),
      fmtCompact: (amount, decimals = 2) =>
        formatStx(amount, { locale, compact: true, decimals }),
      fmtMicro: (uStx, showSymbol = true) => formatMicroStx(uStx, showSymbol),
      fmtWhole: (amount, showSymbol = true) => formatStxWhole(amount, showSymbol),
      fmtPenalty: (penaltyStx) => formatStxPenalty(penaltyStx),
      fmtDiff: (diffStx, decimals) => formatStxDiff(diffStx, decimals),
      parse: parseStxInput,
      toMicro: stxToMicroStx,
      fromMicro: microStxToStx,
      locale,
    }),
    [locale]
  );
}
