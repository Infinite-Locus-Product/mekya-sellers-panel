export interface DateRange {
  date_from?: string;
  date_to?: string;
}

const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * A date as the *viewer's* calendar day, `YYYY-MM-DD`.
 *
 * Deliberately not `toISOString()`. The API filters on a bare date — it takes the first ten
 * characters of whatever it is sent and compares that to Saleor's `created` date — so an
 * instant converted to UTC first loses a day for every timezone ahead of it. In IST, local
 * midnight on the 7th is `2026-09-06T18:30:00Z`, whose first ten characters are the 6th:
 * "Today" then returned two days of orders, "This Week" started a day early, and "This
 * Month" reached back into the previous month. Reading as "the date filter does nothing".
 *
 * Building the string from the local components keeps the day the user actually picked.
 */
const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/**
 * Converts a preset date-range dropdown value (e.g. "today", "this_week") into inclusive
 * `date_from`/`date_to` calendar-day bounds. An unknown preset — including "all_dates" —
 * returns an empty range, which the callers send as no date filter at all.
 *
 * Both bounds are inclusive whole days, so a single-day preset sends the same date twice
 * rather than a start-of-day/end-of-day pair; the API's granularity is the day.
 */
export function presetToDateRange(preset: string): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return { date_from: localDate(now), date_to: localDate(now) };
    case "yesterday": {
      const y = addDays(now, -1);
      return { date_from: localDate(y), date_to: localDate(y) };
    }
    case "last_7_days":
      return { date_from: localDate(addDays(now, -6)), date_to: localDate(now) };
    case "last_30_days":
      return { date_from: localDate(addDays(now, -29)), date_to: localDate(now) };
    case "this_week": {
      // Week starts Sunday, matching getDay() === 0.
      const weekStart = addDays(now, -now.getDay());
      return { date_from: localDate(weekStart), date_to: localDate(now) };
    }
    case "last_week": {
      const thisWeekStart = addDays(now, -now.getDay());
      return {
        date_from: localDate(addDays(thisWeekStart, -7)),
        date_to: localDate(addDays(thisWeekStart, -1)),
      };
    }
    case "this_month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { date_from: localDate(monthStart), date_to: localDate(now) };
    }
    case "last_month": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      // Day 0 of this month is the last day of the previous one.
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { date_from: localDate(lastMonthStart), date_to: localDate(lastMonthEnd) };
    }
    default:
      return {};
  }
}
