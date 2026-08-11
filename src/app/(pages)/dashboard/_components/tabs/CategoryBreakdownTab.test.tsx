import { describe, it, expect, afterEach, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CategoryBreakdownTab } from "./CategoryBreakdownTab";

beforeAll(() => {
  if (!("ResizeObserver" in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(cleanup);

/** Top-level Saleor categories, as the backend now rolls them up. */
const CATEGORIES = [
  { category: "Ethnic Wear", value: 25535.5, percentage: 50, color: "var(--info-dark)" },
  { category: "Topwear", value: 20104, percentage: 34, color: "var(--success-dark)" },
  { category: "Swimwear", value: 5552.5, percentage: 12, color: "var(--warning-dark)" },
];

const GENDERS = [
  { gender: "Women", value: 5480, percentage: 40 },
  { gender: "Men", value: 30574, percentage: 60 },
  { gender: "Boys", value: 0, percentage: 0 },
  { gender: "Girls", value: 0, percentage: 0 },
];

describe("CategoryBreakdownTab", () => {
  it("titles the first card 'Sales by Gender', not by category", () => {
    render(<CategoryBreakdownTab data={CATEGORIES} genderData={GENDERS} />);
    expect(screen.getByText("Sales by Gender")).toBeInTheDocument();
    expect(screen.queryByText("Sales by Category")).not.toBeInTheDocument();
  });

  it("lists all four genders including the ones at zero", () => {
    render(<CategoryBreakdownTab data={CATEGORIES} genderData={GENDERS} />);
    for (const label of ["Women", "Men", "Boys", "Girls"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows Saleor's top-level categories in the performance card", () => {
    render(<CategoryBreakdownTab data={CATEGORIES} genderData={GENDERS} />);
    expect(screen.getByText("Ethnic Wear")).toBeInTheDocument();
    expect(screen.getByText("Topwear")).toBeInTheDocument();
    expect(screen.getByText("Swimwear")).toBeInTheDocument();
  });

  it("does not feed category names into the gender card", () => {
    // Both cards used to read the same category payload, which is how "Ethnic Wear"
    // ended up as a slice of a chart labelled by gender.
    render(<CategoryBreakdownTab data={CATEGORIES} genderData={GENDERS} />);
    const genderCard = screen.getByText("Sales by Gender").closest("div[data-slot], div");
    expect(genderCard?.textContent).not.toContain("Ethnic Wear");
  });

  it("explains how to populate gender rather than drawing an empty pie", () => {
    render(
      <CategoryBreakdownTab
        data={CATEGORIES}
        genderData={[
          { gender: "Women", value: 0, percentage: 0 },
          { gender: "Men", value: 0, percentage: 0 },
        ]}
      />
    );
    expect(screen.getByText("No gender data for this period")).toBeInTheDocument();
    expect(screen.getByText(/Set the Gender attribute/)).toBeInTheDocument();
  });

  it("explains that Unspecified is a missing attribute, not unisex", () => {
    // Verified against live data: every rupee in this bucket came from products with no
    // Gender attribute at all — nothing tagged Unisex or Kids. Labelling it "Unisex" would
    // assert something about those products that nobody has recorded.
    render(
      <CategoryBreakdownTab
        data={CATEGORIES}
        genderData={[...GENDERS, { gender: "Unspecified", value: 27822, percentage: 53 }]}
      />
    );
    // Appears twice: the legend row and the explanatory note's lead-in.
    expect(screen.getAllByText("Unspecified").length).toBeGreaterThan(0);
    expect(screen.getByText(/no Gender attribute set/)).toBeInTheDocument();
    expect(screen.queryByText("Unisex")).not.toBeInTheDocument();
  });

  it("omits the Unspecified note when every sale resolved to a gender", () => {
    render(<CategoryBreakdownTab data={CATEGORIES} genderData={GENDERS} />);
    expect(screen.queryByText(/no Gender attribute set/)).not.toBeInTheDocument();
  });

  it("renders an empty state when there are no categories", () => {
    render(<CategoryBreakdownTab data={[]} genderData={GENDERS} />);
    expect(screen.getByText("No category sales in this period")).toBeInTheDocument();
  });
});
