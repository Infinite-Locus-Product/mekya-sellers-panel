import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { presetToDateRange } from "./dateRangePreset";

/**
 * The B2B/B2C order date filter appeared to do nothing.
 *
 * The presets returned `toISOString()` instants, but the API filters on a bare date — it
 * takes the first ten characters of what it is sent and compares that to Saleor's `created`
 * date. Converting a local midnight to UTC first loses a day for every timezone ahead of
 * UTC. In IST, local midnight on the 7th is `2026-09-06T18:30:00Z`, whose first ten
 * characters are the 6th, so "Today" returned two days of orders and "This Month" reached
 * back into August.
 *
 * These tests run at a fixed local instant. `date_from`/`date_to` must name the days the
 * viewer picked, whatever the offset between local time and UTC.
 */

// Mon 07 Sep 2026, 00:30 local. Chosen because it is *before* 05:30, so any UTC conversion
// lands on the previous day and the regression would be unmistakable.
const LOCAL_NOW = new Date(2026, 8, 7, 0, 30, 0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(LOCAL_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("presetToDateRange", () => {
  it("sends today as the local calendar day, not a UTC instant", () => {
    expect(presetToDateRange("today")).toEqual({
      date_from: "2026-09-07",
      date_to: "2026-09-07",
    });
  });

  it("never emits a timestamp", () => {
    // A "T" in the value is the bug: the API keeps only the first ten characters, so any
    // instant it is given has already been shifted by the local-to-UTC conversion.
    for (const preset of [
      "today",
      "yesterday",
      "last_7_days",
      "last_30_days",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
    ]) {
      const { date_from, date_to } = presetToDateRange(preset);
      expect(date_from, preset).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(date_to, preset).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("starts this_month on the first of the month", () => {
    // Used to start on 31 Aug in IST.
    expect(presetToDateRange("this_month")).toEqual({
      date_from: "2026-09-01",
      date_to: "2026-09-07",
    });
  });

  it("starts this_week on the Sunday", () => {
    // 07 Sep 2026 is a Monday, so the week began the day before.
    expect(presetToDateRange("this_week")).toEqual({
      date_from: "2026-09-06",
      date_to: "2026-09-07",
    });
  });

  it("gives yesterday a single day", () => {
    expect(presetToDateRange("yesterday")).toEqual({
      date_from: "2026-09-06",
      date_to: "2026-09-06",
    });
  });

  it("counts today as one of the last 7 days", () => {
    expect(presetToDateRange("last_7_days")).toEqual({
      date_from: "2026-09-01",
      date_to: "2026-09-07",
    });
  });

  it("spans last_30_days inclusively", () => {
    expect(presetToDateRange("last_30_days")).toEqual({
      date_from: "2026-08-09",
      date_to: "2026-09-07",
    });
  });

  it("ends last_week the day before this one starts", () => {
    expect(presetToDateRange("last_week")).toEqual({
      date_from: "2026-08-30",
      date_to: "2026-09-05",
    });
  });

  it("covers the whole of last_month", () => {
    expect(presetToDateRange("last_month")).toEqual({
      date_from: "2026-08-01",
      date_to: "2026-08-31",
    });
  });

  it("sends no bounds for all_dates or anything unknown", () => {
    // The callers spread this straight into the query, so an empty object means no filter.
    expect(presetToDateRange("all_dates")).toEqual({});
    expect(presetToDateRange("")).toEqual({});
    expect(presetToDateRange("nonsense")).toEqual({});
  });

  it("never returns a range that ends before it starts", () => {
    for (const preset of [
      "today",
      "yesterday",
      "last_7_days",
      "last_30_days",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
    ]) {
      const { date_from, date_to } = presetToDateRange(preset);
      expect(date_from! <= date_to!, preset).toBe(true);
    }
  });
});

describe("across a month boundary", () => {
  it("keeps this_month to a single day on the 1st", () => {
    vi.setSystemTime(new Date(2026, 8, 1, 0, 15, 0));
    expect(presetToDateRange("this_month")).toEqual({
      date_from: "2026-09-01",
      date_to: "2026-09-01",
    });
  });

  it("rolls yesterday back into the previous month", () => {
    vi.setSystemTime(new Date(2026, 8, 1, 0, 15, 0));
    expect(presetToDateRange("yesterday")).toEqual({
      date_from: "2026-08-31",
      date_to: "2026-08-31",
    });
  });

  it("handles a leap-year February for last_month", () => {
    vi.setSystemTime(new Date(2028, 2, 15, 12, 0, 0));
    expect(presetToDateRange("last_month")).toEqual({
      date_from: "2028-02-01",
      date_to: "2028-02-29",
    });
  });
});
