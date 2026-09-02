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
        current_step?: string;
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
            stepper: { current_step: s.current_step ?? "processing", steps: [] },
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

describe("mapOrderDetail — per-item status", () => {
    /** ORD-20260821-SDC1VN: 3 single-unit lines, 2 delivered in their own parcels and 1
     *  cancelled. The order badged "Partially Cancelled" while the items table showed no
     *  state at all, so the cancelled unit was indistinguishable from the delivered ones. */
    it("gives a partially-cancelled order a distinct state per line", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [
                    { id: "L1", quantity: 1 },
                    { id: "L2", quantity: 1 },
                    { id: "L3", quantity: 1, cancelled_quantity: 1 },
                ],
                [
                    { items: [{ order_line_id: "L1", quantity: 1 }], current_step: "Delivered" },
                    { items: [{ order_line_id: "L2", quantity: 1 }], current_step: "Delivered" },
                ],
            ),
        );
        expect(d.items[0].statuses).toEqual([{ label: "Delivered", quantity: 1 }]);
        expect(d.items[1].statuses).toEqual([{ label: "Delivered", quantity: 1 }]);
        expect(d.items[2].statuses).toEqual([{ label: "Cancelled", quantity: 1 }]);
    });

    it("splits one line across the states its units are actually in", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 4, cancelled_quantity: 1 }],
                [
                    { items: [{ order_line_id: "L1", quantity: 2 }], current_step: "Delivered" },
                    { items: [{ order_line_id: "L1", quantity: 1 }], current_step: "Shipped" },
                ],
            ),
        );
        expect(d.items[0].statuses).toEqual([
            { label: "Delivered", quantity: 2 },
            { label: "Shipped", quantity: 1 },
            { label: "Cancelled", quantity: 1 },
        ]);
    });

    it("sums units sharing a state rather than repeating the label", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 3 }],
                [
                    { items: [{ order_line_id: "L1", quantity: 1 }], current_step: "Delivered" },
                    { items: [{ order_line_id: "L1", quantity: 2 }], current_step: "Delivered" },
                ],
            ),
        );
        expect(d.items[0].statuses).toEqual([{ label: "Delivered", quantity: 3 }]);
    });

    it("shows an untouched line as pending", () => {
        const d = mapApiOrderDetailToOrderDetailsData(detail([{ id: "L1", quantity: 2 }]));
        expect(d.items[0].statuses).toEqual([{ label: "Pending", quantity: 2 }]);
    });

    it("returns a voided parcel's units to pending instead of showing them twice", () => {
        // A cancelled fulfillment hands its units back to quantityToFulfill, so counting it
        // as a shipment state would claim the unit is both in a parcel and unshipped.
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 1 }],
                [
                    {
                        items: [{ order_line_id: "L1", quantity: 1 }],
                        saleor_status: "CANCELED",
                        current_step: "Cancelled",
                    },
                ],
            ),
        );
        expect(d.items[0].statuses).toEqual([{ label: "Pending", quantity: 1 }]);
    });

    it("accounts for every ordered unit exactly once", () => {
        const d = mapApiOrderDetailToOrderDetailsData(
            detail(
                [{ id: "L1", quantity: 5, cancelled_quantity: 2 }],
                [{ items: [{ order_line_id: "L1", quantity: 1 }], current_step: "Delivered" }],
            ),
        );
        const counted = (d.items[0].statuses ?? []).reduce((n, s) => n + s.quantity, 0);
        expect(counted).toBe(5);
    });
});
