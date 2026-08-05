/** Saleor-native order status, exactly as returned by GET /seller/orders (list and detail). */
export type OrderStatus =
  | "Draft"
  | "Unconfirmed"
  | "Unfulfilled"
  | "Partially Fulfilled"
  | "Fulfilled"
  | "Partially Returned"
  | "Returned"
  | "Cancelled"
  | "Expired";

/** The exact status vocabulary returned by GET /seller/orders, in backend sort order. */
export const REAL_ORDER_STATUSES: readonly OrderStatus[] = [
  "Draft",
  "Unconfirmed",
  "Unfulfilled",
  "Partially Fulfilled",
  "Fulfilled",
  "Partially Returned",
  "Returned",
  "Cancelled",
  "Expired",
];

export type OrderType = "B2B" | "B2C";
export type PaymentStatus =
  | "Pending"
  | "Partially Paid"
  | "Paid"
  | "Partially Refunded"
  | "Refunded"
  | "Overpaid";

/** Return/exchange lifecycle for rows shown in the Return Requests view. Matches the backend's
 * state machine exactly:
 *   pending → approved → received → qc_passed                       (normal item)
 *                                 ↘ "Defect Check" → qc_passed        (reason_code=damaged_item only)
 *                                 ↘ "QC Failed" → "Shipped Back"
 *   pending → rejected
 * There is no "Picked Up" status anymore — the delivery partner handles pickup directly; the
 * seller only records the inbound AWB via /add-tracking, which doesn't change status. */
export type ReturnStatus =
  | "Pending"
  | "Approved"
  | "Received"
  | "Defect Check"
  | "QC Passed"
  | "QC Failed"
  | "Shipped Back"
  | "Rejected";

/** Return/exchange status vocabulary, in lifecycle order. */
export const REAL_RETURN_STATUSES: readonly ReturnStatus[] = [
  "Pending",
  "Approved",
  "Received",
  "Defect Check",
  "QC Passed",
  "QC Failed",
  "Shipped Back",
  "Rejected",
];

/** Returns-tab subtab vocabulary — sent as-is to the backend's `tab` query param (GET
 * /seller/orders/returns), which does the pending/approved+received+defect-check/qc_failed+
 * shipped-back/rejected/qc_passed bucketing server-side. */
export const RETURN_SUBTABS = [
  { id: "all", label: "All returns" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "qc_failed", label: "QC failed" },
  { id: "rejected", label: "Rejected" },
  { id: "completed", label: "Completed" },
] as const;
export type ReturnSubtabId = (typeof RETURN_SUBTABS)[number]["id"];

/** Raw reason_code → human label, shared by the Returns list column and the detail modal. */
export const RETURN_REASON_CODE_LABELS: Record<string, string> = {
  damaged_item: "Damaged item",
  ordered_by_mistake: "Ordered by mistake",
  order_by_mistake: "Ordered by mistake",
  item_not_as_described: "Item not as described",
  not_as_described: "Item not as described",
  wrong_item_received: "Wrong item received",
  size_too_small: "Size too small",
  size_too_large: "Size too large",
};

export function returnReasonCodeLabel(code?: string | null): string | null {
  if (!code) return null;
  return RETURN_REASON_CODE_LABELS[code] ?? code;
}

export interface OrderLineItem {
  name: string;
  price: number | string;
  quantity: number;
  /** API fields — present on lines loaded from /seller/orders. */
  sku?: string | null;
  variantName?: string;
  unitPrice?: { amount: number; currency: string };
  totalPrice?: { amount: number; currency: string };
}

/** B2B Custom Orders tab only — pipeline status shown in the custom orders table. */
export type CustomOrderStatus =
  | "In Process"
  | "Pending Further Information"
  | "Fulfilled"
  | "Cancelled";

/** Real /seller/orders/custom status vocabulary, in API enum order. */
export const REAL_CUSTOM_ORDER_STATUSES: readonly CustomOrderStatus[] = [
  "In Process",
  "Pending Further Information",
  "Fulfilled",
  "Cancelled",
];

/** Allowed status transitions per the /seller/orders/custom status machine — fulfilled/cancelled are terminal. */
export const CUSTOM_ORDER_STATUS_TRANSITIONS: Record<CustomOrderStatus, readonly CustomOrderStatus[]> = {
  "In Process": ["Pending Further Information", "Fulfilled", "Cancelled"],
  "Pending Further Information": ["In Process", "Fulfilled", "Cancelled"],
  Fulfilled: [],
  Cancelled: [],
};

