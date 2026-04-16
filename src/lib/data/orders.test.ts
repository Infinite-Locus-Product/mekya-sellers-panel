import { describe, it, expect } from "vitest";
import { getOrders } from "./orders";

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
});
