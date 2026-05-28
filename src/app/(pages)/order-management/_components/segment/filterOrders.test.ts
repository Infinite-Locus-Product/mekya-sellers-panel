import { describe, it, expect } from "vitest";
import { filterSegmentOrders } from "./filterOrders";
import type { AllOrder } from "@/lib/tableTypes";

const baseOrder = (overrides: Partial<AllOrder>): AllOrder => ({
    id: "ORD-1",
    vendor: "Acme",
    date: "1 Jan 2025",
    amount: "₹100",
    status: "Pending",
    paymentStatus: "Paid",
    type: "B2C",
    delivery: "TBD",
    productList: [{ name: "Shirt", price: 100, quantity: 1 }],
    ...overrides,
});

describe("filterSegmentOrders", () => {
    it("returns all B2C orders when filters are wide open", () => {
        const orders = [baseOrder({ id: "A" }), baseOrder({ id: "B", type: "B2B" as AllOrder["type"] })];
        const b2c = filterSegmentOrders({
            segmentOrders: orders.filter((o) => o.type === "B2C"),
            segment: "b2c",
            orderView: "all",
            customOrderStatusFilter: "all",
            returnStatusFilter: "all",
            statusFilter: "all",
            paymentFilter: "all",
            inventoryTypeFilter: "all",
            searchQuery: "",
        });
        expect(b2c).toHaveLength(1);
        expect(b2c[0].id).toBe("A");
    });

    it("filters B2C returns view by return status", () => {
        const orders = [
            baseOrder({ id: "R1", returnStatus: "Return Requested" }),
            baseOrder({ id: "R2", returnStatus: "Approved" }),
        ];
        const filtered = filterSegmentOrders({
            segmentOrders: orders,
            segment: "b2c",
            orderView: "returns",
            customOrderStatusFilter: "all",
            returnStatusFilter: "Approved",
            statusFilter: "all",
            paymentFilter: "all",
            inventoryTypeFilter: "all",
            searchQuery: "",
        });
        expect(filtered.map((o) => o.id)).toEqual(["R2"]);
    });

    it("matches search on product name", () => {
        const orders = [
            baseOrder({ id: "X" }),
            baseOrder({ id: "Y", productList: [{ name: "UniqueZap", price: 1, quantity: 1 }] }),
        ];
        const filtered = filterSegmentOrders({
            segmentOrders: orders,
            segment: "b2c",
            orderView: "all",
            customOrderStatusFilter: "all",
            returnStatusFilter: "all",
            statusFilter: "all",
            paymentFilter: "all",
            inventoryTypeFilter: "all",
            searchQuery: "UniqueZap",
        });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe("Y");
    });
});