export type ProductInventoryType =
  | "ready_to_ship"
  | "pre_booking"
  | "stock_clearance"
  | "sale_or_return";

/** B2B + `pre_booking` only: fulfillment sub-state when order `status` is Partial Fulfillment. */
export type B2BPartialFulfillmentStatus =
  | "not_fulfilled"
  | "partially_fulfilled"
  | "fully_fulfilled";

export interface B2BPartialFulfillmentQuantities {
  total: number;
  fulfilled: number;
  delivered: number;
  pending: number;
}

export const PRODUCT_INVENTORY_TYPE_LABELS: Record<
  ProductInventoryType,
  string
> = {
  ready_to_ship: "Ready to Ship",
  stock_clearance: "Stock Clearance",
  pre_booking: "Pre-Booking",
  sale_or_return: "Sale or Return",
};

/**
 * Inventory + order-status columns: definite width at each breakpoint; shrinks with viewport
 * (`table-fixed`). Text scales inside `StatusBadge` / `InventoryTypeBadge`.
 */
export const TABLE_BADGE_PILL_COLUMN_CLASS =
  "min-w-0 whitespace-nowrap w-[6.5rem] max-w-[6.5rem] sm:w-[7.25rem] sm:max-w-[7.25rem] md:w-[8rem] md:max-w-[8rem] lg:w-[8.75rem] lg:max-w-[8.75rem] xl:w-[9.5rem] xl:max-w-[9.5rem] 2xl:w-[10rem] 2xl:max-w-[10rem] min-[1920px]:w-[12rem] min-[1920px]:max-w-[12rem]";

/**
 * Return Requests / custom orders table: return status labels include "QC Passed"/"QC Failed";
 * wider than {@link TABLE_BADGE_PILL_COLUMN_CLASS} so the badge is not truncated under `table-fixed`.
 */
export const TABLE_RETURN_STATUS_COLUMN_CLASS =
  "min-w-0 whitespace-nowrap w-[9.25rem] max-w-[9.25rem] sm:w-[10rem] sm:max-w-[10rem] md:w-[10.5rem] md:max-w-[10.5rem] lg:w-[11rem] lg:max-w-[11rem] xl:w-[11.5rem] xl:max-w-[11.5rem] 2xl:w-[12rem] 2xl:max-w-[12rem] min-[1920px]:w-[14rem] min-[1920px]:max-w-[14rem]";

/** Custom orders status column — fits "Pending Further information" under `table-fixed`. */
export const TABLE_CUSTOM_ORDER_STATUS_COLUMN_CLASS =
  "min-w-0 w-[11rem] max-w-[11rem] sm:w-[12rem] sm:max-w-[12rem] md:w-[13rem] md:max-w-[13rem] lg:w-[14rem] lg:max-w-[14rem] xl:w-[15rem] xl:max-w-[15rem] 2xl:w-[16rem] 2xl:max-w-[16rem] min-[1920px]:w-[20rem] min-[1920px]:max-w-[20rem]";

/**
 * Payment status column: same idea — fixed width per breakpoint, narrower than badge columns;
 * pills use `ORDER_PAYMENT_PILL_BASE` for matching text scale.
 */
export const TABLE_PAYMENT_STATUS_COLUMN_CLASS =
  "min-w-0 whitespace-nowrap w-[5rem] max-w-[5rem] sm:w-[5.75rem] sm:max-w-[5.75rem] md:w-[6.25rem] md:max-w-[6.25rem] lg:w-[6.75rem] lg:max-w-[6.75rem] xl:w-[7.25rem] xl:max-w-[7.25rem] 2xl:w-[7.75rem] 2xl:max-w-[7.75rem] min-[1920px]:w-[9rem] min-[1920px]:max-w-[9rem]";

