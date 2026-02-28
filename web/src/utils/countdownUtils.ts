/**
 * countdownUtils
 *
 * Pure functions for converting block heights into time values used by the
 * VaultCountdown component. All functions are deterministic and side-effect free.
 */
import { SECONDS_PER_BLOCK } from '../types/Countdown';
import type { CountdownUnits } from '../types/Countdown';

/**
 * Convert a number of remaining blocks into total seconds.
 * Returns 0 for non-positive block counts.
 */
export function blocksToSeconds(blocks: number): number {
  if (blocks <= 0) return 0;
  return Math.floor(blocks * SECONDS_PER_BLOCK);
}

/**
 * Break total seconds into days / hours / minutes / seconds display units.
 * Each unit is the remainder after the larger unit is extracted.
 */
export function secondsToUnits(totalSeconds: number): CountdownUnits {
  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/**
 * Zero-pad a number to at least two digits: 5 → "05", 12 → "12".
 */
export function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Build a plain-English aria-label from CountdownUnits.
 * Only includes non-zero segments so it stays concise.
 * Returns "Unlocked" when all units are zero.
 */
export function buildAriaLabel(units: CountdownUnits): string {
  const parts: string[] = [];
  if (units.days > 0)    parts.push(`${units.days} day${units.days !== 1 ? 's' : ''}`);
  if (units.hours > 0)   parts.push(`${units.hours} hour${units.hours !== 1 ? 's' : ''}`);
  if (units.minutes > 0) parts.push(`${units.minutes} minute${units.minutes !== 1 ? 's' : ''}`);
  if (units.seconds > 0) parts.push(`${units.seconds} second${units.seconds !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(' ') + ' remaining' : 'Unlocked';
}
