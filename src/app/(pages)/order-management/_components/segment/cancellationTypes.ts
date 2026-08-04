import type { ApiCancellation, CancellationDisplayStatus, CancellationType } from "@/lib/api/orders";

/** A real cancelled/RTO order row from GET /seller/orders/cancellations — replaces filtering the
 * main order list by status=Cancelled. `id` is the Mekya display order id (used for API calls),
 * matching the convention AllOrder.id already uses elsewhere on this page. */
export interface CancellationRow {
    id: string;
    saleorOrderId: string;
    orderType: "B2C" | "B2B";
    fulfillmentId: string | null;
    type: CancellationType;
    displayStatus: CancellationDisplayStatus;
    reason: string | null;
    trackingNumber: string | null;
    courier: string | null;
    updatedAt: string;
}

export function mapApiCancellation(r: ApiCancellation): CancellationRow {
    return {
        id: r.display_order_id,
        saleorOrderId: r.saleor_order_id,
        orderType: r.order_type,
        fulfillmentId: r.fulfillment_id,
        type: r.type,
        displayStatus: r.display_status,
        reason: r.reason,
        trackingNumber: r.tracking_number,
        courier: r.courier,
        updatedAt: r.updated_at,
    };
}