export interface AllOrder {
  id: string;
  vendor: string;
  date: string;
  amount: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  type: OrderType;
  delivery: string;
  /** B2B / wholesale inventory classification for the order line. */
  inventoryType?: ProductInventoryType;
  /**
   * B2B + `pre_booking` only: must be set on mock/API rows.
   * When `status` is Delivered, use `fully_fulfilled`. When `status` is Partial Fulfillment, use one of the three values.
   */
  partial_fulfillment_status?: B2BPartialFulfillmentStatus;
  /** Optional counts used by Order Status card for B2B pre-booking fulfillment tracking. */
  partial_fulfillment_quantities?: B2BPartialFulfillmentQuantities;
  /** Line items for product list / return modal; optional for legacy mock rows. */
  productList?: OrderLineItem[];
  /** When set, the order appears in the Return Requests view. */
  returnStatus?: ReturnStatus;
  /** Return Requests view only: distinguishes return/exchange/claim (same underlying lifecycle, claims skip stages). */
  requestType?: "return" | "exchange" | "claim";
  /** Return Requests view only: the customer's stated reason code (e.g. "damaged_item"). */
  returnReasonCode?: string | null;
  /** Return Requests view only: the Mekya display order id (e.g. "ORD-20260714-JJKMEN") the return
   * was raised against — distinct from `id`, which holds the return's own id in this view. */
  orderId?: string;
  /**
   * When set, this B2B row is listed under **Custom Orders** (not Bulk Orders KPIs/table).
   * Use with {@link CustomOrderStatus} and `deadline`.
   */
  customOrderStatus?: CustomOrderStatus;
  /** Custom order promised date (e.g. `21-Oct-2025`). */
  deadline?: string;
  /** API fields — present on orders loaded from /seller/orders. */
  total?: { amount: number; currency: string };
  orderNumber?: string;
  saleorOrderId?: string;
  paymentMethod?: string;
  returnActivityCount?: number;
  /** Raw seller-facing order-level pipeline stage (order_status.code) powering the Orders tab's
   * subtabs AND the Order Status badge — prefixed "partially_" when the order's shipments/lines
   * aren't all at the same stage. The only field with correct partial-state semantics; prefer
   * this for display. */
  currentStatus?: MekyaOrderStatus;
  /** OrderFulfillmentCurrent.current_status (mekya_status on the API) — just the last recorded
   * fulfillment action, with no partial-state concept at all (never "partially_*"). Only a
   * fallback for the rare order with no order_status cache yet — do not prefer it for display,
   * or "partially_returned"/"partially_cancelled" etc. silently collapse to a plain status. */
  mekyaStatus?: MekyaOrderStatus;
  /** Saleor fulfillment global ID for this order's (first/primary) shipment — lets list rows act
   * on the shipment directly without an expand-fetch first. Null/absent if unfulfilled. */
  fulfillmentId?: string | null;
}

/** Order-level pipeline status (order_status.code on GET /seller/orders and /seller/orders/{id}) —
 * computed from all of an order's shipments; "partially_*" variants appear when they're not all
 * at the same stage. Defined here (not in lib/api/orders.ts) so AllOrder can reference it without
 * creating a circular import, since orders.ts already imports from this file. */
export type MekyaOrderStatus =
  | "pending"
  | "processing"
  | "ready_for_dispatch"
  | "ready"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled"
  | "partially_processing"
  | "partially_ready_for_dispatch"
  | "partially_ready"
  | "partially_shipped"
  | "partially_delivered"
  | "partially_returned"
  | "partially_cancelled";

/** Exchange tab subtab vocabulary — ExchangeOrderStatus has no "pending" state, so this stays
 * separate from ORDERS_TAB_SUBTABS below rather than gaining a Pending tab that could never match
 * any row. "delivered" is labeled "Completed" (not "Delivered") to match the Orders tab's own
 * final-stage wording in the filter spec — the id is unchanged, only the display label. */
export const ORDER_SUBTABS = [
  { id: "all", label: "All orders" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready for pickup" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Completed" },
] as const;

/** Orders tab subtab vocabulary, in pipeline order. Pending is its own bucket (orders with no
 * shipment activity yet at all), distinct from Processing (packing has started). */
export const ORDERS_TAB_SUBTABS = [
  { id: "all", label: "All orders" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready for pickup" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Completed" },
] as const;

export type OrderSubtabId = (typeof ORDERS_TAB_SUBTABS)[number]["id"];

export type UserStatus = "active" | "inactive" | "pending" | "suspended";
export type UserRole = "Brand" | "Agent" | "Retailer" | "Institutional Buyer";

export interface UserRow {
  id: string;
  vendor: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  onboardingdate: string;
}

export type ProductListingActiveStatus = "active" | "inactive";
export interface ProductRow {
  id: string;
  name: string;
  articleNumber: string;
  category: string;
  sizes: string[];
  colors: string[];
  inventoryType: ProductInventoryType;
  price: string;
  quantity: number;
  status: ProductListingActiveStatus;
  channels?: "b2c" | "b2b" | "both";
}
