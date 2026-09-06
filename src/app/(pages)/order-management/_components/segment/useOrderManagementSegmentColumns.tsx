"use client";

import { useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import type { TableColumn } from "@/components/shared/DataTable";
import type { AllOrder, PaymentStatus, ReturnStatus } from "@/lib/tableTypes";
import {
    TABLE_BADGE_PILL_COLUMN_CLASS,
    TABLE_CUSTOM_ORDER_STATUS_COLUMN_CLASS,
    TABLE_PAYMENT_STATUS_COLUMN_CLASS,
    TABLE_RETURN_STATUS_COLUMN_CLASS,
    returnReasonCodeLabel,
} from "@/lib/tableTypes";
import { OrderViewIcon, OrderInvoiceIcon } from "@/assets/icons";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import type {
    CancelledItemRow,
    CancelledItemSettlementStatus,
    ExchangeOrderStatus,
} from "@/lib/api/orders";
import { EXCHANGE_STATUS_LABEL, ORDER_PAYMENT_PILL_BASE } from "./constants";
import { CancelledItemSettlementAction } from "./CancelledItemSettlementAction";
import { getOrderProductNames } from "./helpers";
import { CUSTOM_ORDER_REQUEST_STATUS_LABEL, type CustomOrderRequestRow } from "./customOrderTypes";
import type { ExchangeOrderRow } from "./exchangeOrderTypes";
import type { CancellationRow } from "./cancellationTypes";
import { CancellationReceivedAction } from "./CancellationReceivedAction";

const CANCELLED_ITEM_SETTLEMENT_LABEL: Record<CancelledItemSettlementStatus, string> = {
    not_applicable: "No refund due",
    refund_pending: "Refund pending",
    refunded: "Refunded",
};

const CANCELLED_ITEM_SETTLEMENT_VARIANT: Record<CancelledItemSettlementStatus, StatusVariant> = {
    not_applicable: "draft",
    refund_pending: "pending",
    refunded: "completed",
};

function renderOrderStatusCell(row: AllOrder) {
    return <OrderStatusBadge order={row} />;
}

const EXCHANGE_STATUS_VARIANT: Record<ExchangeOrderStatus, StatusVariant> = {
    pending: "pending",
    processing: "processing",
    ready: "pending",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "canceled",
};

const CUSTOM_ORDER_REQUEST_STATUS_VARIANT: Record<CustomOrderRequestRow["status"], StatusVariant> = {
    pending_review: "pending",
    awaiting_buyer_confirmation: "processing",
    buyer_confirmed: "delivered",
    buyer_declined: "canceled",
    rejected: "canceled",
};

function renderExchangeSettlementCell(row: ExchangeOrderRow) {
    if (row.settlementStatus === "not_applicable") {
        return <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">—</span>;
    }
    const amount =
        row.extraPaymentDue != null
            ? `+₹${row.extraPaymentDue.toLocaleString("en-IN")} due`
            : row.refundDue != null
              ? `₹${row.refundDue.toLocaleString("en-IN")} refund`
              : null;
    return (
        <div className="text-[11px] min-[1920px]:text-sm">
            <div className="font-medium text-foreground">
                {row.settlementStatus === "settled" ? "Settled" : "Pending"}
            </div>
            {amount ? <div className="text-muted-foreground">{amount}</div> : null}
        </div>
    );
}

const CANCELLATION_TYPE_LABEL: Record<CancellationRow["type"], string> = {
    cancelled: "Cancelled",
    rto: "RTO",
};

const CANCELLATION_DISPLAY_STATUS_LABEL: Record<CancellationRow["displayStatus"], string> = {
    no_return_needed: "No return needed",
    awaiting_warehouse: "Awaiting warehouse",
    received_restocked: "Received & restocked",
};

const PAYMENT_STATUS_PILL_STYLE: Record<PaymentStatus, string> = {
    Paid: "bg-black text-white",
    "Partially Paid": "bg-gray-700 text-white",
    Pending: "border border-[#979797] bg-white text-gray-800",
    "Partially Refunded": "border border-orange-300 bg-orange-50 text-orange-700",
    Refunded: "bg-gray-200 text-gray-800",
    Overpaid: "border border-blue-300 bg-blue-50 text-blue-700",
};

function renderPaymentStatusCell(value: PaymentStatus) {
    return (
        <span className={`${ORDER_PAYMENT_PILL_BASE} ${PAYMENT_STATUS_PILL_STYLE[value]}`}>{value}</span>
    );
}

/** Prefers the API's currency-aware total; falls back to re-parsing the legacy ₹-formatted mock string. */
function formatOrderAmount(row: AllOrder): string {
    if (row.total) return formatMoney(row.total);
    const numeric = Number(String(row.amount).replaceAll(/[^\d.]/g, ""));
    if (Number.isNaN(numeric)) return row.amount;
    return `₹${numeric.toLocaleString("en-IN")}`;
}

export interface UseOrderManagementSegmentColumnsParams {
    readonly segment: "b2c" | "b2b";
    readonly openCustomOrderDetails: (customOrderId: string) => void;
    readonly handleOrderClick: (orderId: string) => void;
    readonly onToggleExchangeExpand?: (exchangeId: string) => void;
    readonly expandedExchangeIds?: ReadonlySet<string>;
    readonly openReturnDetails: (order: AllOrder) => void;
    readonly openExchangeDetails: (exchangeId: string) => void;
    readonly handleInvoice: (orderId: string) => void;
    readonly expandedOrderIds: Set<string>;
    readonly onToggleOrderExpand: (orderId: string) => void;
    readonly onExchangeChanged: () => void;
    readonly onCancellationChanged: () => void;
    readonly onCancelledItemsChanged: () => void;
}

export function useOrderManagementSegmentColumns({
    segment,
    openCustomOrderDetails,
    handleOrderClick,
    onToggleExchangeExpand,
    expandedExchangeIds,
    openReturnDetails,
    openExchangeDetails,
    handleInvoice,
    expandedOrderIds,
    onToggleOrderExpand,
    onCancellationChanged,
    onCancelledItemsChanged,
}: UseOrderManagementSegmentColumnsParams): {
    customOrdersColumns: TableColumn<CustomOrderRequestRow>[];
    allOrdersColumns: TableColumn<AllOrder>[];
    b2bAllOrdersColumns: TableColumn<AllOrder>[];
    returnRequestsColumns: TableColumn<AllOrder>[];
    exchangeColumns: TableColumn<ExchangeOrderRow>[];
    cancellationColumns: TableColumn<CancellationRow>[];
    cancelledItemsColumns: TableColumn<CancelledItemRow>[];
} {
    const returnStatusVariant = useCallback((status: ReturnStatus): StatusVariant => {
        if (status === "Pending") return "pending";
        if (status === "Approved" || status === "Received") return "processing";
        if (status === "Defect Check") return "partial";
        if (status === "QC Failed" || status === "Rejected") return "canceled";
        if (status === "Shipped Back") return "shipped";
        return "completed"; // QC Passed
    }, []);

    const customOrdersColumns: TableColumn<CustomOrderRequestRow>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Custom Order ID",
                // The request's own CUST- reference. This rendered the raw UUID before, which
                // is unreadable and unquotable; the UUID stays the value the API is keyed on.
                cell: (row) => (
                    <span className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">
                        {row.customDisplayId ?? row.id}
                    </span>
                ),
            },
            {
                key: "vendorName",
                header: "Vendor",
                cell: (row) => (
                    <span className="text-[11px] text-foreground min-[1920px]:text-sm">{row.vendorName ?? "—"}</span>
                ),
            },
            {
                key: "customerName",
                header: "Customer",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.customerName ?? "—"}
                    </span>
                ),
            },
            {
                key: "requirementsPreview",
                header: "Requirements",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.requirementsPreview ?? "—"}
                    </span>
                ),
            },
            {
                key: "totalAmount",
                header: "Est. Value",
                cell: (row) => (
                    <span className="text-[11px] text-foreground min-[1920px]:text-sm">
                        {row.totalAmount != null ? formatMoney({ amount: row.totalAmount, currency: row.currency ?? "INR" }) : "—"}
                    </span>
                ),
            },
            {
                key: "createdAt",
                header: "Request Date",
                sortable: true,
                cell: (row) => (
                    <span className="text-[11px] text-foreground min-[1920px]:text-sm">
                        {formatDate(new Date(row.createdAt))}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                className: TABLE_CUSTOM_ORDER_STATUS_COLUMN_CLASS,
                cell: (row) => (
                    <StatusBadge
                        variant={CUSTOM_ORDER_REQUEST_STATUS_VARIANT[row.status]}
                        allowWrap={row.status === "awaiting_buyer_confirmation"}
                    >
                        {CUSTOM_ORDER_REQUEST_STATUS_LABEL[row.status]}
                    </StatusBadge>
                ),
            },
            {
                key: "linkedSaleorOrderId",
                header: "Linked Order",
                // The stored link is a Saleor global ID (opaque base64 that wrapped over three
                // lines here); the readable order number is what the seller recognises.
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.linkedDisplayOrderId ?? "—"}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View custom order"
                                onClick={() => openCustomOrderDetails(row.id)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [openCustomOrderDetails]
    );

    const expandColumn: TableColumn<AllOrder> = useMemo(
        () => ({
            key: "expand",
            header: "",
            className: "w-7",
            cell: (row) => (
                <button
                    type="button"
                    className="inline-flex size-6 items-center justify-center text-muted-foreground"
                    aria-label={expandedOrderIds.has(row.id) ? `Collapse ${row.id}` : `Expand ${row.id}`}
                    aria-expanded={expandedOrderIds.has(row.id)}
                    onClick={() => onToggleOrderExpand(row.id)}
                >
                    <ChevronRight
                        className={cn("size-4 transition-transform", expandedOrderIds.has(row.id) && "rotate-90")}
                        aria-hidden
                    />
                </button>
            ),
        }),
        [expandedOrderIds, onToggleOrderExpand]
    );

    /** Same chevron the Orders list uses, so an exchange expands to its replacement order's
     *  shipments — and the warehouse/qty panel — exactly as an ordinary order does. Only
     *  offered when a replacement order exists; without one there is nothing to expand. */
    const exchangeExpandColumn: TableColumn<ExchangeOrderRow> = useMemo(
        () => ({
            key: "expand",
            header: "",
            className: "w-7",
            cell: (row) =>
                row.replacementOrderId ? (
                    <button
                        type="button"
                        className="inline-flex size-6 items-center justify-center text-muted-foreground"
                        aria-label={
                            expandedExchangeIds?.has(row.id)
                                ? `Collapse ${row.id}`
                                : `Expand ${row.id}`
                        }
                        aria-expanded={expandedExchangeIds?.has(row.id) ?? false}
                        onClick={() => onToggleExchangeExpand?.(row.id)}
                    >
                        <ChevronRight
                            className={cn(
                                "size-4 transition-transform",
                                expandedExchangeIds?.has(row.id) && "rotate-90"
                            )}
                            aria-hidden
                        />
                    </button>
                ) : null,
        }),
        [expandedExchangeIds, onToggleExchangeExpand]
    );

    // Single-item rows go straight to the order detail page; multi-item rows toggle the shipment
    // expand row instead, since there's line-level detail worth showing inline first.
    const handleOrderIdClick = useCallback(
        (row: AllOrder) => {
            if (getOrderProductNames(row).length > 1) onToggleOrderExpand(row.id);
            else handleOrderClick(row.id);
        },
        [handleOrderClick, onToggleOrderExpand]
    );

    const allOrdersColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            expandColumn,
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <button
                        type="button"
                        onClick={() => handleOrderIdClick(row)}
                        className="text-[11px] font-medium text-foreground hover:underline min-[1920px]:text-sm"
                    >
                        {row.id}
                    </button>
                ),
            },
            { key: "vendor", header: "Customer Name" },
            {
                // sort_by=created — server-driven via DataTable's controlled sort, see OrderManagementSegmentClient.
                key: "date",
                header: "Order Date",
                sortable: true,
            },
            {
                key: "productList",
                header: "Product List",
                className: "w-[25%]",
                cell: (row) => {
                    const text = getOrderProductNames(row).join(", ");
                    return text ? (
                        <span className="text-[11px] leading-snug min-[1920px]:text-sm">{text}</span>
                    ) : (
                        <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">-</span>
                    );
                },
            },
            {
                // sort_by=total — server-driven via DataTable's controlled sort, see OrderManagementSegmentClient.
                key: "amount",
                header: "Total Amount",
                sortable: true,
                cell: (row) => formatOrderAmount(row),
            },
            {
                key: "status",
                header: "Order Status",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => renderOrderStatusCell(row),
            },
            {
                key: "paymentStatus",
                header: "Payment Status",
                className: TABLE_PAYMENT_STATUS_COLUMN_CLASS,
                cell: (row) => renderPaymentStatusCell(row.paymentStatus),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground sm:gap-2">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View order"
                                onClick={() => handleOrderClick(row.id)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="Generate invoice"
                                onClick={() => handleInvoice(row.id)}
                            >
                                <OrderInvoiceIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Generate Invoice</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [expandColumn, handleOrderIdClick, handleOrderClick, handleInvoice]
    );

    const b2bAllOrdersColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            expandColumn,
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <button
                        type="button"
                        onClick={() => handleOrderIdClick(row)}
                        className="text-[11px] font-medium text-foreground hover:underline min-[1920px]:text-sm"
                    >
                        {row.id}
                    </button>
                ),
            },
            { key: "vendor", header: "Customer Name" },
            {
                // sort_by=created — server-driven via DataTable's controlled sort, see OrderManagementSegmentClient.
                key: "date",
                header: "Order Date",
                sortable: true,
            },
            {
                // sort_by=total — server-driven via DataTable's controlled sort, see OrderManagementSegmentClient.
                key: "amount",
                header: "Order Total",
                sortable: true,
                cell: (row) => formatOrderAmount(row),
            },
            {
                key: "status",
                header: "Order Status",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => renderOrderStatusCell(row),
            },
            {
                key: "paymentStatus",
                header: "Payment Status",
                className: TABLE_PAYMENT_STATUS_COLUMN_CLASS,
                cell: (row) => renderPaymentStatusCell(row.paymentStatus),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground sm:gap-2">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View order"
                                onClick={() => handleOrderClick(row.id)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="Generate invoice"
                                onClick={() => handleInvoice(row.id)}
                            >
                                <OrderInvoiceIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Generate Invoice</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [expandColumn, handleOrderIdClick, handleOrderClick, handleInvoice]
    );

    const returnRequestsColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Return ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-black min-[1920px]:text-sm">{row.id}</span>
                ),
            },
            {
                key: "orderId",
                header: "Order ID",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.orderId ?? row.orderNumber ?? "—"}
                    </span>
                ),
            },
            { key: "vendor", header: "Customer Name" },
            {
                key: "date",
                header: "Request Date",
                sortable: true,
            },
            {
                key: "requestType",
                header: "Type",
                cell: (row) => (
                    <span className="text-[11px] capitalize text-muted-foreground min-[1920px]:text-sm">
                        {row.requestType ?? "return"}
                    </span>
                ),
            },
            {
                key: "returnReasonCode",
                header: "Return Reason",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {returnReasonCodeLabel(row.returnReasonCode) ?? "—"}
                    </span>
                ),
            },
            {
                key: "delivery",
                header: "Tracking",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">{row.delivery}</span>
                ),
            },
            {
                key: "paymentStatus",
                header: "Payment Status",
                className: TABLE_PAYMENT_STATUS_COLUMN_CLASS,
                cell: (row) => renderPaymentStatusCell(row.paymentStatus),
            },
            {
                key: "returnStatus",
                header: "Return Status",
                className: TABLE_RETURN_STATUS_COLUMN_CLASS,
                cell: (row) => {
                    const status = row.returnStatus;
                    if (!status)
                        return <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">—</span>;
                    return (
                        <StatusBadge variant={returnStatusVariant(status)}>
                            {status}
                        </StatusBadge>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View return request"
                                onClick={() => openReturnDetails(row)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [openReturnDetails, returnStatusVariant]
    );

    // Dedicated to Exchange (not reused from Returns) — Exchange is its own real order resource
    // (EXC-... id), not an AllOrder/filtered-Returns row.
    const exchangeColumns: TableColumn<ExchangeOrderRow>[] = useMemo(
        () => [
            exchangeExpandColumn,
            {
                key: "id",
                header: "Exchange ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-black min-[1920px]:text-sm">{row.id}</span>
                ),
            },
            {
                key: "originalOrderId",
                header: "Original Order",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.originalOrderId}
                    </span>
                ),
            },
            {
                key: "itemName",
                header: "Item",
                cell: (row) => (
                    <div className="text-[11px] leading-snug min-[1920px]:text-sm">
                        <div>{row.itemName}</div>
                        {row.sku ? (
                            <div className="text-[11px] text-muted-foreground">SKU: {row.sku}</div>
                        ) : null}
                    </div>
                ),
            },
            {
                key: "replacementItemName",
                header: "Replacement Item",
                cell: (row) => (
                    <div className="text-[11px] leading-snug min-[1920px]:text-sm">
                        <div>{row.replacementItemName}</div>
                        {row.replacementSku ? (
                            <div className="text-[11px] text-muted-foreground">SKU: {row.replacementSku}</div>
                        ) : null}
                    </div>
                ),
            },
            {
                key: "createdAt",
                header: "Created",
                sortable: true,
            },
            {
                key: "trackingNumber",
                header: "Tracking",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.trackingNumber ?? "—"}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => (
                    <StatusBadge variant={EXCHANGE_STATUS_VARIANT[row.status]}>
                        {EXCHANGE_STATUS_LABEL[row.status]}
                    </StatusBadge>
                ),
            },
            {
                key: "settlementStatus",
                header: "Settlement",
                cell: (row) => renderExchangeSettlementCell(row),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5">
                        <button
                            type="button"
                            className="inline-flex size-7 items-center justify-center text-muted-foreground min-[1920px]:size-8"
                            aria-label="View exchange details"
                            onClick={() => openExchangeDetails(row.id)}
                        >
                            <OrderViewIcon />
                        </button>
                    </div>
                ),
            },
        ],
        [exchangeExpandColumn, openExchangeDetails]
    );

    // Dedicated to Cancellation (not reused from Orders) — Cancellations is its own real resource,
    // distinguishing a true pre-shipment Cancelled order from an RTO. Tracking is B2C-only: a B2B
    // order can only be cancelled pre-shipment, so there's never a tracking number to show.
    const cancellationColumns: TableColumn<CancellationRow>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">{row.id}</span>
                ),
            },
            {
                key: "type",
                header: "Type",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {CANCELLATION_TYPE_LABEL[row.type]}
                    </span>
                ),
            },
            {
                key: "displayStatus",
                header: "Status",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {CANCELLATION_DISPLAY_STATUS_LABEL[row.displayStatus]}
                    </span>
                ),
            },
            {
                key: "reason",
                header: "Reason",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.reason ?? "—"}
                    </span>
                ),
            },
            ...(segment === "b2c"
                ? [
                      {
                          key: "trackingNumber",
                          header: "Tracking",
                          cell: (row: CancellationRow) => (
                              <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                                  {row.trackingNumber ?? "—"}
                              </span>
                          ),
                      } satisfies TableColumn<CancellationRow>,
                  ]
                : []),
            {
                key: "updatedAt",
                header: "Updated",
                sortable: true,
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View order"
                                onClick={() => handleOrderClick(row.id)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                        {row.displayStatus === "awaiting_warehouse" && row.fulfillmentId ? (
                            <CancellationReceivedAction
                                orderId={row.id}
                                fulfillmentId={row.fulfillmentId}
                                onDone={onCancellationChanged}
                            />
                        ) : null}
                    </div>
                ),
            },
        ],
        [segment, handleOrderClick, onCancellationChanged]
    );

    // Cancelled Items subtab — one row per cancelled line item. Deliberately its own column set
    // (like exchange/cancellation) rather than going through selectSegmentTableColumns, which is
    // only for AllOrder-typed tabs.
    const cancelledItemsColumns: TableColumn<CancelledItemRow>[] = useMemo(
        () => [
            {
                key: "displayOrderId",
                header: "Order ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">
                        {row.displayOrderId}
                    </span>
                ),
            },
            {
                key: "productName",
                header: "Cancelled Item",
                cell: (row) => (
                    <div className="min-w-0">
                        <span className="block truncate text-[11px] font-medium text-foreground min-[1920px]:text-sm">
                            {row.productName}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground min-[1920px]:text-xs">
                            {row.sku} · Qty {row.quantity}
                        </span>
                    </div>
                ),
            },
            {
                key: "reason",
                header: "Reason",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">{row.reason}</span>
                ),
            },
            {
                key: "restocked",
                header: "Restocked",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.restocked === true ? "Yes" : row.restocked === false ? "No" : "Not applied"}
                    </span>
                ),
            },
            {
                key: "refundAmount",
                header: "Refund Amount",
                cell: (row) => (
                    <span className="text-[11px] text-foreground min-[1920px]:text-sm">
                        {row.refundAmount === null
                            ? "—"
                            : formatMoney({ amount: row.refundAmount, currency: row.currency })}
                    </span>
                ),
            },
            {
                key: "settlementStatus",
                header: "Refund Status",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => (
                    <StatusBadge variant={CANCELLED_ITEM_SETTLEMENT_VARIANT[row.settlementStatus]}>
                        {CANCELLED_ITEM_SETTLEMENT_LABEL[row.settlementStatus]}
                    </StatusBadge>
                ),
            },
            {
                key: "cancelledAt",
                header: "Cancelled",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.cancelledAt ? row.cancelledAt.slice(0, 10) : "—"}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View order"
                                onClick={() => handleOrderClick(row.displayOrderId)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                        <CancelledItemSettlementAction
                            cancellationId={row.cancellationId}
                            currentStatus={row.settlementStatus}
                            currentReference={row.refundReference}
                            onDone={onCancelledItemsChanged}
                        />
                    </div>
                ),
            },
        ],
        [handleOrderClick, onCancelledItemsChanged]
    );

    return {
        customOrdersColumns,
        allOrdersColumns,
        b2bAllOrdersColumns,
        returnRequestsColumns,
        exchangeColumns,
        cancellationColumns,
        cancelledItemsColumns,
    };
}
