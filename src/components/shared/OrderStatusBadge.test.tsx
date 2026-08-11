import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  CURRENT_STATUS_LABEL,
  CURRENT_STATUS_VARIANT,
  OrderStatusBadge,
  orderStatusKey,
} from "./OrderStatusBadge";
import { PIPELINE_STATUS_LABELS } from "@/lib/tableTypes";

afterEach(cleanup);

describe("orderStatusKey", () => {
  it("prefers currentStatus, which is the only field carrying partial state", () => {
    expect(
      orderStatusKey({ currentStatus: "partially_cancelled", mekyaStatus: "cancelled" })
    ).toBe("partially_cancelled");
  });

  it("falls back to mekyaStatus only when there is no pipeline status yet", () => {
    expect(orderStatusKey({ currentStatus: undefined, mekyaStatus: "shipped" })).toBe("shipped");
  });

  it("treats a brand new order with neither field as pending", () => {
    expect(orderStatusKey({ currentStatus: undefined, mekyaStatus: undefined })).toBe("none");
  });
});

describe("OrderStatusBadge", () => {
  it("renders the partial label rather than collapsing to the base status", () => {
    render(<OrderStatusBadge order={{ currentStatus: "partially_cancelled" }} />);
    expect(screen.getByText("Partially Cancelled")).toBeInTheDocument();
  });

  it("gives every partial status the shared 'partial' variant", () => {
    // The dashboard previously keyed off the label string, so "Partially Cancelled" wasn't
    // in its 9-entry Saleor-native map and fell back to the "unfulfilled" colour — a
    // different badge from the Orders page for the very same order.
    const partials = Object.keys(CURRENT_STATUS_VARIANT).filter((k) =>
      k.startsWith("partially_")
    ) as Array<keyof typeof CURRENT_STATUS_VARIANT>;
    expect(partials.length).toBeGreaterThan(0);
    for (const key of partials) {
      expect(CURRENT_STATUS_VARIANT[key]).toBe("partial");
    }
  });

  it("has a label and a variant for every pipeline code", () => {
    for (const key of Object.keys(CURRENT_STATUS_LABEL)) {
      expect(CURRENT_STATUS_VARIANT[key as keyof typeof CURRENT_STATUS_VARIANT]).toBeDefined();
    }
  });

  it("renders labels the status filter can actually match on", () => {
    // Badge text and filter options both have to agree with the backend's vocabulary,
    // otherwise a seller filters by the status they can see and gets an empty table.
    const filterable = new Set(PIPELINE_STATUS_LABELS);
    const rendered = Object.entries(CURRENT_STATUS_LABEL)
      // "none"/"ready" are internal fallbacks with no backend counterpart to filter by.
      .filter(([key]) => key !== "none" && key !== "ready" && key !== "partially_ready")
      .map(([, label]) => label);
    for (const label of rendered) {
      expect(filterable.has(label)).toBe(true);
    }
  });
});
