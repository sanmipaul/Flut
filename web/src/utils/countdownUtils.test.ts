import { blocksToSeconds, secondsToUnits, padTwo, buildAriaLabel } from './countdownUtils';
import type { CountdownUnits } from '../types/Countdown';

// ---------------------------------------------------------------------------
// blocksToSeconds
// ---------------------------------------------------------------------------

describe('blocksToSeconds', () => {
  it('returns 0 for 0 blocks', () => {
    expect(blocksToSeconds(0)).toBe(0);
  });

  it('returns 0 for negative blocks', () => {
    expect(blocksToSeconds(-10)).toBe(0);
  });

  it('returns 600 for 1 block (10 min)', () => {
    expect(blocksToSeconds(1)).toBe(600);
  });

  it('returns 3600 for 6 blocks (1 hour)', () => {
    expect(blocksToSeconds(6)).toBe(3600);
  });

  it('returns 86400 for 144 blocks (1 day)', () => {
    expect(blocksToSeconds(144)).toBe(86_400);
  });

  it('scales linearly', () => {
    expect(blocksToSeconds(10)).toBe(6_000);
  });
});

// ---------------------------------------------------------------------------
// secondsToUnits
// ---------------------------------------------------------------------------

describe('secondsToUnits', () => {
  it('returns all zeros for 0 seconds', () => {
    expect(secondsToUnits(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('returns all zeros for negative seconds', () => {
    expect(secondsToUnits(-100)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('correctly decomposes 1 day', () => {
    expect(secondsToUnits(86_400)).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0 });
  });

  it('correctly decomposes 1 hour', () => {
    expect(secondsToUnits(3_600)).toEqual({ days: 0, hours: 1, minutes: 0, seconds: 0 });
  });

  it('correctly decomposes 1 minute', () => {
    expect(secondsToUnits(60)).toEqual({ days: 0, hours: 0, minutes: 1, seconds: 0 });
  });

  it('correctly decomposes 45 seconds', () => {
    expect(secondsToUnits(45)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 45 });
  });

  it('correctly decomposes 1 day + 2 hours + 30 min + 15 sec', () => {
    const total = 86_400 + 2 * 3_600 + 30 * 60 + 15;
    expect(secondsToUnits(total)).toEqual({ days: 1, hours: 2, minutes: 30, seconds: 15 });
  });

  it('hours unit does not exceed 23', () => {
    const result = secondsToUnits(2 * 86_400 + 23 * 3_600);
    expect(result.hours).toBe(23);
    expect(result.days).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// padTwo
// ---------------------------------------------------------------------------

describe('padTwo', () => {
  it('pads single digit with leading zero', () => {
    expect(padTwo(5)).toBe('05');
  });

  it('does not pad two-digit number', () => {
    expect(padTwo(12)).toBe('12');
  });

  it('pads zero', () => {
    expect(padTwo(0)).toBe('00');
  });

  it('handles 59', () => {
    expect(padTwo(59)).toBe('59');
  });
});

// ---------------------------------------------------------------------------
// buildAriaLabel
// ---------------------------------------------------------------------------

describe('buildAriaLabel', () => {
  const zero: CountdownUnits = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  it('returns "Unlocked" when all units are zero', () => {
    expect(buildAriaLabel(zero)).toBe('Unlocked');
  });

  it('includes days when days > 0', () => {
    expect(buildAriaLabel({ ...zero, days: 2 })).toContain('2 days');
  });

  it('uses singular "day" for 1 day', () => {
    expect(buildAriaLabel({ ...zero, days: 1 })).toContain('1 day');
    expect(buildAriaLabel({ ...zero, days: 1 })).not.toContain('1 days');
  });

  it('includes hours when hours > 0', () => {
    expect(buildAriaLabel({ ...zero, hours: 3 })).toContain('3 hours');
  });

  it('uses singular "hour" for 1 hour', () => {
    expect(buildAriaLabel({ ...zero, hours: 1 })).toContain('1 hour');
  });

  it('includes minutes when minutes > 0', () => {
    expect(buildAriaLabel({ ...zero, minutes: 45 })).toContain('45 minutes');
  });

  it('includes seconds when seconds > 0', () => {
    expect(buildAriaLabel({ ...zero, seconds: 30 })).toContain('30 seconds');
  });

  it('ends with "remaining"', () => {
    expect(buildAriaLabel({ ...zero, hours: 1 })).toMatch(/remaining$/);
  });

  it('omits zero units', () => {
    const label = buildAriaLabel({ days: 0, hours: 2, minutes: 0, seconds: 0 });
    expect(label).not.toContain('day');
    expect(label).not.toContain('minute');
    expect(label).toContain('2 hours');
  });
});

// ---------------------------------------------------------------------------
// Additional edge cases
// ---------------------------------------------------------------------------

describe('blocksToSeconds — large block counts', () => {
  it('handles 1000 blocks (over 6 days) without overflow', () => {
    expect(blocksToSeconds(1_000)).toBe(600_000);
  });

  it('is always an integer (uses Math.floor)', () => {
    const result = blocksToSeconds(7);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('secondsToUnits — rounding', () => {
  it('does not include fractional seconds', () => {
    const result = secondsToUnits(90);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(30);
  });

  it('exactly one day is 86400 seconds', () => {
    const result = secondsToUnits(86_400);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('23 hours and 59 minutes and 59 seconds is not yet a full day', () => {
    const result = secondsToUnits(86_399);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(23);
  });
});
