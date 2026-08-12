/**
 * The channel select and the date-range button sit side by side in the dashboard
 * header. They are different elements (a Radix select trigger vs. a plain button)
 * and each used to carry its own copy of the height/background/typography classes,
 * which drifted: the select rendered at h-8 on #E8E9E8 while the date button had no
 * explicit height at all and sat on #F2F2F2.
 *
 * These tests assert the two agree on the classes that decide height and colour, so
 * a future edit to one can't silently unalign the pair again.
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppSelect } from "./AppSelect";
import { FILTER_CONTROL_CLASS } from "./filterControlClass";
import { CustomDateRangeSelector } from "./custom-date-range/CustomDateRangeSelector";

/** The classes that actually decide how tall the control is and what colour it is. */
const SHARED_TOKENS = [
  "h-8",
  "bg-[#E8E9E8]",
  "text-xs",
  "text-[#000000]",
  "px-2",
  "py-1",
  "min-[1920px]:h-10",
  "min-[1920px]:text-sm",
] as const;

afterEach(cleanup);

/** Queries are scoped to each render's own container so the two controls can be
 *  mounted side by side in one test without the lookups colliding. */
function renderSelect(): HTMLElement {
  const { container } = render(
    <AppSelect
      placeholder="All Channels"
      value="all"
      onChange={() => {}}
      options={[{ label: "All Channels", value: "all" }]}
    />
  );
  const trigger = container.querySelector<HTMLElement>('[data-slot="select-trigger"]');
  if (!trigger) throw new Error("channel select trigger not rendered");
  return trigger;
}

function renderDateRange(): HTMLElement {
  const { container } = render(
    <CustomDateRangeSelector
      value={{ startDate: new Date(2026, 7, 1), endDate: new Date(2026, 7, 12) }}
      onChange={() => {}}
    />
  );
  const trigger = container.querySelector<HTMLElement>("button");
  if (!trigger) throw new Error("date-range button not rendered");
  return trigger;
}

describe("header filter controls", () => {
  it.each(SHARED_TOKENS)("the channel select carries %s", (token) => {
    expect(renderSelect().className.split(/\s+/)).toContain(token);
  });

  it.each(SHARED_TOKENS)("the date-range button carries %s", (token) => {
    expect(renderDateRange().className.split(/\s+/)).toContain(token);
  });

  it("takes both controls' shared styling from one source", () => {
    const selectClasses = renderSelect().className.split(/\s+/);
    const dateClasses = renderDateRange().className.split(/\s+/);
    for (const token of FILTER_CONTROL_CLASS.split(/\s+/).filter(Boolean)) {
      expect(selectClasses).toContain(token);
      expect(dateClasses).toContain(token);
    }
  });

  it("no longer leaves the date button on its old, taller, lighter styling", () => {
    const dateClasses = renderDateRange().className.split(/\s+/);
    expect(dateClasses).not.toContain("bg-[#F2F2F2]");
    expect(dateClasses).not.toContain("text-[#4E4E4E]");
    // It had no height class at all, so its height came from padding alone.
    expect(dateClasses).toContain("h-8");
  });
});
