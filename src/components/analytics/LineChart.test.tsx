import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { LineChart } from "./LineChart";

// jsdom has no ResizeObserver; the component constructs one unconditionally.
beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

/** Exactly what GET /seller/analytics/sales-volume returned for Aug 1-10. */
const REAL_SERIES = [
  { label: "01 Aug", value: 0 },
  { label: "02 Aug", value: 0 },
  { label: "03 Aug", value: 43508 },
  { label: "04 Aug", value: 0 },
  { label: "05 Aug", value: 0 },
  { label: "06 Aug", value: 9334 },
  { label: "07 Aug", value: 0 },
  { label: "08 Aug", value: 0 },
  { label: "09 Aug", value: 0 },
  { label: "10 Aug", value: 0 },
];

function svgHasNaN(container: HTMLElement): string[] {
  const bad: string[] = [];
  container.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.value.includes("NaN")) bad.push(`<${el.tagName} ${attr.name}="${attr.value}">`);
    }
  });
  return bad;
}

describe("LineChart NaN repro", () => {
  it("renders the real daily series at the modal's default 1Y range without NaN", () => {
    const { container } = render(<LineChart data={REAL_SERIES} timeRange="1Y" />);
    expect(svgHasNaN(container)).toEqual([]);
  });

  it("renders the same series with no timeRange without NaN", () => {
    const { container } = render(<LineChart data={REAL_SERIES} />);
    expect(svgHasNaN(container)).toEqual([]);
  });

  it("renders an EMPTY series without NaN (data not yet loaded / none in range)", () => {
    const { container } = render(<LineChart data={[]} timeRange="1Y" />);
    expect(svgHasNaN(container)).toEqual([]);
  });

  it("keeps the real date labels rather than relabelling them as months", () => {
    const { container } = render(<LineChart data={REAL_SERIES} timeRange="1Y" />);
    const text = container.textContent ?? "";
    expect(text).toContain("03 Aug");
    expect(text).not.toContain("Jan");
  });

  it("never renders a currency symbol for the count variant", () => {
    // The Total Orders trend reused the money variant, so a day with 2 orders rendered
    // "₹2" in the tooltip and five "0k" axis ticks (every count divided by 1000).
    const counts = [
      { label: "01 Aug", value: 1 },
      { label: "02 Aug", value: 2 },
      { label: "03 Aug", value: 0 },
    ];
    const { container } = render(
      <LineChart data={counts} variant="count" unitLabel="orders" />
    );
    const text = container.textContent ?? "";
    expect(text).not.toContain("₹");
    expect(text).not.toContain("0k");
  });

  it("still formats the default variant as currency", () => {
    const { container } = render(<LineChart data={REAL_SERIES} />);
    // Axis ticks are the money variant's k-scale.
    expect(container.textContent ?? "").toContain("k");
  });

  it("draws the curve through its data points, not short of them", () => {
    // A `basis` spline only approximates its control points, so the 43,508 peak was drawn at
    // roughly 30k while the tooltip reported the true value. Rather than assert a magic pixel
    // threshold, derive where 43,508 *should* sit from the Y axis Recharts actually rendered,
    // then check the curve reaches it.
    const { container } = render(<LineChart data={REAL_SERIES} />);

    // Y tick labels are "0k", "15k", … — pair each value with the tick's y coordinate.
    const ticks = Array.from(
      container.querySelectorAll(".recharts-yAxis .recharts-cartesian-axis-tick text")
    )
      .map((el) => ({
        value: Number((el.textContent ?? "").replace("k", "")) * 1000,
        y: Number(el.getAttribute("y")),
      }))
      .filter((t) => Number.isFinite(t.value) && Number.isFinite(t.y))
      .sort((a, b) => a.value - b.value);
    expect(ticks.length).toBeGreaterThanOrEqual(2);

    // Linear map value → y from the two outermost ticks.
    const lo = ticks[0];
    const hi = ticks[ticks.length - 1];
    const peakValue = Math.max(...REAL_SERIES.map((p) => p.value));
    const expectedY =
      lo.y + ((peakValue - lo.value) / (hi.value - lo.value)) * (hi.y - lo.y);

    const path = container.querySelector("path.recharts-line-curve");
    expect(path).not.toBeNull();
    const ys = Array.from((path!.getAttribute("d") ?? "").matchAll(/[ ,]([\d.]+)(?=[LC ,]|$)/g))
      .map((m) => Number(m[1]))
      .filter((n) => Number.isFinite(n));
    expect(ys.length).toBeGreaterThan(0);

    // SVG y grows downward, so the curve's peak is its minimum y. Allow a few px for the
    // tick text's own baseline offset; `basis` undershot this by ~55px.
    const peakY = Math.min(...ys);
    expect(Math.abs(peakY - expectedY)).toBeLessThan(12);
  });
});
