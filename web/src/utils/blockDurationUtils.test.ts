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

describe('blocksToDays', () => {
  it('returns 1 for exactly BLOCKS_PER_DAY blocks', () => {
    expect(blocksToDays(BLOCKS_PER_DAY)).toBe(1);
  });

  it('returns 2 for 288 blocks', () => {
    expect(blocksToDays(288)).toBe(2);
  });

  it('rounds up fractional days', () => {
    expect(blocksToDays(145)).toBe(2);
  });
});

describe('formatBlocksAsDays', () => {
  it('uses singular "day" for exactly 1 day', () => {
    expect(formatBlocksAsDays(144)).toBe('~1 day');
  });

  it('uses plural "days" for 2+ days', () => {
    expect(formatBlocksAsDays(288)).toBe('~2 days');
  });

  it('includes ~ prefix', () => {
    expect(formatBlocksAsDays(144)).toMatch(/^~/);
  });
});

describe('safeFormatBlockDuration', () => {
  it('returns INVALID_DURATION for Infinity', () => {
    expect(safeFormatBlockDuration(Infinity)).toBe(INVALID_DURATION);
  });

  it('returns INVALID_DURATION for NaN', () => {
    expect(safeFormatBlockDuration(NaN)).toBe(INVALID_DURATION);
  });

  it('returns INVALID_DURATION for -Infinity', () => {
    expect(safeFormatBlockDuration(-Infinity)).toBe(INVALID_DURATION);
  });

  it('returns INVALID_DURATION for 0', () => {
    expect(safeFormatBlockDuration(0)).toBe(INVALID_DURATION);
  });

  it('returns INVALID_DURATION for negative blocks', () => {
    expect(safeFormatBlockDuration(-5)).toBe(INVALID_DURATION);
  });

  it('returns minutes string for 1 block', () => {
    expect(safeFormatBlockDuration(1)).toContain('min');
  });

  it('returns hours string for 12 blocks', () => {
    expect(safeFormatBlockDuration(12)).toContain('hr');
  });

  it('returns days string for 144 blocks', () => {
    expect(safeFormatBlockDuration(144)).toContain('day');
  });
});
