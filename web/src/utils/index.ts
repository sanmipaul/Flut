/**
 * Utils barrel.
 * Import any utility function from this single entry-point.
 */

// STX amount formatting
export {
  formatStx,
  formatMicroStx,
  formatStxWhole,
  formatStxPenalty,
  parseStxInput,
} from './formatStx';
export type { FormatStxOptions } from './formatStx';

// STX unit conversion
export {
  microStxToStx,
  stxToMicroStx,
  stxToMicroStxRound,
  isValidMicroStxAmount,
  isValidStxAmount,
  clampStx,
} from './stxConversion';

// STX constants
export {
  MICROSTX_PER_STX,
  MAX_STX_SUPPLY,
  MAX_USTX_SUPPLY,
  MIN_DISPLAYABLE_STX,
  STX_SYMBOL,
  COMPACT_THRESHOLD_MILLION,
  COMPACT_THRESHOLD_THOUSAND,
} from './stxConstants';
