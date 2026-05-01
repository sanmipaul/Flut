import {
  isValidBlockCount,
  isNaNBlockCount,
  isInfiniteBlockCount,
  blocksToApproxMinutes,
  blocksToApproxHours,
  blocksToDays,
  formatBlocksAsMinutes,
  formatBlocksAsHours,
  formatBlocksAsDays,
  safeFormatBlockDuration,
  INVALID_DURATION,
  BLOCKS_PER_HOUR,
  BLOCKS_PER_DAY,
} from './blockDurationUtils';

describe('isValidBlockCount', () => {
  it('returns true for a positive finite number', () => {
    expect(isValidBlockCount(144)).toBe(true);
  });

  it('returns false for 0', () => {
    expect(isValidBlockCount(0)).toBe(false);
  });

  it('returns false for negative numbers', () => {
    expect(isValidBlockCount(-1)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isValidBlockCount(NaN)).toBe(false);
  });

  it('returns false for Infinity', () => {
    expect(isValidBlockCount(Infinity)).toBe(false);
  });

  it('returns false for -Infinity', () => {
    expect(isValidBlockCount(-Infinity)).toBe(false);
  });
});
