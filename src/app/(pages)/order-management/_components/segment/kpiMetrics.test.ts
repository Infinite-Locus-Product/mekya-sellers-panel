import { describe, it, expect } from "vitest";
import { computeKpiStats, sliceOrdersForKpis } from "./kpiMetrics";
import type { AllOrder } from "@/lib/tableTypes";

const row = (partial: Partial<AllOrder>): AllOrder =>
    ({
        id: "1",
        vendor: "V",
        date: "d",
        amount: "₹1,000",
        status: "Pending",
        paymentStatus: "Paid",
        type: "B2C",
        delivery: "d",
        ...partial,
    }) as AllOrder;

describe("sliceOrdersForKpis", () => {
    it("excludes B2B rows that have customOrderStatus from KPI slice", () => {
        const orders = [
            row({ id: "bulk", type: "B2B", customOrderStatus: undefined }),
            row({ id: "custom", type: "B2B", customOrderStatus: "In Process" }),
        ];
        const sliced = sliceOrdersForKpis(orders, "b2b");
        expect(sliced.map((o) => o.id)).toEqual(["bulk"]);
    });

    it("keeps all B2C orders for KPI slice", () => {
        const orders = [row({ id: "a" }), row({ id: "b" })];
        expect(sliceOrdersForKpis(orders, "b2c")).toHaveLength(2);
    });
});

describe("computeKpiStats", () => {
    it("sums revenue and counts statuses", () => {
        const stats = computeKpiStats([
            row({ amount: "₹100", status: "Pending", paymentStatus: "Pending" }),
            row({ amount: "₹200", status: "Delivered", paymentStatus: "Paid" }),
            row({ amount: "₹0", status: "Delivered", paymentStatus: "Paid" }),
        ]);
        expect(stats.totalOrders).toBe(3);
        expect(stats.totalRevenue).toBe(300);
        expect(stats.pendingOrders).toBe(1);
        expect(stats.deliveredOrders).toBe(2);
        expect(stats.returnOrders).toBe(0);
    });
});
