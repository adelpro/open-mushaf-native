/**
 * Single source of truth for the user's daily-tracker reading progress.
 *
 * Why a derived value and not the `dailyTrackerCompleted.value` atom?
 * `dailyTrackerCompleted.value` was originally meant to be incremented
 * as the user read pages, but no writer was ever wired up — it stayed
 * pinned at 0 (or whatever value the day-change reset wrote). Every
 * consumer that read it (TopMenu ring, tracker screen bar, Android
 * widget, day-change archive, reading-chart today-slot) therefore
 * showed 0 even after the user had read pages. The page difference
 * `currentSavedPage - yesterdayPage.value` is the actual progress
 * signal the rest of the tracker already trusts (`useDailyTrackerReset`
 * computes it as `pagesRead`); converting it to hizbs gives us a
 * consistent reading for every UI surface.
 */

/** Total mushaf pages (matches `assets/quran-metadata/.../specs.json`). */
export const TOTAL_MUSHAF_PAGES = 604;

/** Total hizbs in the mushaf (1..60). */
export const TOTAL_HIZBS = 60;

/** Pages per hizb (604 / 60). Used to convert a page delta to a hizb delta. */
export const PAGES_PER_HIZB = TOTAL_MUSHAF_PAGES / TOTAL_HIZBS;

/**
 * Hizbs the user has read so far today.
 *
 * Computed as `(currentSavedPage - yesterdayPage.value) * 60 / 604`,
 * clamped to a non-negative number. Used by every UI that needs to
 * display or archive today's reading.
 *
 * @param currentSavedPage - The user's current page (1..604).
 * @param yesterdayPageValue - The page recorded at the end of the
 *   previous day. Falls back to the same value as `currentSavedPage`
 *   (zero progress) when undefined is passed.
 * @returns Number of hizbs read today, never negative.
 */
export function getTodayHizbsRead(
  currentSavedPage: number,
  yesterdayPageValue: number | undefined,
): number {
  const pagesRead = Math.max(
    0,
    currentSavedPage - (yesterdayPageValue ?? currentSavedPage),
  );
  return pagesRead / PAGES_PER_HIZB;
}

/**
 * Fraction in [0, 1] representing how much of `dailyTrackerGoal` (a
 * hizb count) the user has read today. Returns 0 when goal is not set.
 */
export function getTodayProgressFraction(
  currentSavedPage: number,
  yesterdayPageValue: number | undefined,
  dailyTrackerGoal: number,
): number {
  if (dailyTrackerGoal <= 0) return 0;
  return Math.min(
    1,
    getTodayHizbsRead(currentSavedPage, yesterdayPageValue) / dailyTrackerGoal,
  );
}
