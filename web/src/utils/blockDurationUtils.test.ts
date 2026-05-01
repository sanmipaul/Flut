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

describe('isNaNBlockCount', () => {
  it('returns true for NaN', () => {
    expect(isNaNBlockCount(NaN)).toBe(true);
  });

  it('returns false for a real number', () => {
    expect(isNaNBlockCount(100)).toBe(false);
  });
});

describe('isInfiniteBlockCount', () => {
  it('returns true for Infinity', () => {
    expect(isInfiniteBlockCount(Infinity)).toBe(true);
  });

  it('returns true for -Infinity', () => {
    expect(isInfiniteBlockCount(-Infinity)).toBe(true);
  });

  it('returns false for a finite number', () => {
    expect(isInfiniteBlockCount(144)).toBe(false);
  });
});

describe('blocksToApproxMinutes', () => {
  it('returns 10 for 1 block', () => {
    expect(blocksToApproxMinutes(1)).toBe(10);
  });

  it('returns 30 for 3 blocks', () => {
    expect(blocksToApproxMinutes(3)).toBe(30);
  });

  it('returns 50 for 5 blocks', () => {
    expect(blocksToApproxMinutes(5)).toBe(50);
  });
});

describe('blocksToApproxHours', () => {
  it('returns 1 for exactly BLOCKS_PER_HOUR blocks', () => {
    expect(blocksToApproxHours(BLOCKS_PER_HOUR)).toBe(1);
  });

  it('returns 2 for 12 blocks', () => {
    expect(blocksToApproxHours(12)).toBe(2);
  });

  it('rounds up fractional hours', () => {
    expect(blocksToApproxHours(7)).toBe(2);
  });
});
