/**
 * dateKeyUtils
 *
 * Timezone-aware date key helpers for chart grouping.
 * All functions operate on the user's local clock so that a transaction
 * recorded at "11 pm local" is bucketed into the correct local day/hour,
 * not the UTC equivalent (which may fall in the next calendar day).
 */

// ---------------------------------------------------------------------------
// Zero-padding helper
// ---------------------------------------------------------------------------

/**
 * Zero-pad a number to at least two digits: 5 → "05", 12 → "12".
 * Numbers ≥ 100 are returned as-is since they already have sufficient width.
 */
export function padDatePart(n: number): string {
  return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Local date key builders
// ---------------------------------------------------------------------------

/**
 * Returns a local "YYYY-MM-DDTHH" key suitable for hourly chart buckets.
 * Uses local year/month/day/hour so that the bucket matches what the user
 * sees on their clock, not the UTC equivalent.
 *
 * Keys sort correctly lexicographically because all components are zero-padded.
 *
 * @example getLocalHourKey(new Date(2024, 2, 15, 23)) → "2024-03-15T23"
 * @example getLocalHourKey(new Date(2024, 0, 5, 8))   → "2024-01-05T08"
 */
export function getLocalHourKey(date: Date): string {
  const y = date.getFullYear();
  const m = padDatePart(date.getMonth() + 1);
  const d = padDatePart(date.getDate());
  const h = padDatePart(date.getHours());
  return `${y}-${m}-${d}T${h}`;
}

/**
 * Returns a local "YYYY-MM-DD" key suitable for daily chart buckets.
 *
 * The key is built from `getFullYear/getMonth/getDate` (local time) rather
 * than `toISOString().slice(0,10)` (UTC), preventing cross-day misclassification
 * for users in negative UTC offsets where local midnight differs from UTC midnight.
 *
 * @example getLocalDayKey(new Date(2024, 2, 15)) → "2024-03-15"
 * @example getLocalDayKey(new Date(2024, 0, 7))  → "2024-01-07"
 */
export function getLocalDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = padDatePart(date.getMonth() + 1);
  const d = padDatePart(date.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * Returns a local "YYYY-MM-DD" key for the Sunday that starts the week
 * containing `date`, based on local calendar.
 *
 * Uses `setDate` on a copy so the original `date` is not mutated.
 * The resulting key uses local date parts, so it is immune to the
 * UTC day-boundary shift that `toISOString().slice(0,10)` introduces.
 *
 * @example getLocalWeekStartKey(new Date(2024, 2, 15)) → "2024-03-10" (Sunday)
 */
export function getLocalWeekStartKey(date: Date): string {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return getLocalDayKey(weekStart);
}

/**
 * Returns a local "YYYY-MM" key suitable for monthly chart buckets.
 *
 * @example getLocalMonthKey(new Date(2024, 2, 15)) → "2024-03"
 */
export function getLocalMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = padDatePart(date.getMonth() + 1);
  return `${y}-${m}`;
}

/**
 * Returns a local "YYYY" key for yearly chart buckets.
 *
 * @example getLocalYearKey(new Date(2024, 2, 15)) → "2024"
 */
export function getLocalYearKey(date: Date): string {
  return String(date.getFullYear());
}

// ---------------------------------------------------------------------------
// Interval dispatch
// ---------------------------------------------------------------------------

export type ChartInterval = 'hourly' | 'daily' | 'weekly' | 'monthly';

/**
 * Returns a timezone-aware bucket key for the given interval.
 * All keys are ISO-style strings that sort correctly lexicographically.
 */
export function getIntervalKey(date: Date, interval: ChartInterval): string {
  switch (interval) {
    case 'hourly':
      return getLocalHourKey(date);
    case 'daily':
      return getLocalDayKey(date);
    case 'weekly':
      return getLocalWeekStartKey(date);
    case 'monthly':
      return getLocalMonthKey(date);
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Earliest accepted timestamp: 2000-01-01T00:00:00Z */
const MIN_VALID_TS = 946_684_800_000;
/** Latest accepted timestamp: 2200-01-01T00:00:00Z */
const MAX_VALID_TS = 7_258_118_400_000;

/**
 * Returns true when the timestamp is a finite, positive number that represents
 * a plausible Unix epoch value (after year 2000 and before year 2200).
 *
 * Rejects NaN, Infinity, zero, negative values, and timestamps for
 * dates that are clearly invalid (pre-2000 or far-future).
 */
export function isValidTimestamp(ts: number): boolean {
  return Number.isFinite(ts) && ts > MIN_VALID_TS && ts < MAX_VALID_TS;
}

/**
 * Returns a local "YYYY-MM-DD" string for a timestamp using local date parts.
 * Useful for display labels in cumulative volume charts.
 *
 * Unlike `new Date(ts).toLocaleDateString()`, the output format is always
 * "YYYY-MM-DD" and does not depend on the user's locale or browser settings.
 * This makes labels consistent and sortable across environments.
 */
export function toLocalISODate(timestamp: number): string {
  return getLocalDayKey(new Date(timestamp));
}

/**
 * Returns a local "YYYY-MM" string for a timestamp using local date parts.
 *
 * Unlike `toISOString().slice(0, 7)`, uses the local month rather than UTC,
 * so a transaction at 23:30 local on Dec 31 is grouped into December,
 * not January of the next year if UTC is ahead.
 */
export function toLocalISOMonth(timestamp: number): string {
  return getLocalMonthKey(new Date(timestamp));
}
