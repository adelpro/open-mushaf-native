import { isRTL } from './isRTL';
import { isWeb } from './isWeb';

const AR_WEEKDAYS = ['أحد', 'إثنين', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];

// Build 12 month names from the device's locale. Intl.DateTimeFormat is
// supported in Hermes (RN 0.70+) and picks up the device locale by default.
// Falls back to Modern Standard Arabic if Intl is unavailable (e.g. JSC on
// a very old device). Computing once at module load keeps the per-render
// hot path in `formatLabel` as cheap as a plain array lookup.
const MONTH_NAMES: readonly string[] = (() => {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, { month: 'long' });
    // Anchor dates are arbitrary; only the month field matters, so any day
    // in each month produces the localized name.
    return Array.from({ length: 12 }, (_, i) =>
      fmt.format(new Date(2026, i, 15)),
    );
  } catch {
    return [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
  }
})();

// Localized digit formatter: respects the device locale (Arabic → ٠-٩,
// Persian → ۰-۹, otherwise Western 0-9). Same Hermes 0.70+ / Intl story
// as MONTH_NAMES above; cached at module load so the per-render hot path
// in `formatLabel` is a single function call.
const toLocalDigits: (n: number) => string = (() => {
  try {
    const fmt = new Intl.NumberFormat(undefined);
    return (n: number) => fmt.format(n);
  } catch {
    return (n: number) => String(n);
  }
})();

type GroupBy = 'day' | 'week' | 'month';
type ChartLabel = { primary: string; secondary?: string };

/**
 * Formats a date for display on the reading chart's x-axis.
 *
 * For weekly-aggregated bars the primary label is the day range "D-D".
 * The optional `secondary` line is shared between two signals (only one
 * fires at a time):
 *   - month boundary  → end-month name (`يونيو`, `يوليو`, …)
 *   - partial bucket  → `N أيام` caption when `daysInBucket < 7`
 * Month-boundary wins because a partial trailing week is always within
 * the same calendar month as the previous full week.
 *
 * @param d - The chart record. `weekStart` is required only for weekly buckets.
 * @param period - The total tracking period in days.
 * @param groupBy - Granularity used to render the bars.
 * @returns A `ChartLabel` with `primary` text and optional `secondary` line.
 */
export function formatLabel(
  d: { date: string; weekStart?: string; daysInBucket?: number },
  period: number,
  groupBy: GroupBy = 'day',
): ChartLabel {
  const end = new Date(d.date);

  if (period <= 7) return { primary: AR_WEEKDAYS[end.getDay()] };

  if (groupBy === 'month') {
    const start = d.weekStart ? new Date(d.weekStart) : end;
    const primary = `${toLocalDigits(start.getDate())}-${toLocalDigits(end.getDate())}`;
    // Secondary line prefers year (Dec → Jan bucket) over month so the
    // year is always visible when the bucket crosses a year boundary.
    let secondary: string | undefined;
    if (start.getFullYear() !== end.getFullYear()) {
      secondary = toLocalDigits(end.getFullYear());
    } else if (start.getMonth() !== end.getMonth()) {
      secondary = MONTH_NAMES[end.getMonth()];
    } else if (d.daysInBucket !== undefined && d.daysInBucket < 30) {
      // Defensive: today the 90-day period is a multiple of 30 so partial
      // monthly buckets never render, but the path is here for parity
      // with the weekly partial-bucket treatment.
      secondary = `${toLocalDigits(d.daysInBucket)} أيام`;
    }
    return { primary, secondary };
  }

  if (groupBy === 'week') {
    const start = d.weekStart ? new Date(d.weekStart) : end;
    const primary = `${toLocalDigits(start.getDate())}-${toLocalDigits(end.getDate())}`;
    let secondary: string | undefined;
    if (start.getMonth() !== end.getMonth()) {
      secondary = MONTH_NAMES[end.getMonth()];
    } else if (d.daysInBucket !== undefined && d.daysInBucket < 7) {
      secondary = `${toLocalDigits(d.daysInBucket)} أيام`;
    }
    return { primary, secondary };
  }

  if (period <= 30) return { primary: toLocalDigits(end.getDate()) };
  return {
    primary: `${toLocalDigits(end.getMonth() + 1)}/${toLocalDigits(end.getDate())}`,
  };
}

/**
 * Determines whether a label should be displayed for a specific data point on the chart.
 * Minimizes chart clutter on larger periods by skipping middle labels.
 *
 * For weekly-aggregated bars there are at most ~13 labels (for a 90-day
 * window) — short enough that hiding them produces a chart where most
 * bars look unlabeled. Show all weekly labels so the user can read every
 * bucket; for 90-day daily the original day-1/day-15 anchor rule still
 * keeps the axis legible.
 *
 * @param dateStr - The date string associated with the current index.
 * @param index - The loop index of the current item.
 * @param period - The total tracking period duration in days.
 * @param groupBy - When `'week'`, every label is shown (independent of `period`).
 * @returns True if the label should be visually rendered, false otherwise.
 */
export function shouldShowLabel(
  dateStr: string,
  index: number,
  period: number,
  groupBy: GroupBy = 'day',
): boolean {
  if (groupBy === 'week' || groupBy === 'month') return true;
  if (period <= 7) return true;
  if (period <= 30)
    return index % 5 === 0 || index === 0 || index === period - 1;
  const d = new Date(dateStr);
  return d.getDate() === 1 || d.getDate() === 15 || index === period - 1;
}

/**
 * Calculates a human-readable date string for a date that occurred N days ago.
 *
 * @param n - The number of days to subtract from the current date.
 * @returns A string representation (toDateString) of the calculated past date.
 */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toDateString();
}

/**
 * Determines positional styling required depending on the environment (web/RTL).
 *
 * @param x - The x-coordinate target position.
 * @returns A style object using either `left` or `right` alignment.
 */
export const getPosStyle = (x: number) => {
  if (isWeb) return { left: x };
  return isRTL ? { right: x } : { left: x };
};
