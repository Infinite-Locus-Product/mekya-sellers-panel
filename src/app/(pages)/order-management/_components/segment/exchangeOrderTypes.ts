import type { ApiExchangeOrder, ExchangeOrderStatus, ExchangeSettlementStatus } from "@/lib/api/orders";

/** A real EXC-... order created on qc_pass for an exchange-type return — distinct from AllOrder,
 * with its own processing→ready→shipped→delivered status machine and settlement fields. */
export interface ExchangeOrderRow {
    id: string;
    returnId: string;
    originalOrderId: string;
    customerName: string;
    itemName: string;
    sku: string | null;
    replacementItemName: string;
    replacementSku: string | null;
    replacementVariantId: string | null;
    status: ExchangeOrderStatus;
    trackingNumber: string | null;
    courier: string | null;
    estimatedDeliveryAt: string | null;
    dispatchedAt: string | null;
    deliveredAt: string | null;
    extraPaymentDue: number | null;
    refundDue: number | null;
    settlementStatus: ExchangeSettlementStatus;
    createdAt: string;
}

export function mapApiExchangeOrder(r: ApiExchangeOrder): ExchangeOrderRow {
    return {
        id: r.exchange_id,
        returnId: r.return_id,
        originalOrderId: r.original_order_id,
        customerName: r.customer_name ?? "—",
        itemName: r.item_name,
        sku: r.sku ?? null,
        replacementItemName: r.replacement_item_name,
        replacementSku: r.replacement_sku ?? null,
        replacementVariantId: r.replacement_variant_id ?? null,
        status: r.status,
        trackingNumber: r.tracking_number,
        courier: r.courier,
        estimatedDeliveryAt: r.estimated_delivery_at,
        dispatchedAt: r.dispatched_at,
        deliveredAt: r.delivered_at,
        extraPaymentDue: r.extra_payment_due,
        refundDue: r.refund_due,
        settlementStatus: r.settlement_status,
        createdAt: r.created_at,
    };
}
