/**
 * activityHeatmapHelpers
 *
 * Internal helpers for building activity heatmap slot keys from Date objects.
 * Factored out so generateActivityHeatmap and generateWeightedActivityHeatmap
 * share a single, tested implementation.
 */
import { HeatmapData } from '../components/ActivityHeatmap';

/**
 * Build a heatmap slot key from a Date.
 * Format: "{dayOfWeek}-{hour}" where dayOfWeek is 0 (Sun) – 6 (Sat)
 * and hour is 0–23. Both use local time.
 *
 * @example heatmapSlotKey(new Date(2024, 2, 11, 14)) → "1-14"  (Monday 14:00)
 */
export function heatmapSlotKey(date: Date): string {
  return `${date.getDay()}-${date.getHours()}`;
}

/**
 * Convert a slot key back to { row, col }.
 * This is the inverse of heatmapSlotKey and is used when building the
 * final HeatmapData array from the accumulated Map.
 */
export function parseSlotKey(key: string): { row: number; col: number } {
  const [dayStr, hourStr] = key.split('-');
  return {
    row: parseInt(dayStr, 10),
    col: parseInt(hourStr, 10),
  };
}

/**
 * Convert an accumulated slot Map into a HeatmapData array.
 * Pure function with no side effects — safe to call in useMemo.
 */
export function slotsToHeatmapData(slots: Map<string, number>): HeatmapData[] {
  return Array.from(slots.entries()).map(([key, value]) => {
    const { row, col } = parseSlotKey(key);
    return { label: key, value, row, col };
  });
}

/**
 * Returns true when a transaction timestamp is a plausible epoch value.
 * Guards against zero, NaN, negative, and Infinity.
 */
export function isValidHeatmapTimestamp(ts: number): boolean {
  return ts > 0 && Number.isFinite(ts);
}
