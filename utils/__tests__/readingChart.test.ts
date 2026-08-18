import { afterEach, describe, expect, it, vi } from 'vitest';

import { daysAgo, formatLabel, shouldShowLabel } from '@/utils/readingChart';

// `formatLabel` renders month names and digits through `Intl`, which follows
// the *device* locale — Arabic on an Arabic phone, English in CI. Asserting
// literal strings would make these tests pass or fail based on the runner's
// ICU default, so the expectations are built with the same Intl calls the
// implementation uses. What is under test is *which* month and *which*
// number the label picks, not how the platform spells them.
const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat(undefined, { month: 'long' }).format(
    new Date(year, month, 15),
  );
const digits = (n: number) => new Intl.NumberFormat(undefined).format(n);

/** `toDateString()` for a local calendar date, the format the chart stores. */
const dateStr = (year: number, month: number, dayOfMonth: number) =>
  new Date(year, month, dayOfMonth).toDateString();

afterEach(() => {
  vi.useRealTimers();
});

describe('formatLabel', () => {
  describe('7-day period', () => {
    // Sun Jun 14 2026 through Sat Jun 20 2026 is a full week.
    const WEEKDAYS = ['أحد', 'إثنين', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];

    it('labels each day with its Arabic weekday name', () => {
      WEEKDAYS.forEach((name, i) => {
        expect(formatLabel({ date: dateStr(2026, 5, 14 + i) }, 7)).toEqual({
          primary: name,
        });
      });
    });

    it('keeps weekday names even if a grouping is passed', () => {
      // The group-by toggle is hidden below 8 days, but a stale selection
      // must not change the axis.
      expect(
        formatLabel(
          { date: dateStr(2026, 5, 15), weekStart: dateStr(2026, 5, 9) },
          7,
          'week',
        ),
      ).toEqual({ primary: 'إثنين' });
    });
  });

  describe('daily bars', () => {
    it('shows the day of the month for a 30-day period', () => {
      expect(formatLabel({ date: dateStr(2026, 5, 8) }, 30)).toEqual({
        primary: digits(8),
      });
    });

    it('shows month/day for a 90-day period', () => {
      expect(formatLabel({ date: dateStr(2026, 5, 8) }, 90)).toEqual({
        primary: `${digits(6)}/${digits(8)}`,
      });
    });
  });

  describe('weekly bars', () => {
    it('labels a full in-month week as a bare day range', () => {
      expect(
        formatLabel(
          {
            date: dateStr(2026, 5, 13),
            weekStart: dateStr(2026, 5, 7),
            daysInBucket: 7,
          },
          30,
          'week',
        ),
      ).toEqual({
        primary: `${digits(7)}-${digits(13)}`,
        secondary: undefined,
      });
    });

    it('names the end month when the week crosses a month boundary', () => {
      // Sun Jun 28 2026 → Sat Jul 04 2026.
      expect(
        formatLabel(
          {
            date: dateStr(2026, 6, 4),
            weekStart: dateStr(2026, 5, 28),
            daysInBucket: 7,
          },
          30,
          'week',
        ),
      ).toEqual({
        primary: `${digits(28)}-${digits(4)}`,
        secondary: monthName(2026, 6),
      });
    });

    it('captions a short trailing bucket with its day count', () => {
      expect(
        formatLabel(
          {
            date: dateStr(2026, 5, 15),
            weekStart: dateStr(2026, 5, 14),
            daysInBucket: 2,
          },
          30,
          'week',
        ),
      ).toEqual({
        primary: `${digits(14)}-${digits(15)}`,
        secondary: `${digits(2)} أيام`,
      });
    });

    it('prefers the month name over the day count when both apply', () => {
      // A partial bucket that also crosses into July: only one secondary
      // line fits, and the month is the more useful signal.
      expect(
        formatLabel(
          {
            date: dateStr(2026, 6, 2),
            weekStart: dateStr(2026, 5, 30),
            daysInBucket: 3,
          },
          90,
          'week',
        ).secondary,
      ).toBe(monthName(2026, 6));
    });

    it('falls back to the end date when no weekStart is present', () => {
      expect(formatLabel({ date: dateStr(2026, 5, 15) }, 30, 'week')).toEqual({
        primary: `${digits(15)}-${digits(15)}`,
        secondary: undefined,
      });
    });
  });

  describe('monthly bars', () => {
    it('names the end month when the bucket crosses a month boundary', () => {
      // A 30-day bucket practically always spans two calendar months.
      expect(
        formatLabel(
          {
            date: dateStr(2026, 5, 15),
            weekStart: dateStr(2026, 4, 17),
            daysInBucket: 30,
          },
          90,
          'month',
        ),
      ).toEqual({
        primary: `${digits(17)}-${digits(15)}`,
        secondary: monthName(2026, 5),
      });
    });

    it('prefers the year over the month across a year boundary', () => {
      // Thu Dec 18 2025 → Fri Jan 16 2026: the year is the only label that
      // disambiguates this bucket from the same dates a year earlier.
      expect(
        formatLabel(
          {
            date: dateStr(2026, 0, 16),
            weekStart: dateStr(2025, 11, 18),
            daysInBucket: 30,
          },
          90,
          'month',
        ),
      ).toEqual({
        primary: `${digits(18)}-${digits(16)}`,
        secondary: digits(2026),
      });
    });

    it('captions a short trailing bucket that stays inside one month', () => {
      expect(
        formatLabel(
          {
            date: dateStr(2026, 5, 10),
            weekStart: dateStr(2026, 5, 1),
            daysInBucket: 10,
          },
          90,
          'month',
        ),
      ).toEqual({
        primary: `${digits(1)}-${digits(10)}`,
        secondary: `${digits(10)} أيام`,
      });
    });

    it('adds no caption to a full in-month bucket', () => {
      expect(
        formatLabel(
          {
            date: dateStr(2026, 0, 30),
            weekStart: dateStr(2026, 0, 1),
            daysInBucket: 30,
          },
          90,
          'month',
        ).secondary,
      ).toBeUndefined();
    });
  });
});

