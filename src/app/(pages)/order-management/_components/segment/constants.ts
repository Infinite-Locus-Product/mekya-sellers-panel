import type {
    OrderStatus,
    OrderSubtabId,
    ProductInventoryType,
    ReturnStatus,
    ReturnSubtabId,
} from "@/lib/tableTypes";
import {
    PRODUCT_INVENTORY_TYPE_LABELS,
    REAL_ORDER_STATUSES,
    REAL_RETURN_STATUSES,
} from "@/lib/tableTypes";
import type { CustomOrderRequestStatus, ExchangeOrderStatus } from "@/lib/api/orders";

/** Shared table cell styling for payment pills */
export const ORDER_PAYMENT_PILL_BASE =
    "inline-flex min-h-[22px] w-full min-w-0 max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-1 text-center text-[9px] font-medium leading-none sm:min-h-7 sm:px-2.5 sm:text-[11px] xl:text-xs min-[1920px]:min-h-8 min-[1920px]:px-3 min-[1920px]:text-sm";

/** AppSelect trigger: responsive width and truncation for dense filter bars */
export const ORDER_FILTER_SELECT_TRIGGER_CLASS =
    "h-8 min-w-0 shrink px-1.5 text-left text-xs min-[1920px]:h-10 min-[1920px]:px-3 min-[1920px]:text-sm max-lg:flex-1 max-lg:basis-0 max-lg:!w-full max-lg:max-w-full max-lg:overflow-hidden lg:flex-none lg:w-max lg:!w-max lg:max-w-[min(100%,22rem)] lg:overflow-hidden max-[480px]:grow-0 max-[480px]:basis-full max-[480px]:!w-full max-[480px]:flex-none [&_[data-slot=select-value]]:min-w-0 max-lg:[&_[data-slot=select-value]]:flex-1 max-lg:[&_[data-slot=select-value]]:truncate lg:[&_[data-slot=select-value]]:max-w-full lg:[&_[data-slot=select-value]]:overflow-visible lg:[&_[data-slot=select-value]]:text-clip lg:[&_[data-slot=select-value]]:whitespace-nowrap";

/** Sibling top-level tabs for the Order Management page. B2B additionally gets "custom". */
export type OrderManagementTabId = "orders" | "exchange" | "returns" | "cancellation" | "custom";

/**
 * Subtabs of the Cancellation tab. Two genuinely different resources:
 *  - "orders": whole orders cancelled pre-shipment, plus RTOs (courier returned a shipped
 *    order). Backed by GET /seller/orders/cancellations.
 *  - "items": individual line items cancelled pre-shipment, leaving the rest of the order
 *    shippable. Backed by GET /seller/orders/cancelled-items.
 */
export const CANCELLATION_SUBTABS = [
    { id: "orders", label: "Cancelled Orders" },
    { id: "items", label: "Cancelled Items" },
] as const;

export type CancellationSubtabId = (typeof CANCELLATION_SUBTABS)[number]["id"];

/** Styling overrides so the reused `TabList` (variant="muted") matches this page's compact size. */
export const ORDER_TAB_LIST_CLASS = "h-8 w-fit shrink-0 p-1 min-[1920px]:h-[39px] min-[1920px]:p-1.5";
export const ORDER_TAB_ITEM_CLASS = "whitespace-nowrap px-3 py-1 text-[10px] min-[1920px]:px-4 min-[1920px]:text-xs";

/** Orders tab subtabs — client-side filter on AllOrder.currentStatus (see ORDER_SUBTABS in tableTypes.ts). */
export const ORDER_SUBTAB_LIST_CLASS = "mb-1";

/** Real /seller/orders status vocabulary — same for both channels, used by the "All Orders" multi-select. */
export const ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: string; value: OrderStatus }> =
    REAL_ORDER_STATUSES.map((value) => ({ label: value, value }));

