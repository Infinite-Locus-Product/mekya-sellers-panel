import type {
    OrderStatus,
    OrderSubtabId,
    ReturnStatus,
    ReturnSubtabId,
} from "@/lib/tableTypes";
import {
    PIPELINE_STATUS_LABELS,
    REAL_ORDER_STATUSES,
    REAL_RETURN_STATUSES,
} from "@/lib/tableTypes";
import type { CustomOrderRequestStatus, ExchangeOrderStatus } from "@/lib/api/orders";
import { CUSTOM_ORDER_REQUEST_STATUS_LABEL } from "./customOrderTypes";

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
// The filter's chosen display wording ("Packed") doesn't match the backend's own label for that
// stage ("Ready for Pickup") — rather than rename that label everywhere else it's used (KPI
// tiles, the Order Status column, dashboards), this table keeps the real backend string as the
// option `value` (still sent as-is to `statuses`) and only swaps the `label` shown in this one
// filter control. "Completed" is reserved for the tab that aggregates delivered/cancelled/
// returned (and their partial variants) — the individual "Delivered" status keeps its own name
// here so the two aren't conflated.
const ORDER_STATUS_DISPLAY_LABEL: Record<string, string> = {
    "Ready for Pickup": "Packed",
    "Partially Ready for Pickup": "Partially Packed",
};

function orderStatusOption(realLabel: string): { label: string; value: string } {
    return { label: ORDER_STATUS_DISPLAY_LABEL[realLabel] ?? realLabel, value: realLabel };
}

/** Single source of truth lives in tableTypes so the dashboard's own status filter and
 *  this one can't drift apart. */
const ALL_ORDER_STATUS_LABELS: readonly string[] = PIPELINE_STATUS_LABELS;

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
    // "Completed" tab (id "delivered") — every terminal outcome, not just a clean delivery:
    // full and partial delivered/cancelled/returned all count as the order being done.
    delivered: [
        "Delivered",
        "Partially Delivered",
        "Cancelled",
        "Partially Cancelled",
        "Returned",
        "Partially Returned",
    ],
};

/** Statuses a return can leave behind. Offered on B2C only — see below. */
const RETURNED_STATUS_LABELS: readonly string[] = ["Returned", "Partially Returned"];

export function getOrderStatusFilterOptions(
    subtab: OrderSubtabId,
    segment: "b2c" | "b2b" = "b2c"
): ReadonlyArray<{ label: string; value: string }> {
    const labels = ORDER_STATUS_LABELS_BY_SUBTAB[subtab] ?? ALL_ORDER_STATUS_LABELS;
    // The B2B section has no Returns tab (see getOrderManagementTabs), so a seller cannot
    // raise or work a return from there and the two returned statuses read as dead options.
    //
    // Note this hides the filter, not the data: a B2B order that *is* returned still appears
    // in the list with its Returned badge, it just can't be filtered to. Returns against B2B
    // orders do exist — they are raised elsewhere (admin portal / API) — so if that becomes
    // something sellers need to find, this is the line to revisit.
    const filtered =
        segment === "b2b" ? labels.filter((l) => !RETURNED_STATUS_LABELS.includes(l)) : labels;
    return filtered.map(orderStatusOption);
}

// ─── Exchange Status filter — the replacement order's shipment lifecycle ────────────────────
// A replacement is a real Saleor order now, so it starts Pending (QC passed, shipment owed) and
// advances on the same pipeline as Orders. An exchange is still a single item, so there are no
// "Partially X" states, and Returned/Cancelled remain outside the DB-enforced enum.
/** What an exchange's status is *called* — badges, detail panels, action buttons.
 *
 * The Exchange table used to render `row.status` itself, so the badge read the raw enum
 * code: a replacement sitting at the pickup stage showed a lowercase "ready" rather than
 * the stage's name, while the Orders tab beside it called the same stage "Ready for
 * Pickup". Two copies of this map already existed (the details modal and the status
 * action button); this is the one they all share, so the four places an exchange status
 * appears cannot drift apart again.
 *
 * Deliberately the Orders vocabulary, not the filter's below: the badge sits in the same
 * column position as the Orders tab's own status badge and must read the same way. */
export const EXCHANGE_STATUS_LABEL: Record<ExchangeOrderStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    ready: "Ready for Pickup",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

/** What the *filter control* calls each status — deliberately different from the badge.
 *
 * Same split, and the same reason, as ORDER_STATUS_DISPLAY_LABEL above: the filter says
 * "Packed" where the pipeline says "Ready for Pickup". Only the label differs; the value
 * sent to the API is the real code either way. */
const EXCHANGE_STATUS_DISPLAY_LABEL: Record<ExchangeOrderStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    ready: "Packed",
    shipped: "Shipped",
    delivered: "Completed",
    cancelled: "Cancelled",
};

const ALL_EXCHANGE_STATUSES: readonly ExchangeOrderStatus[] = [
    "pending",
    "processing",
    "ready",
    "shipped",
    "delivered",
    "cancelled",
];

/** Exchange sub-tabs share the Orders vocabulary (ORDER_SUBTABS aliases ORDERS_TAB_SUBTABS).
 * Pending is a real bucket: a newly QC-passed exchange sits there until a warehouse is picked. */
const EXCHANGE_STATUSES_BY_SUBTAB: Partial<Record<OrderSubtabId, readonly ExchangeOrderStatus[]>> = {
    all: ALL_EXCHANGE_STATUSES,
    pending: ["pending"],
    processing: ["processing"],
    ready: ["ready"],
    shipped: ["shipped"],
    // The "Completed" tab means every terminal outcome, exactly as it does for Orders (see
    // ORDER_STATUS_LABELS_BY_SUBTAB.delivered) — a cancelled exchange is finished, not owed.
    // Leaving it out is what kept a dead exchange sitting in the seller's Pending queue.
    delivered: ["delivered", "cancelled"],
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

// ─── Custom Orders Status filter ─────────────────────────────────────────────────────────────
// Options come straight from CUSTOM_ORDER_REQUEST_STATUS_LABEL so the dropdown can never word a
// status differently from the sub-tab or badge showing the same state.
export const CUSTOM_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{
    label: string;
    value: CustomOrderRequestStatus;
}> = (
    Object.keys(CUSTOM_ORDER_REQUEST_STATUS_LABEL) as CustomOrderRequestStatus[]
).map((value) => ({ label: CUSTOM_ORDER_REQUEST_STATUS_LABEL[value], value }));

/**
 * Status options for the Custom Orders toolbar, scoped to the active sub-tab.
 *
 * Every custom-order sub-tab except "All" *is* a single status, so a Status filter there could
 * only ever agree with the sub-tab (a no-op) or contradict it (guaranteed empty list). Returning
 * `undefined` hides the control, which is why only "All" gets options.
 */
export function getCustomOrderStatusFilterOptions(
    subtab: string
): ReadonlyArray<{ label: string; value: string }> | undefined {
    return subtab === "all" ? CUSTOM_ORDER_STATUS_FILTER_OPTIONS : undefined;
}
