export interface DateRange {
  date_from?: string;
  date_to?: string;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

/** Converts a preset date-range dropdown value (e.g. "today", "this_week") into ISO date_from/date_to bounds. */
export function presetToDateRange(preset: string): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return { date_from: startOfDay(now).toISOString(), date_to: endOfDay(now).toISOString() };
    case "yesterday": {
      const y = addDays(now, -1);
      return { date_from: startOfDay(y).toISOString(), date_to: endOfDay(y).toISOString() };
    }
    case "last_7_days":
      return {
        date_from: startOfDay(addDays(now, -6)).toISOString(),
        date_to: endOfDay(now).toISOString(),
      };
    case "last_30_days":
      return {
        date_from: startOfDay(addDays(now, -29)).toISOString(),
        date_to: endOfDay(now).toISOString(),
      };
    case "this_week": {
      const weekStart = addDays(now, -now.getDay());
      return { date_from: startOfDay(weekStart).toISOString(), date_to: endOfDay(now).toISOString() };
    }
    case "last_week": {
      const thisWeekStart = addDays(now, -now.getDay());
      const lastWeekStart = addDays(thisWeekStart, -7);
      const lastWeekEnd = addDays(thisWeekStart, -1);
      return {
        date_from: startOfDay(lastWeekStart).toISOString(),
        date_to: endOfDay(lastWeekEnd).toISOString(),
      };
    }
    case "this_month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { date_from: startOfDay(monthStart).toISOString(), date_to: endOfDay(now).toISOString() };
    }
    case "last_month": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        date_from: startOfDay(lastMonthStart).toISOString(),
        date_to: endOfDay(lastMonthEnd).toISOString(),
      };
    }
    default:
      return {};
  }
}
