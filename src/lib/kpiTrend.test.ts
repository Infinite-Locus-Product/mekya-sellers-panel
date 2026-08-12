import { describe, it, expect } from "vitest";
import {
  formatTrend,
  percentChange,
  periodKey,
  previousPeriod,
  trendChangeType,
} from "./kpiTrend";

describe("previousPeriod", () => {
  it("returns the equal-length window ending the day before", () => {
    expect(previousPeriod({ start_date: "2026-08-08", end_date: "2026-08-14" })).toEqual({
      start_date: "2026-08-01",
      end_date: "2026-08-07",
    });
  });

  it("handles a single-day range", () => {
    expect(previousPeriod({ start_date: "2026-08-11", end_date: "2026-08-11" })).toEqual({
      start_date: "2026-08-10",
      end_date: "2026-08-10",
    });
  });

  it("crosses month and year boundaries", () => {
    // Jan 1–31 is 31 days, so the preceding 31-day window is Dec 1–31.
    expect(previousPeriod({ start_date: "2026-01-01", end_date: "2026-01-31" })).toEqual({
      start_date: "2025-12-01",
      end_date: "2025-12-31",
    });
  });

  it("spans a leap day without drifting", () => {
    // Feb 2028 has 29 days; the previous 29-day window must land on Jan 3 – Jan 31.
    expect(previousPeriod({ start_date: "2028-02-01", end_date: "2028-02-29" })).toEqual({
      start_date: "2028-01-03",
      end_date: "2028-01-31",
    });
  });

  it("rejects a reversed or unparseable range rather than inventing one", () => {
    expect(previousPeriod({ start_date: "2026-08-14", end_date: "2026-08-08" })).toBeNull();
    expect(previousPeriod({ start_date: "", end_date: "2026-08-08" })).toBeNull();
    expect(previousPeriod({ start_date: "not-a-date", end_date: "2026-08-08" })).toBeNull();
  });
});

describe("percentChange", () => {
  it("computes a rise and a fall to one decimal", () => {
    expect(percentChange(1125, 1000)).toEqual({ percent: 12.5, direction: "positive" });
    expect(percentChange(979, 1000)).toEqual({ percent: -2.1, direction: "negative" });
  });

  it("reports no change as neutral zero", () => {
    expect(percentChange(500, 500)).toEqual({ percent: 0, direction: "neutral" });
  });

  it("treats both-zero as a real 0%, not an unknown", () => {
    expect(percentChange(0, 0)).toEqual({ percent: 0, direction: "neutral" });
  });

  it("returns null percent when there is no baseline to divide by", () => {
    // Growth from zero is infinite — "+100%" would be a fabrication.
    expect(percentChange(42, 0)).toEqual({ percent: null, direction: "positive" });
  });

  it("guards against non-finite inputs", () => {
    expect(percentChange(Number.NaN, 10).percent).toBeNull();
    expect(percentChange(10, Number.POSITIVE_INFINITY).percent).toBeNull();
  });
});

describe("formatTrend", () => {
  it("signs a positive value and appends the period label", () => {
    expect(formatTrend({ percent: 12.5, direction: "positive" })).toBe(
      "+12.5% From Previous Period",
    );
  });

  it("keeps the minus sign on a fall", () => {
    expect(formatTrend({ percent: -2.1, direction: "negative" })).toBe(
      "-2.1% From Previous Period",
    );
  });

  it("renders a flat period as 0%", () => {
    expect(formatTrend({ percent: 0, direction: "neutral" })).toBe("0% From Previous Period");
  });

  it("returns null when there is nothing comparable, so the card omits the pill", () => {
    expect(formatTrend({ percent: null, direction: "positive" })).toBeNull();
    expect(formatTrend(null)).toBeNull();
    expect(formatTrend(undefined)).toBeNull();
  });
});

describe("trendChangeType", () => {
  it("maps direction onto KPICard's two-state prop", () => {
    expect(trendChangeType({ percent: -1, direction: "negative" })).toBe("negative");
    expect(trendChangeType({ percent: 1, direction: "positive" })).toBe("positive");
    // KPICard has no neutral styling; grey-zero reads as positive.
    expect(trendChangeType({ percent: 0, direction: "neutral" })).toBe("positive");
    expect(trendChangeType(null)).toBe("positive");
  });
});

describe("periodKey", () => {
  it("distinguishes periods", () => {
    const a = periodKey({ start_date: "2026-08-01", end_date: "2026-08-07" });
    const b = periodKey({ start_date: "2026-08-08", end_date: "2026-08-14" });
    expect(a).not.toBe(b);
  });

  it("distinguishes channels, so a b2b baseline is never compared against b2c", () => {
    const range = { start_date: "2026-08-01", end_date: "2026-08-07" };
    expect(periodKey(range, "b2b")).not.toBe(periodKey(range, "b2c"));
    expect(periodKey(range, null)).toBe(periodKey(range, undefined));
  });
});
