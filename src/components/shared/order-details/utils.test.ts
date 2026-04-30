import { describe, expect, it } from "vitest";
import { getOrderStatusUpdateOptions } from "./utils";

describe("getOrderStatusUpdateOptions", () => {
  it("returns fulfillment progress labels for B2B partial fulfillment context", () => {
    const opts = getOrderStatusUpdateOptions({
      orderType: "B2B",
      isPartialFulfillmentContext: true,
    });
    expect(opts.map((o) => o.value)).toEqual(["pending", "partial", "delivered"]);
    expect(opts.map((o) => o.label)).toEqual([
      "0 Fulfilled",
      "Partially Fulfilled",
      "Fully Fulfilled",
    ]);
  });

  it("returns standard B2B statuses without partial or completed when not in partial fulfillment context", () => {
    const opts = getOrderStatusUpdateOptions({
      orderType: "B2B",
      isPartialFulfillmentContext: false,
    });
    expect(opts.map((o) => o.value)).toEqual([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "returned",
      "canceled",
    ]);
    expect(opts.some((o) => o.value === "partial")).toBe(false);
    expect(opts.some((o) => o.value === "completed")).toBe(false);
  });

  it("returns B2C statuses without partial fulfillment or completed", () => {
    const opts = getOrderStatusUpdateOptions({
      orderType: "B2C",
      isPartialFulfillmentContext: false,
    });
    expect(opts.map((o) => o.value)).toEqual([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "returned",
      "canceled",
    ]);
    expect(opts.some((o) => o.value === "partial")).toBe(false);
    expect(opts.some((o) => o.value === "completed")).toBe(false);
  });
});
