import { BLOCKS_PER_DAY, BLOCKS_PER_HOUR, BLOCKS_PER_MINUTE } from './LockProgress';

describe('LockProgress constants', () => {
  it('BLOCKS_PER_DAY is 144', () => {
    expect(BLOCKS_PER_DAY).toBe(144);
  });

  it('BLOCKS_PER_HOUR is 6', () => {
    expect(BLOCKS_PER_HOUR).toBe(6);
  });

  it('BLOCKS_PER_MINUTE is less than 1', () => {
    expect(BLOCKS_PER_MINUTE).toBeLessThan(1);
  });

  it('BLOCKS_PER_DAY equals 24 * BLOCKS_PER_HOUR', () => {
    expect(BLOCKS_PER_DAY).toBe(24 * BLOCKS_PER_HOUR);
  });
});