describe('shouldShowLabel', () => {
  it('labels every bar of a 7-day period', () => {
    for (let i = 0; i < 7; i++) {
      expect(shouldShowLabel(dateStr(2026, 5, 9 + i), i, 7)).toBe(true);
    }
  });

  it('labels every fifth bar plus the last one at 30 days', () => {
    const shown = Array.from({ length: 30 }, (_, i) =>
      shouldShowLabel(dateStr(2026, 5, 1), i, 30),
    )
      .map((visible, i) => (visible ? i : -1))
      .filter((i) => i >= 0);

    expect(shown).toEqual([0, 5, 10, 15, 20, 25, 29]);
  });

  it('anchors 90-day labels to the 1st, the 15th, and the final bar', () => {
    expect(shouldShowLabel(dateStr(2026, 5, 1), 12, 90)).toBe(true);
    expect(shouldShowLabel(dateStr(2026, 5, 15), 26, 90)).toBe(true);
    expect(shouldShowLabel(dateStr(2026, 5, 7), 18, 90)).toBe(false);
    // The most recent bar is always labelled, whatever date it falls on.
    expect(shouldShowLabel(dateStr(2026, 5, 7), 89, 90)).toBe(true);
  });

  it('labels every grouped bucket regardless of period', () => {
    // Grouped views have at most ~13 bars, so thinning them would leave most
    // buckets unlabelled.
    expect(shouldShowLabel(dateStr(2026, 5, 7), 3, 90, 'week')).toBe(true);
    expect(shouldShowLabel(dateStr(2026, 5, 7), 1, 90, 'month')).toBe(true);
  });
});

describe('daysAgo', () => {
  const freeze = (year: number, month: number, dayOfMonth: number) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(year, month, dayOfMonth, 12, 0, 0));
  };

  it('returns today for an offset of zero', () => {
    freeze(2026, 5, 15);

    expect(daysAgo(0)).toBe(dateStr(2026, 5, 15));
  });

  it('walks back across a month boundary', () => {
    freeze(2026, 5, 1); // Mon Jun 01 2026

    expect(daysAgo(1)).toBe(dateStr(2026, 4, 31));
    expect(daysAgo(2)).toBe(dateStr(2026, 4, 30));
  });

  it('walks back across a year boundary', () => {
    freeze(2026, 0, 1); // Thu Jan 01 2026

    expect(daysAgo(1)).toBe(dateStr(2025, 11, 31));
    expect(daysAgo(1)).toContain('2025');
  });

  it('walks back across a leap day', () => {
    freeze(2028, 2, 1); // Wed Mar 01 2028, a leap year

    expect(daysAgo(1)).toBe(dateStr(2028, 1, 29));
  });

  it('produces a contiguous run over a full 90-day window', () => {
    freeze(2026, 5, 15);

    const dates = Array.from({ length: 90 }, (_, i) => daysAgo(89 - i));

    expect(new Set(dates).size).toBe(90);
    expect(dates[89]).toBe(dateStr(2026, 5, 15));
    dates.forEach((d, i) => {
      if (i === 0) return;
      const gap = Date.parse(d) - Date.parse(dates[i - 1]);
      expect(gap).toBe(24 * 60 * 60 * 1000);
    });
  });

  it('is unaffected by the time of day', () => {
    freeze(2026, 5, 15);
    const atNoon = daysAgo(1);

    vi.setSystemTime(new Date(2026, 5, 15, 23, 59, 59));
    expect(daysAgo(1)).toBe(atNoon);

    vi.setSystemTime(new Date(2026, 5, 15, 0, 0, 1));
    expect(daysAgo(1)).toBe(atNoon);
  });
});
