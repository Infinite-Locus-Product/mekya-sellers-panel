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
    const b2b = orders.find(
      (o) => o.type === "B2B" && o.status !== "Partially Fulfilled",
    );
    expect(b2b).toBeDefined();
    const details = await getOrderDetails(b2b!.id);
    expect(details).not.toBeNull();
    expect(details!.orderType).toBe("B2B");
    expect(details!.b2bLineItems?.length).toBe(1);
    expect(
      details!.b2bLineItems![0].configurations.length,
    ).toBeGreaterThanOrEqual(2);
    expect(details!.inventoryType).toBe(b2b!.inventoryType);
  });

  it("getOrderDetails maps B2B pre_booking in-progress with stats and size grid rows", async () => {
    const details = await getOrderDetails("ORD-2026-025");
    expect(details).not.toBeNull();
    expect(details!.inventoryType).toBe("pre_booking");
    expect(details!.status).toBe("Partially Fulfilled");
    expect(details!.b2bFulfillmentStats).toEqual({
      totalItems: 60,
      fulfilled: 0,
      delivered: 0,
      pending: 60,
    });
    expect(details!.b2bLineItems?.[0].partialFulfillmentRows).toHaveLength(2);
    expect(details!.payment.method).toBe("Wire Transfer");
  });

  it("getOrderDetails sets Ready for pickup as current for B2B ready_to_ship processing", async () => {
    const details = await getOrderDetails("ORD-2026-029");
    expect(details).not.toBeNull();
    expect(details!.orderType).toBe("B2B");
    expect(details!.inventoryType).toBe("ready_to_ship");
    expect(details!.status).toBe("Unfulfilled");
    const current = details!.timeline.find((t) => t.current);
    expect(current?.stage).toBe("Ready for pickup");
    expect(
      details!.timeline.find((t) => t.stage === "Order Placed")?.completed,
    ).toBe(true);
    expect(
      details!.timeline.find((t) => t.stage === "Order Processing")?.completed,
    ).toBe(true);
  });

  it("getOrderDetails sets Ready for pickup as current for B2B ready_to_ship pending", async () => {
    const details = await getOrderDetails("ORD-2024-003");
    expect(details).not.toBeNull();
    expect(details!.orderType).toBe("B2B");
    expect(details!.inventoryType).toBe("ready_to_ship");
    expect(details!.status).toBe("Unconfirmed");
    const current = details!.timeline.find((t) => t.current);
    expect(current?.stage).toBe("Ready for pickup");
    expect(
      details!.timeline.find((t) => t.stage === "Order Placed")?.completed,
    ).toBe(true);
    expect(
      details!.timeline.find((t) => t.stage === "Order Processing")?.completed,
    ).toBe(true);
  });

  it("getOrderDetails maps B2B pre_booking partial status to fulfillment progress cards", async () => {
    const details = await getOrderDetails("ORD-2026-026");
    expect(details).not.toBeNull();
    expect(details!.inventoryType).toBe("pre_booking");
    expect(details!.status).toBe("Partially Fulfilled");
    expect(details!.b2bFulfillmentStats).toEqual({
      totalItems: 75,
      fulfilled: 30,
      delivered: 22,
      pending: 45,
    });
    expect(details!.b2bLineItems?.[0].partialFulfillmentRows).toHaveLength(2);
  });

  it("getOrderDetails maps B2B pre_booking fully_fulfilled partial row to full stats", async () => {
    const details = await getOrderDetails("ORD-2026-031");
    expect(details).not.toBeNull();
    expect(details!.inventoryType).toBe("pre_booking");
    expect(details!.status).toBe("Partially Fulfilled");
    expect(details!.b2bFulfillmentStats).toEqual({
      totalItems: 40,
      fulfilled: 40,
      delivered: 40,
      pending: 0,
    });
    expect(details!.b2bLineItems?.[0].partialFulfillmentRows).toHaveLength(2);
  });

  it("getOrderDetails shows fulfillment progress cards for B2B pre_booking delivered orders", async () => {
    const details = await getOrderDetails("ORD-2026-022");
    expect(details).not.toBeNull();
    expect(details!.inventoryType).toBe("pre_booking");
    expect(details!.status).toBe("Fulfilled");
    expect(details!.b2bFulfillmentStats).toEqual({
      totalItems: 64,
      fulfilled: 64,
      delivered: 64,
      pending: 0,
    });
    expect(details!.b2bLineItems?.[0].partialFulfillmentRows).toHaveLength(2);
  });

  it("getOrderDetails keeps Order Placed current for B2B pending non-ready_to_ship", async () => {
    const details = await getOrderDetails("ORD-2024-002");
    expect(details!.status).toBe("Unconfirmed");
    expect(details!.inventoryType).toBe("sale_or_return");
    expect(details!.timeline.find((t) => t.current)?.stage).toBe(
      "Order Placed",
    );
  });
});
