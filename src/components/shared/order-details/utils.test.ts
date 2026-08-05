import { describe, it, expect } from "vitest";
import {
  CANCEL_REASONS,
  canEditShipmentItems,
  findCurrentStepKey,
  parseCancelQuantity,
} from "./utils";
import type { ShipmentStepperStep } from "./types";

/** Steps as the backend sends them: stable `key` + display `label`. */
function steps(current: string): ShipmentStepperStep[] {
  const all: ShipmentStepperStep[] = [
    { key: "order_placed", label: "Order Placed", completed: true, timestamp: null },
    { key: "processing", label: "Processing", completed: true, timestamp: null },
    { key: "ready", label: "Ready for Pickup", completed: false, timestamp: null },
    { key: "shipped", label: "Shipped", completed: false, timestamp: null },
    { key: "in_transit", label: "In Transit", completed: false, timestamp: null },
    { key: "delivered", label: "Delivered", completed: false, timestamp: null },
  ];
  const i = all.findIndex((s) => s.label === current);
  return all.map((s, idx) => ({ ...s, completed: idx <= i }));
}

describe("findCurrentStepKey", () => {
  it("resolves a display label to its stable key", () => {
    expect(findCurrentStepKey("Ready for Pickup", steps("Ready for Pickup"))).toBe("ready");
  });

  it("is case- and whitespace-insensitive, so copy tweaks don't break behaviour", () => {
    expect(findCurrentStepKey("  ready for pickup ", steps("Ready for Pickup"))).toBe("ready");
  });

  it("returns null for a label that isn't in the stepper", () => {
    expect(findCurrentStepKey("Cancelled", steps("Processing"))).toBeNull();
  });
});

describe("canEditShipmentItems", () => {
  it.each([
    ["Order Placed", true],
    ["Processing", true],
    ["Ready for Pickup", true],
    ["Shipped", false],
    ["In Transit", false],
    ["Delivered", false],
  ] as const)("%s -> %s", (label, expected) => {
    expect(canEditShipmentItems(label, steps(label))).toBe(expected);
  });

  it("refuses to edit once dispatched — voiding a parcel in transit is not possible", () => {
    expect(canEditShipmentItems("Shipped", steps("Shipped"))).toBe(false);
  });

  it("returns false for an unknown stage rather than defaulting to editable", () => {
    // A returned/cancelled parcel's label isn't a stepper key; failing closed matters
    // because the action performs an irreversible void-and-repack.
    expect(canEditShipmentItems("Returned", steps("Delivered"))).toBe(false);
    expect(canEditShipmentItems("", steps("Processing"))).toBe(false);
  });
});

describe("parseCancelQuantity", () => {
  it("accepts a value within the cap", () => {
    expect(parseCancelQuantity("2", 3)).toEqual({ value: 2, error: null });
  });

  it("accepts exactly the cap", () => {
    expect(parseCancelQuantity("3", 3)).toEqual({ value: 3, error: null });
  });

  it("treats an empty field as incomplete, not as zero", () => {
    // Number("") is 0, which previously snapped the input back to 1 and made the field
    // impossible to clear while retyping.
    expect(parseCancelQuantity("", 3)).toEqual({ value: null, error: null });
    expect(parseCancelQuantity("   ", 3)).toEqual({ value: null, error: null });
  });

  it("explains an over-cap value instead of silently clamping it", () => {
    const { value, error } = parseCancelQuantity("9", 3);
    expect(value).toBeNull();
    expect(error).toContain("3 units");
  });

  it("singularises the cap message", () => {
    expect(parseCancelQuantity("5", 1).error).toContain("1 unit available");
  });

  it("rejects zero and negatives", () => {
    expect(parseCancelQuantity("0", 3).value).toBeNull();
    expect(parseCancelQuantity("-1", 3).value).toBeNull();
  });

  it("rejects non-integers and junk rather than coercing", () => {
    for (const raw of ["1.5", "1e2", "abc", "2x", "+2"]) {
      expect(parseCancelQuantity(raw, 5).value, raw).toBeNull();
    }
  });
});

describe("CANCEL_REASONS", () => {
  it("is the single source shared by every cancel modal", () => {
    expect(CANCEL_REASONS).toEqual([
      "Customer requested cancellation",
      "Out of stock",
      "Seller unable to fulfil",
      "System / technical error",
    ]);
  });
});
