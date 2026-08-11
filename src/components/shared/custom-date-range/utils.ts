import {
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import type { DateRangeApiPayload, DateRangePreset, DateRangeValue } from "./types";

export function getDefaultDateRange(): DateRangeValue {
  const today = new Date();
  const todayEnd = endOfDay(today);
  const monthEnd = endOfMonth(today);
  return {
    startDate: startOfMonth(today),
    endDate: monthEnd > todayEnd ? todayEnd : monthEnd,
  };
}

export function normalizeRange(start: Date, end: Date): DateRangeValue {
  const startDate = startOfDay(start <= end ? start : end);
  const endDate = endOfDay(start <= end ? end : start);
  return { startDate, endDate };
}

export function toDateRangePayload(range: DateRangeValue): DateRangeApiPayload {
  return {
    start_date: format(range.startDate, "yyyy-MM-dd"),
    end_date: format(range.endDate, "yyyy-MM-dd"),
  };
}

export function getPresetRange(preset: Exclude<DateRangePreset, "custom">): DateRangeValue {
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(today);

  switch (preset) {
    case "today":
      return { startDate: today, endDate: todayEnd };
    case "yesterday": {
      const yesterday = subDays(today, 1);
      return { startDate: yesterday, endDate: endOfDay(yesterday) };
    }
    case "last7":
      return { startDate: subDays(today, 6), endDate: todayEnd };
    case "last30":
      return { startDate: subDays(today, 29), endDate: todayEnd };
    case "month": {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      return {
        startDate: monthStart,
        endDate: monthEnd > todayEnd ? todayEnd : monthEnd,
      };
    }
    case "year": {
      const yearStart = startOfYear(today);
      const yearEnd = endOfYear(today);
      return {
        startDate: yearStart,
        endDate: yearEnd > todayEnd ? todayEnd : yearEnd,
      };
    }
    default:
      return getDefaultDateRange();
  }
}

export function formatRangeLabel(range: DateRangeValue | null | undefined): string {
  if (!range?.startDate || !range?.endDate) return "Select Date";

  const { startDate, endDate } = range;
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (isSameDay(start, end)) {
    if (isSameDay(start, today)) return `Today, ${format(start, "d MMM")}`;
    if (isSameDay(start, yesterday)) return `Yesterday, ${format(start, "d MMM")}`;
    return format(start, "dd MMM, yyyy");
  }

  const spanDays = differenceInCalendarDays(end, start) + 1;
  if (
    spanDays >= 27 &&
    isSameMonth(start, end) &&
    isSameYear(start, end) &&
    start.getDate() === 1 &&
    end.getDate() === endOfMonth(end).getDate()
  ) {
    return format(start, "MMM, yyyy");
  }

  if (
    start.getMonth() === 0 &&
    start.getDate() === 1 &&
    end.getMonth() === 11 &&
    end.getDate() === 31 &&
    isSameYear(start, end)
  ) {
    return format(start, "yyyy");
  }

  if (isSameMonth(start, end)) {
    return `${format(start, "dd")} – ${format(end, "dd MMM, yyyy")}`;
  }

  return `${format(start, "dd MMM")} – ${format(end, "dd MMM, yyyy")}`;
}

export const FULL_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "custom", label: "Custom" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7", label: "Last 7 Days" },
  { id: "last30", label: "Last 30 Days" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export const MONTH_YEAR_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];
