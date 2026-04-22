import { describe, it, expect } from "vitest";
import { getOrderDetails, getOrders } from "./orders";

describe("orders data layer", () => {
  it("getOrders returns a non-empty array", async () => {
    const orders = await getOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });

  it("getOrders returns orders with required fields", async () => {
    const orders = await getOrders();
    const first = orders[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("vendor");
    expect(first).toHaveProperty("date");
    expect(first).toHaveProperty("amount");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("paymentStatus");
    expect(first).toHaveProperty("type");
    expect(first).toHaveProperty("delivery");
  });

  it("getOrderDetails maps B2B orders with line items and inventory type", async () => {
    const orders = await getOrders();
    const b2b = orders.find((o) => o.type === "B2B" && o.status !== "Partial Fulfillment");
    expect(b2b).toBeDefined();
    const details = await getOrderDetails(b2b!.id);
    expect(details).not.toBeNull();
    expect(details!.orderType).toBe("B2B");
    expect(details!.b2bLineItems?.length).toBe(1);
    expect(details!.b2bLineItems![0].configurations.length).toBeGreaterThanOrEqual(2);
    expect(details!.inventoryType).toBe(b2b!.inventoryType);
  });

  it("getOrderDetails maps B2B partial fulfillment with stats and size grid rows", async () => {
    const details = await getOrderDetails("ORD-2026-025");
    expect(details).not.toBeNull();
    expect(details!.status).toBe("partial");
    expect(details!.b2bFulfillmentStats).toEqual({
      totalItems: 45,
      fulfilled: 0,
      delivered: 0,
      pending: 45,
    });
    expect(details!.b2bLineItems?.[0].partialFulfillmentRows).toHaveLength(2);
    expect(details!.payment.method).toBe("Wire Transfer");
  });
});
