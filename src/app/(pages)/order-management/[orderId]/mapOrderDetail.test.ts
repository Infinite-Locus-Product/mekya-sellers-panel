import { describe, it, expect } from "vitest";
import { mapApiOrderDetailToOrderDetailsData } from "./mapOrderDetail";
import type { ApiOrderDetail } from "@/lib/api/orders";

/** Minimal ApiOrderDetail — only the fields the cancellation gating actually reads. */
function detail(
    lines: Array<{
        id?: string;
        quantity: number;
        cancelled_quantity?: number;
        sku?: string | null;
    }>,
    shipments: Array<{
        items: Array<{ order_line_id?: string; quantity: number }>;
        saleor_status?: string;
        id?: string;
    }> = [],
): ApiOrderDetail {
    return {
        invoice_number: "ORD-1",
        invoice_date: "2026-08-04T00:00:00Z",
        order_number: "1",
        status: "Pending",
        channel: "b2c",
        customer: { name: "A", email: "a@b.c" },
        lines: lines.map((l, i) => ({
            id: l.id ?? `line-${i}`,
            product_name: `P${i}`,
            sku: l.sku === undefined ? `SKU-${i}` : l.sku,
            quantity: l.quantity,
            cancelled_quantity: l.cancelled_quantity,
            unit_price: { amount: 100, currency: "INR" },
        })),
        shipments: shipments.map((s, i) => ({
            id: s.id ?? `F${i}`,
            created_at: "2026-08-04T00:00:00Z",
            tracking_number: null,
            warehouse: null,
            saleor_status: s.saleor_status ?? "FULFILLED",
            items: s.items.map((it) => ({
                order_line_id: it.order_line_id,
                product_name: "P",
                quantity: it.quantity,
            })),
            stepper: { current_step: "processing", steps: [] },
        })),
    } as unknown as ApiOrderDetail;
}

describe("mapOrderDetail — item cancellation gating", () => {
    it("a wholly un-shipped, un-cancelled line is fully cancellable", () => {
        const d = mapApiOrderDetailToOrderDetailsData(detail([{ quantity: 3 }]));
        expect(d.items[0].cancellableQuantity).toBe(3);
        expect(d.items[0].cancelledQuantity).toBe(0);
    });

    it("subtracts already-cancelled units", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([{ quantity: 5, cancelled_quantity: 2 }]),
        );
        expect(d.items[0].cancellableQuantity).toBe(3);
        expect(d.items[0].cancelledQuantity).toBe(2);
    });

    it("subtracts shipped units", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 5 }],
                [{ items: [{ order_line_id: "L1", quantity: 2 }] }],
            ),
        );
        expect(d.items[0].cancellableQuantity).toBe(3);
    });

    it("a fully-cancelled line is not cancellable again — the action must hide", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([{ quantity: 2, cancelled_quantity: 2 }]),
        );
        expect(d.items[0].cancellableQuantity).toBe(0);
    });

    it("a fully-shipped line is not cancellable", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 2 }],
                [{ items: [{ order_line_id: "L1", quantity: 2 }] }],
            ),
        );
        expect(d.items[0].cancellableQuantity).toBe(0);
    });

    it("never goes negative when shipped + cancelled exceed the line quantity", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 2, cancelled_quantity: 2 }],
                [{ items: [{ order_line_id: "L1", quantity: 2 }] }],
            ),
        );
        expect(d.items[0].cancellableQuantity).toBe(0);
    });

    it("sums a line split across multiple shipments, joining by id not index", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [
                    { id: "L1", quantity: 5 },
                    { id: "L2", quantity: 4 },
                ],
                [
                    { items: [{ order_line_id: "L1", quantity: 1 }] },
                    { items: [{ order_line_id: "L1", quantity: 2 }] },
                ],
            ),
        );
        expect(d.items[0].cancellableQuantity).toBe(2); // 5 − (1+2)
        expect(d.items[1].cancellableQuantity).toBe(4); // untouched by L1's shipments
    });

    it("exposes orderLineId so a line can be identified to the cancel API", () => {
        const d = mapApiOrderDetailToOrderDetailsData(detail([{ id: "L9", quantity: 1 }]));
        expect(d.items[0].orderLineId).toBe("L9");
    });

    it("excludes cancelled units from the shipment picker's unfulfilled lines", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([
                { id: "L1", quantity: 2, cancelled_quantity: 2 },
                { id: "L2", quantity: 3 },
            ]),
        );
        // A cancelled line must never be offered for shipment — the backend rejects it.
        expect(d.unfulfilledLines?.map((l) => l.orderLineId)).toEqual(["L2"]);
    });

    it("partially cancelled line still offers its remaining units for shipment", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([{ id: "L1", quantity: 5, cancelled_quantity: 2 }]),
        );
        expect(d.unfulfilledLines).toHaveLength(1);
        expect(d.unfulfilledLines?.[0].quantity).toBe(3);
    });
});

describe("mapOrderDetail — shipment display order", () => {
    it("orders shipments normal, exchange, returned, cancelled regardless of input order", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([{ quantity: 1 }], [
                { id: "cancelled-1", items: [], saleor_status: "CANCELED" },
                { id: "returned-1", items: [], saleor_status: "RETURNED" },
                { id: "normal-1", items: [], saleor_status: "FULFILLED" },
                { id: "exchange-1", items: [], saleor_status: "REPLACED" },
            ]),
        );
        expect(d.shipments?.map((s) => s.id)).toEqual([
            "normal-1",
            "exchange-1",
            "returned-1",
            "cancelled-1",
        ]);
        expect(d.shipments?.map((s) => s.kind)).toEqual([
            "normal",
            "exchange",
            "returned",
            "cancelled",
        ]);
    });

    it("keeps relative order within the same kind (stable sort)", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([{ quantity: 1 }], [
                { id: "normal-2", items: [], saleor_status: "FULFILLED" },
                { id: "normal-1", items: [], saleor_status: "WAITING_FOR_APPROVAL" },
            ]),
        );
        expect(d.shipments?.map((s) => s.id)).toEqual(["normal-2", "normal-1"]);
    });

    it("treats REFUNDED and REFUNDED_AND_RETURNED as returned", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail([{ quantity: 1 }], [
                { id: "a", items: [], saleor_status: "REFUNDED" },
                { id: "b", items: [], saleor_status: "REFUNDED_AND_RETURNED" },
            ]),
        );
        expect(d.shipments?.every((s) => s.kind === "returned")).toBe(true);
    });
});
