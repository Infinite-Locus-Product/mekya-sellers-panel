/**
 * Period-over-period comparison for the dashboard KPI cards.
 *
 * The KPI endpoints (`/seller/analytics`, `/seller/orders/returns/kpis`) are already
 * date-range scoped, so the previous period is derived here and fetched with the same
 * calls rather than adding a parallel set of API fields.
 */

export type TrendDirection = "positive" | "negative" | "neutral";

export interface Trend {
  /** Signed percentage change, or null when it cannot be expressed (see percentChange). */
  percent: number | null;
  direction: TrendDirection;
}

/** ISO `YYYY-MM-DD` date range, matching what the KPI endpoints accept. */
export interface DateRange {
  start_date: string;
  end_date: string;
}

const MS_PER_DAY = 86_400_000;

/**
 * The equal-length period ending the day before `start_date` — the same rule the backend's
 * `previous_dashboard_period` uses, so a card's trend agrees with the analytics modals.
 *
 * Dates are treated as plain calendar days in UTC, never local time: the inputs are date-only
 * strings, and parsing them as local midnight would shift the window by a day for anyone east
 * or west of UTC.
 */
export function previousPeriod(range: DateRange): DateRange | null {
  const start = Date.parse(`${range.start_date}T00:00:00Z`);
  const end = Date.parse(`${range.end_date}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

  const lengthDays = Math.round((end - start) / MS_PER_DAY) + 1;
  const prevEnd = start - MS_PER_DAY;
  const prevStart = prevEnd - (lengthDays - 1) * MS_PER_DAY;
  return {
    start_date: new Date(prevStart).toISOString().slice(0, 10),
    end_date: new Date(prevEnd).toISOString().slice(0, 10),
  };
}

/**
 * Signed percent change from `previous` to `current`.
 *
 * Returns `percent: null` when the previous period was zero but the current is not: the change
 * is infinite, and rendering "+100%" or "+∞%" would both be lies. Callers hide the pill in that
 * case rather than inventing a number.
 */
export function percentChange(current: number, previous: number): Trend {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return { percent: null, direction: "neutral" };
  }
  if (previous <= 0) {
    // No baseline to divide by. Equal-and-zero is a real 0% though, not an unknown.
    if (current <= 0) return { percent: 0, direction: "neutral" };
    return { percent: null, direction: "positive" };
  }
  const raw = ((current - previous) / previous) * 100;
  const percent = Math.round(raw * 10) / 10;
  if (percent > 0) return { percent, direction: "positive" };
  if (percent < 0) return { percent, direction: "negative" };
  return { percent: 0, direction: "neutral" };
}

/**
 * KPICard `change` text, e.g. `"+12.5% From Previous Period"`. KPICard splits on `" From "` to
 * render the percentage in a coloured arrow pill and the rest as a muted label.
 *
 * Returns null when there is no comparable number, so the caller omits `change` entirely and the
 * card renders without a pill instead of showing an empty or misleading one.
 */
export function formatTrend(trend: Trend | null | undefined): string | null {
  if (!trend || trend.percent === null) return null;
  const sign = trend.percent > 0 ? "+" : "";
  return `${sign}${trend.percent}% From Previous Period`;
}

/** KPICard only distinguishes positive from negative; neutral reads as positive (a grey 0%). */
export function trendChangeType(trend: Trend | null | undefined): "positive" | "negative" {
  return trend?.direction === "negative" ? "negative" : "positive";
}

/**
 * Identity of a fetched baseline: its period plus the channel it was scoped to.
 *
 * A cached previous-period payload is only comparable against the current figures if it was
 * fetched for the matching period *and* channel — otherwise switching the channel filter would
 * compare this channel's value against the other one's baseline.
 */
export function periodKey(range: DateRange, channel?: string | null): string {
  return `${range.start_date}..${range.end_date}::${channel ?? "all"}`;
}
