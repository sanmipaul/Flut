/**
 * activityHeatmapHelpers
 *
 * Internal helpers for building activity heatmap slot keys from Date objects.
 * Factored out so generateActivityHeatmap and generateWeightedActivityHeatmap
 * share a single, tested implementation.
 *
 * All functions use local time (getDay, getHours) so the heatmap reflects
 * the user's actual usage patterns rather than UTC-shifted times.
 */
import { HeatmapData } from '../components/ActivityHeatmap';

/**
 * Build a heatmap slot key from a Date.
 * Format: "{dayOfWeek}-{hour}" where dayOfWeek is 0 (Sun) – 6 (Sat)
 * and hour is 0–23. Both use local time.
 *
 * The intentionally compact format avoids zero-padding because the keys
 * are used as Map keys only — they are not displayed directly in the UI.
 * Row and col values are derived via parseSlotKey when building HeatmapData.
 *
 * @example heatmapSlotKey(new Date(2024, 2, 11, 14)) → "1-14"  (Monday 14:00)
 * @example heatmapSlotKey(new Date(2024, 2, 10, 0))  → "0-0"   (Sunday midnight)
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
 *
 * The returned array is unordered. Callers that need a specific order
 * (e.g. by day then hour) should sort the result after calling this function.
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
 *
 * Intentionally loose — any positive finite timestamp is accepted.
 * Callers that need tighter range validation (e.g. year 2000+) should
 * use `isValidTimestamp` from dateKeyUtils instead.
 */
export function isValidHeatmapTimestamp(ts: number): boolean {
  return ts > 0 && Number.isFinite(ts);
}

/**
 * The maximum number of unique heatmap slots: 7 days × 24 hours = 168.
 * Useful for pre-allocating Maps or validating result set sizes in tests.
 */
export const MAX_HEATMAP_SLOTS = 168;

/**
 * Sort HeatmapData by row (day) then col (hour) ascending.
 * Produces a deterministic order suitable for rendering a grid top-to-bottom,
 * left-to-right (Sunday hour 0 → Saturday hour 23).
 */
export function sortHeatmapData(data: HeatmapData[]): HeatmapData[] {
  return [...data].sort((a, b) => a.row - b.row || a.col - b.col);
}

/**
 * Return the top N most active heatmap slots, sorted by value descending.
 * Useful for surfacing peak activity windows in a summary UI.
 *
 * @param data - Heatmap data array (unsorted is fine)
 * @param n    - Number of top slots to return (default: 5)
 */
export function getTopActiveSlots(data: HeatmapData[], n = 5): HeatmapData[] {
  return [...data].sort((a, b) => b.value - a.value).slice(0, n);
}

/**
 * Normalise HeatmapData values to a 0–1 range based on the maximum value
 * in the array. Useful when a heatmap component expects relative intensity
 * rather than raw counts or raw amounts.
 *
 * Returns the original array unchanged when it is empty or the max is zero.
 */
export function normalizeHeatmapValues(data: HeatmapData[]): HeatmapData[] {
  if (data.length === 0) return data;
  const max = Math.max(...data.map((d) => d.value));
  if (max === 0) return data;
  return data.map((d) => ({ ...d, value: d.value / max }));
}
