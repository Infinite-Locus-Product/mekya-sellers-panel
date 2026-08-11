import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { RegionalPerformanceTab } from "./RegionalPerformanceTab";

// vitest.config.ts declares no setupFiles, so each file wires jest-dom and unmounts its
// own renders — matching the other component tests in this repo.
afterEach(cleanup);

/** Shape emitted by GET /seller/analytics/sales-volume → regional_performance.items. */
const REGIONS = [
  {
    region: "West India",
    sales: 52842,
    revenue: 52842,
    growth: 275.46,
    contribution: 81,
    states: [
      { name: "Maharashtra", revenue: 40208 },
      { name: "Gujarat", revenue: 12634 },
    ],
    color: "#2C4FBF",
  },
  {
    region: "South India",
    sales: 12634,
    revenue: 12634,
    growth: -8.2,
    contribution: 19,
    states: [{ name: "Karnataka", revenue: 12634 }],
    color: "#016630",
  },
];

describe("RegionalPerformanceTab", () => {
  it("renders a card per region with its revenue and growth", () => {
    render(<RegionalPerformanceTab data={REGIONS} />);
    expect(screen.getByText("West India")).toBeInTheDocument();
    expect(screen.getByText("South India")).toBeInTheDocument();
    expect(screen.getByText("+275.46%")).toBeInTheDocument();
    expect(screen.getByText("-8.2%")).toBeInTheDocument();
    expect(screen.getByText("81% of total")).toBeInTheDocument();
  });

  it("keeps state detail collapsed until the region is expanded", () => {
    render(<RegionalPerformanceTab data={REGIONS} />);
    const west = screen.getByRole("button", { name: /West India/ });
    expect(west).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(west);
    expect(west).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Maharashtra")).toBeInTheDocument();
    expect(screen.getByText("Gujarat")).toBeInTheDocument();
  });

  it("summarises regions, states covered and the seller's own revenue", () => {
    const { container } = render(<RegionalPerformanceTab data={REGIONS} />);
    const summary = (container.textContent ?? "").replace(/\s+/g, " ");
    expect(summary).toContain("2 Regions");
    expect(summary).toContain("3 States Covered");
    expect(summary).toContain("Your Revenue");
  });

  it("falls back to `sales` when `revenue` is absent, rather than showing zero", () => {
    render(
      <RegionalPerformanceTab
        data={[{ region: "East India", sales: 4321, growth: 0, contribution: 100, states: [] }]}
      />
    );
    // Appears twice: once on the region card, once in the summary footer total.
    expect(screen.getAllByText(/4,321/).length).toBeGreaterThan(0);
  });

  it("shows an honest empty state instead of placeholder regions", () => {
    // The admin copy of this view falls back to a hard-coded mock region list. On a
    // seller's own revenue screen that would be indistinguishable from real earnings.
    render(<RegionalPerformanceTab data={[]} />);
    expect(screen.getByText("No regional sales in this period")).toBeInTheDocument();
    expect(screen.queryByText("North India")).not.toBeInTheDocument();
    expect(screen.queryByText(/3,25,000|325000/)).not.toBeInTheDocument();
  });

  it("says so when a region has no state-level detail", () => {
    render(
      <RegionalPerformanceTab
        data={[{ region: "North India", revenue: 100, growth: 0, contribution: 100, states: [] }]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /North India/ }));
    expect(screen.getByText("No state-level data for this period")).toBeInTheDocument();
  });
});
