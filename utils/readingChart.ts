import { isRTL } from './isRTL';
import { isWeb } from './isWeb';

const AR_WEEKDAYS = ['أحد', 'إثنين', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];

/**
 * Formats a date string for display on the reading chart's x-axis.
 *
 * @param dateStr - The date string to format.
 * @param period - The total tracking period in days.
 * @returns A formatted label string (e.g., weekday, day, or date formatting).
 */
export function formatLabel(dateStr: string, period: number): string {
  const d = new Date(dateStr);
  if (period <= 7) return AR_WEEKDAYS[d.getDay()];
  if (period <= 30) return d.getDate().toString();
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Determines whether a label should be displayed for a specific data point on the chart.
 * Minimizes chart clutter on larger periods by skipping middle labels.
 *
 * @param dateStr - The date string associated with the current index.
 * @param index - The loop index of the current item.
 * @param period - The total tracking period duration in days.
 * @returns True if the label should be visually rendered, false otherwise.
 */
export function shouldShowLabel(
  dateStr: string,
  index: number,
  period: number,
): boolean {
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
