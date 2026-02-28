import { describe, it, expect } from 'vitest';
import { formatBlock, estimateDaysFromBlocks, estimateHoursFromBlocks } from './formatBlock';

describe('formatBlock', () => {
  it('formats block 0', () => {
    expect(formatBlock(0)).toBe('Block #0');
  });

  it('formats block with thousands separator', () => {
    expect(formatBlock(12345)).toContain('12');
    expect(formatBlock(12345)).toContain('345');
    expect(formatBlock(12345)).toContain('Block #');
  });

  it('formats large block numbers', () => {
    const result = formatBlock(1000000);
    expect(result).toContain('Block #');
    expect(result).toContain('000');
  });
});

describe('estimateDaysFromBlocks', () => {
  it('returns 1 day for 144 blocks (1 day at 10 min/block)', () => {
    expect(estimateDaysFromBlocks(144)).toBe(1);
  });

  it('returns 14 days for 2016 blocks', () => {
    expect(estimateDaysFromBlocks(2016)).toBe(14);
  });

  it('rounds up for partial days', () => {
    // 145 blocks = 24h 10min → rounds up to 2 days
    expect(estimateDaysFromBlocks(145)).toBe(2);
  });
});

describe('estimateHoursFromBlocks', () => {
  it('returns 1 hour for 6 blocks', () => {
    expect(estimateHoursFromBlocks(6)).toBe(1);
  });

  it('returns 24 hours for 144 blocks', () => {
    expect(estimateHoursFromBlocks(144)).toBe(24);
  });

  it('rounds up for partial hours', () => {
    expect(estimateHoursFromBlocks(7)).toBe(2);
  });
});