export const DATE_FILTER_OPTIONS = [
    { label: "All Dates", value: "all_dates" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
] as const;

export const B2B_INVENTORY_TYPE_FILTER_OPTIONS: ReadonlyArray<{
    label: string;
    value: "all" | ProductInventoryType;
}> = [
    { label: "All Inventory Types", value: "all" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.ready_to_ship, value: "ready_to_ship" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.sale_or_return, value: "sale_or_return" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.stock_clearance, value: "stock_clearance" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.pre_booking, value: "pre_booking" },
];

export const PAGE_TITLE_ORDER_MANAGEMENT = "Order Management System";

// ─── Payment Status filter — same 3-option single-select everywhere it appears ─────────────
// (Orders, Exchange, Returns [All/Completed sub-tabs only], Cancellation, Custom Orders).
export const PAYMENT_STATUS_FILTER_OPTIONS = [
    { label: "All Payments", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
] as const;
export type PaymentStatusFilterValue = (typeof PAYMENT_STATUS_FILTER_OPTIONS)[number]["value"];

// ─── Orders / Exchange Status filter — pipeline vocabulary, scoped per sub-tab ──────────────
// The filter's chosen display wording ("Packed", "Completed") doesn't match the backend's own
// label for those two stages ("Ready for Pickup", "Delivered") — rather than rename that label
// everywhere else it's used (KPI tiles, the Order Status column, dashboards), this table keeps
// the real backend string as the option `value` (still sent as-is to `statuses`) and only swaps
// the `label` shown in this one filter control.
const ORDER_STATUS_DISPLAY_LABEL: Record<string, string> = {
    "Ready for Pickup": "Packed",
    "Partially Ready for Pickup": "Partially Packed",
    Delivered: "Completed",
    "Partially Delivered": "Partially Completed",
};

function orderStatusOption(realLabel: string): { label: string; value: string } {
    return { label: ORDER_STATUS_DISPLAY_LABEL[realLabel] ?? realLabel, value: realLabel };
}

const ALL_ORDER_STATUS_LABELS: readonly string[] = [
    "Pending",
    "Processing",
    "Ready for Pickup",
    "Shipped",
    "Delivered",
    "Partially Processing",
    "Partially Ready for Pickup",
    "Partially Shipped",
    "Partially Delivered",
    "Partially Returned",
    "Partially Cancelled",
    "Returned",
    "Cancelled",
];

/** Per sub-tab, only the statuses reachable from that stage onward — matches the backend's own
 * `pipeline_status` forward-matching semantics (see ORDER_SUBTAB_TO_PIPELINE_STATUS). */
const ORDER_STATUS_LABELS_BY_SUBTAB: Record<OrderSubtabId, readonly string[]> = {
    all: ALL_ORDER_STATUS_LABELS,
    pending: [
        "Pending",
        "Partially Processing",
        "Partially Ready for Pickup",
        "Partially Shipped",
        "Partially Delivered",
        "Partially Returned",
        "Partially Cancelled",
    ],
    processing: [
        "Processing",
        "Partially Processing",
        "Partially Ready for Pickup",
        "Partially Shipped",
        "Partially Delivered",
        "Partially Returned",
        "Partially Cancelled",
    ],
    ready: [
        "Ready for Pickup",
        "Partially Ready for Pickup",
        "Partially Shipped",
        "Partially Delivered",
        "Partially Returned",
        "Partially Cancelled",
    ],
    shipped: [
        "Shipped",
        "Partially Shipped",
        "Partially Delivered",
        "Partially Returned",
        "Partially Cancelled",
    ],
    delivered: ["Delivered", "Partially Delivered", "Partially Returned", "Partially Cancelled"],
};

export function getOrderStatusFilterOptions(
    subtab: OrderSubtabId
): ReadonlyArray<{ label: string; value: string }> {
    return (ORDER_STATUS_LABELS_BY_SUBTAB[subtab] ?? ALL_ORDER_STATUS_LABELS).map(orderStatusOption);
}

// ─── Exchange Status filter — Exchange's own 4-state shipment lifecycle, not the Orders ─────
// pipeline. An exchange shipment is a single replacement item (no multi-line partial-fulfillment
// concept), so unlike Orders there are no "Partially X" states, no Pending, and no Returned/
// Cancelled — those simply can't occur for an ExchangeOrder row (DB-enforced 4-value enum).
const EXCHANGE_STATUS_DISPLAY_LABEL: Record<ExchangeOrderStatus, string> = {
    processing: "Processing",
    ready: "Packed",
    shipped: "Shipped",
    delivered: "Completed",
};

const ALL_EXCHANGE_STATUSES: readonly ExchangeOrderStatus[] = ["processing", "ready", "shipped", "delivered"];

/** Exchange sub-tabs (ORDER_SUBTABS in tableTypes.ts) reuse the OrderSubtabId shape but only
 * ever set to "all" | "processing" | "ready" | "shipped" | "delivered" — "pending" is unreachable
 * since no exchange row is ever in that state. */
const EXCHANGE_STATUSES_BY_SUBTAB: Partial<Record<OrderSubtabId, readonly ExchangeOrderStatus[]>> = {
    all: ALL_EXCHANGE_STATUSES,
    processing: ["processing"],
    ready: ["ready"],
    shipped: ["shipped"],
    delivered: ["delivered"],
};

export function getExchangeStatusFilterOptions(
    subtab: OrderSubtabId
): ReadonlyArray<{ label: string; value: ExchangeOrderStatus }> {
    const values = EXCHANGE_STATUSES_BY_SUBTAB[subtab] ?? ALL_EXCHANGE_STATUSES;
    return values.map((value) => ({ label: EXCHANGE_STATUS_DISPLAY_LABEL[value], value }));
}

// ─── Returns Status filter — the app's own ReturnStatus labels already match the backend's ──
// real 8-value enum 1:1 (via RETURN_STATUS_TO_API in lib/api/orders.ts), so no relabeling is
// needed here — only per sub-tab scoping, matching the backend's own TAB_STATUSES buckets.
const RETURN_STATUSES_BY_SUBTAB: Record<ReturnSubtabId, readonly ReturnStatus[]> = {
    all: REAL_RETURN_STATUSES,
    pending: ["Pending"],
    in_progress: ["Approved", "Received", "Defect Check"],
    qc_failed: ["QC Failed", "Shipped Back"],
    rejected: ["Rejected"],
    completed: ["QC Passed"],
};

export function getReturnStatusFilterOptions(
    subtab: ReturnSubtabId
): ReadonlyArray<{ label: ReturnStatus; value: ReturnStatus }> {
    const values = RETURN_STATUSES_BY_SUBTAB[subtab] ?? REAL_RETURN_STATUSES;
    return values.map((value) => ({ label: value, value }));
}

/** Returns' Payment Status filter only makes sense once a request has reached a resolvable
 * payment outcome — hidden entirely on sub-tabs where nothing has been refunded/settled yet. */
export const RETURN_SUBTABS_WITH_PAYMENT_FILTER: ReadonlySet<ReturnSubtabId> = new Set(["all", "completed"]);

// ─── Returns Type filter — Return vs Exchange. The backend's third value, "claim", is an ────
// internal sub-flow (never surfaced as its own row in the seller Returns table today) so it's
// intentionally left off this filter's option list — it isn't part of the spec either.
export const RETURN_TYPE_FILTER_OPTIONS = [
    { label: "Return", value: "return" },
    { label: "Exchange", value: "exchange" },
] as const;

// ─── Cancellation Type filter — Cancelled vs RTO ─────────────────────────────────────────────
export const CANCELLATION_TYPE_FILTER_OPTIONS = [
    { label: "Cancelled", value: "cancelled" },
    { label: "RTO", value: "rto" },
] as const;

// ─── Custom Orders Status filter — same 5 real values as CUSTOM_ORDER_SUBTABS, with the ────
// filter-spec's own wording (kept local to this filter, not renamed app-wide in the KPI tiles/
// table/detail modal, which keep their existing CUSTOM_ORDER_REQUEST_STATUS_LABEL wording).
export const CUSTOM_ORDER_STATUS_FILTER_LABEL: Record<CustomOrderRequestStatus, string> = {
    pending_review: "Pending Review",
    awaiting_buyer_confirmation: "Awaiting Buyer Confirmation",
    buyer_confirmed: "Confirmed",
    buyer_declined: "Declined by Buyer",
    rejected: "Rejected by Seller",
};

export const CUSTOM_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{
    label: string;
    value: CustomOrderRequestStatus;
}> = (
    Object.keys(CUSTOM_ORDER_STATUS_FILTER_LABEL) as CustomOrderRequestStatus[]
).map((value) => ({ label: CUSTOM_ORDER_STATUS_FILTER_LABEL[value], value }));
