import { authService } from "@/lib/auth/authService";
import { getPublicApiUrl } from "@/lib/env";
import { formatMoney } from "@/lib/utils";
import type {
  AllOrder,
  MekyaOrderStatus,
  OrderStatus,
  PaymentStatus,
  ProductInventoryType,
  ReturnStatus,
} from "@/lib/tableTypes";

// ─── GET /seller/orders ───────────────────────────────────────────────────────

interface ApiMoney {
  amount: number;
  currency: string;
}

interface ApiOrderLineItem {
  id?: string;
  product_name: string;
  variant_name?: string;
  sku?: string | null;
  quantity: number;
  /** Units not yet attached to any shipment. */
  quantity_to_fulfill?: number | null;
  /** Units cancelled via item-level cancellation. Saleor keeps reporting the original
   *  `quantity` (order lines are immutable post-confirmation), so this is the only
   *  signal that part or all of a line is dead. */
  cancelled_quantity?: number | null;
  unit_price: ApiMoney;
  unit_price_net?: ApiMoney;
  undiscounted_unit_price?: ApiMoney;
  total_price?: ApiMoney;
  total_price_net?: ApiMoney;
  tax_rate?: number;
  thumbnail?: { url: string } | null;
}

export interface ApiOrder {
  order_id: string;
  saleor_order_id?: string;
  number?: string;
  created: string;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: string;
  channel: string;
  total: ApiMoney;
  customer_name?: string;
  customer_email?: string;
  vendor_name?: string;
  tracking_number?: string | null;
  inventory_type?: string;
  return_activity_count?: number;
  /** Computed from all of this order's shipments via derive_order_status() — powers the Orders
   * tab's subtabs, action-button gating, and the Order Status badge. "code" is prefixed
   * "partially_" when the order's shipments/lines aren't all at the same stage — the only field
   * that correctly represents partial state; prefer this over `mekya_status` for display. */
  order_status?: { code: MekyaOrderStatus; label: string };
  /** OrderFulfillmentCurrent.current_status — just the last recorded fulfillment action, with no
   * partial-state concept at all (never "partially_*"). Only a fallback for the rare order with
   * no order_status cache yet — do not prefer it over order_status.code for display, or
   * "partially_returned"/"partially_cancelled" etc. silently collapse to a plain base status. */
  mekya_status?: MekyaOrderStatus | null;
  /** Saleor fulfillment global ID for this order's (first/primary) shipment — null if unfulfilled. */
  fulfillment_id?: string | null;
  lines?: ApiOrderLineItem[];
}

export function mapApiOrder(r: ApiOrder): AllOrder {
  const isB2B = r.channel?.toLowerCase() === "b2b";
  return {
    id: r.order_id,
    saleorOrderId: r.saleor_order_id,
    orderNumber: r.number,
    vendor: r.customer_name ?? "—",
    date: r.created.slice(0, 10),
    amount: formatMoney(r.total),
    total: r.total,
    status: r.status,
    // currentStatus (order_status.code) drives subtab filtering, action-button gating, and the
    // Order Status badge — it's the only field with correct partial-state semantics. mekyaStatus
    // is just the last recorded fulfillment action (never "partially_*") — a fallback only, see
    // renderOrderStatusCell.
    currentStatus: r.order_status?.code,
    mekyaStatus: r.mekya_status ?? undefined,
    fulfillmentId: r.fulfillment_id,
    paymentStatus: r.payment_status ?? "Pending",
    paymentMethod: r.payment_method,
    type: isB2B ? "B2B" : "B2C",
    delivery: r.tracking_number ?? "—",
    inventoryType: r.inventory_type as ProductInventoryType | undefined,
    returnActivityCount: r.return_activity_count ?? 0,
    productList: r.lines?.map((item) => ({
      name: item.product_name,
      price: item.unit_price.amount,
      quantity: item.quantity,
      sku: item.sku,
      variantName: item.variant_name,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
  };
}

/** Base (non-"partially_") pipeline status — the only values `pipeline_status` accepts. The
 * backend matches both this exact code and its "partially_" counterpart server-side.
 * "completed" is a separate sentinel, not a real order_status code: it means *nothing* is
 * left pending or actively moving, which the dominant-bucket label alone can't express — see
 * find_ids_for_completed_orders backend-side. */
export type PipelineStatusFilter = Exclude<MekyaOrderStatus, `partially_${string}`> | "completed";

export interface ListOrdersParams {
  channel?: "b2b" | "b2c";
  /** Multi-value: sent as repeated ?statuses= query params. Matched server-side against a mixed
   * vocabulary (the Mekya pipeline label when synced, else the raw Saleor label — see
   * `_ORDER_STATUS_MAP`/`label_for_code` backend-side), so this is a plain string, not just
   * `OrderStatus` — the filter UI sends real pipeline labels like "Ready for Pickup", which
   * aren't Saleor statuses at all. */
  statuses?: string[];
  /** Server-side pipeline-stage filter (order_status.code) — matches this status and its
   * "partially_" counterpart. Each distinct value pages independently (its own cursor space). */
  pipeline_status?: PipelineStatusFilter;
  /** Substring match on payment gateway, e.g. "mirumiru", "stripe". */
  payment_method?: string;
  /** Bucketed payment-status filter — "pending" covers Pending/Partially Paid; "completed"
   * covers Paid/Overpaid/Partially Refunded/Refunded (a refund after full payment stays
   * "completed", it doesn't revert to "pending"). */
  payment_status?: "pending" | "completed";
  /** ISO 8601, inclusive. Order created >= this date. */
  date_from?: string;
  /** ISO 8601, inclusive. Order created <= this date. */
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  sort_by?: "created" | "number" | "total";
  sort_dir?: "asc" | "desc";
  /** Searches order ID, order number, customer name, product name, variant name, SKU. Max 128 chars. */
  search?: string;
  /** Opaque cursor from a previous response's next_cursor. Keep all other filters identical between pages. */
  cursor?: string;
  /** 1-50, default 20. */
  limit?: number;
}

export interface ListOrdersResponse {
  orders: AllOrder[];
  has_next: boolean;
  next_cursor: string | null;
}

export async function listOrders(params?: ListOrdersParams): Promise<ListOrdersResponse> {
  const query = new URLSearchParams();
  if (params?.channel) query.set("channel", params.channel);
  for (const status of params?.statuses ?? []) query.append("statuses", status);
  if (params?.pipeline_status) query.set("pipeline_status", params.pipeline_status);
  if (params?.payment_method) query.set("payment_method", params.payment_method);
  if (params?.payment_status) query.set("payment_status", params.payment_status);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  if (params?.amount_min !== undefined) query.set("amount_min", String(params.amount_min));
  if (params?.amount_max !== undefined) query.set("amount_max", String(params.amount_max));
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.sort_dir) query.set("sort_dir", params.sort_dir);
  if (params?.search) query.set("search", params.search);
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const res = await authService.api.get<{
    orders: ApiOrder[];
    has_next: boolean;
    next_cursor: string | null;
  }>(`/seller/orders${qs ? `?${qs}` : ""}`);
  const data = res.data ?? { orders: [], has_next: false, next_cursor: null };
  return {
    orders: (data.orders ?? []).map(mapApiOrder),
    has_next: data.has_next ?? false,
    next_cursor: data.next_cursor ?? null,
  };
}

// ─── GET /seller/orders/kpis ──────────────────────────────────────────────────

/** Item counts, not order or shipment counts: every field is items x quantity, and counts
 *  only the lines this seller owns. delivered/returned/exchange/cancelled are mutually
 *  exclusive per unit, so they sum to at most total_items. */
export interface OrderKpis {
  /** Every unit this seller has sold, whatever state it is now in. */
  total_items: number;
  /** Units currently sitting delivered. A unit later returned moves out of this figure. */
  delivered_items: number;
  /** Units on QC-passed exchange requests. Pending or rejected exchanges count for nothing
   *  here — they have not produced an exchanged item. */
  exchange_items: number;
  /** Units on QC-passed return requests, the same rule the returns analytics uses. */
  returned_items: number;
  /** Units cancelled, whether by Saleor or by a seller-side line cancellation. */
  cancelled_items: number;
}

/** `channel` scopes the figures so the B2C and B2B pages each report their own; omitted,
 *  the backend counts both. */
export async function getOrderKpis(channel?: "b2c" | "b2b"): Promise<OrderKpis> {
  const query = new URLSearchParams();
  if (channel) query.set("channel", channel);
  const qs = query.toString();
  const res = await authService.api.get<OrderKpis>(
    `/seller/orders/kpis${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

// ─── GET /seller/orders/returns/kpis ──────────────────────────────────────────

export interface ReturnsKpis {
  total_returns: number;
  pending_review: number;
  completed: number;
  total_refund: { amount: number; currency: string };
}

export interface GetReturnsKpisParams {
  channel?: "b2b" | "b2c";
  date_from?: string;
  date_to?: string;
}

const EMPTY_RETURNS_KPIS: ReturnsKpis = {
  total_returns: 0,
  pending_review: 0,
  completed: 0,
  total_refund: { amount: 0, currency: "INR" },
};

export async function getReturnsKpis(params?: GetReturnsKpisParams): Promise<ReturnsKpis> {
  const query = new URLSearchParams();
  if (params?.channel) query.set("channel", params.channel);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  const qs = query.toString();
  const res = await authService.api.get<ReturnsKpis>(
    `/seller/orders/returns/kpis${qs ? `?${qs}` : ""}`,
  );
  return res.data ?? EMPTY_RETURNS_KPIS;
}

// ─── GET /seller/orders/returns/analytics ─────────────────────────────────────

export interface ReturnsAnalyticsSummaryPoint {
  label: string;
  date_from: string;
  date_to: string;
  value: number;
  display_value: string;
}

export interface ReturnsAnalyticsSummary {
  current: ReturnsAnalyticsSummaryPoint;
  previous: ReturnsAnalyticsSummaryPoint;
  change_percent: number | null;
  change_direction: "positive" | "negative" | "neutral";
  display_change: string;
}

export interface ReturnsTrendPoint {
  label: string;
  value: number;
}

export interface ReturnsSnapshotItem {
  type: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ReturnsAnalytics {
  period: { date_from: string; date_to: string };
  summary: ReturnsAnalyticsSummary;
  historical_trends: {
    granularity: "hour" | "day" | "month";
    series: ReturnsTrendPoint[];
    note: string | null;
  };
  reasons: { available: boolean; items: ReturnsSnapshotItem[] };
  /** Gender breakdown of the returned products — not product category. */
  gender: { available: boolean; items: ReturnsSnapshotItem[] };
  return_rate: { available: boolean; items: ReturnsSnapshotItem[] };
  meta: {
    returns_in_period: number;
    returns_scanned: number;
    returns_truncated: boolean;
  };
}

export interface GetReturnsAnalyticsParams {
  /** Inclusive, YYYY-MM-DD. */
  date_from: string;
  /** Inclusive, YYYY-MM-DD. */
  date_to: string;
  channel?: "b2b" | "b2c";
}

export async function getReturnsAnalytics(
  params: GetReturnsAnalyticsParams,
): Promise<ReturnsAnalytics> {
  const query = new URLSearchParams();
  query.set("date_from", params.date_from);
  query.set("date_to", params.date_to);
  if (params.channel) query.set("channel", params.channel);
  const res = await authService.api.get<ReturnsAnalytics>(
    `/seller/orders/returns/analytics?${query.toString()}`,
  );
  return res.data;
}

// ─── GET /seller/orders/{order_id} ───────────────────────────────────────────

export interface ApiAddress {
  full_name?: string | null;
  company_name?: string | null;
  street_address_1?: string | null;
  street_address_2?: string | null;
  city?: string | null;
  city_area?: string | null;
  postal_code?: string | null;
  country_area?: string | null;
  country?: string | null;
  country_code?: string | null;
  phone?: string | null;
}

export interface ApiOrderDetailCustomer {
  name: string;
  email: string;
  phone?: string | null;
  billing_address?: ApiAddress | null;
  shipping_address?: ApiAddress | null;
}

export interface ApiShipmentItem {
  /** Joins to lines[].id. One line can appear in multiple shipments if split across batches — always join on this, not array index. */
  order_line_id?: string;
  product_name: string;
  variant_name?: string;
  sku?: string | null;
  /** Quantity in THIS shipment — may be less than the line's total ordered quantity. */
  quantity: number;
}

/**
 * The Mekya shipment-level status set (stepper key), per the backend status reference.
 * Distinct from the raw Saleor fulfillment status below, and from the order-level
 * `MekyaOrderStatus` (tableTypes.ts) — that one is computed across all of an order's shipments.
 */
export type FulfillmentStatus =
  | "pending"
  | "order_placed"
  | "processing"
  | "ready_for_dispatch"
  | "ready"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled";

/** Raw Saleor Fulfillment.status, as returned on shipment.saleor_status. */
export type SaleorFulfillmentStatus =
  | "FULFILLED"
  | "RETURNED"
  | "REFUNDED"
  | "REFUNDED_AND_RETURNED"
  | "REPLACED"
  | "CANCELED"
  | "WAITING_FOR_APPROVAL";

export interface ApiStepperStep {
  key: FulfillmentStatus;
  label: string;
  completed: boolean;
  /** ISO 8601, from the OrderFulfillmentStatusEvent row for this step — null if not recorded yet. */
  timestamp: string | null;
}

export interface ApiShipmentStepper {
  /** Label of the current stage. */
  current_step: string;
  steps: ApiStepperStep[];
}

export interface ApiShipment {
  id: string;
  created_at: string;
  tracking_number: string | null;
  warehouse?: string | null;
  saleor_status: SaleorFulfillmentStatus;
  items: ApiShipmentItem[];
  stepper: ApiShipmentStepper;
}

/** A raw Saleor order-history event (audit log), e.g. "DRAFT_CREATED", "CONFIRMED", "FULFILLED". */
export interface ApiOrderEvent {
  id: string;
  date: string;
  type: string;
  message?: string | null;
  user?: string | null;
}

export interface ApiOrderDiscount {
  name: string;
  reason?: string | null;
  value: number;
  value_type: "PERCENTAGE" | "FIXED" | string;
  amount: ApiMoney;
}

export interface ApiOrderDetail {
  invoice_number: string;
  invoice_date?: string;
  order_number: string;
  /**
   * Widened from the OrderStatus enum: observed in the wild sending richer derived labels
   * (e.g. "Partially Shipped") beyond the documented Saleor-native set — display it as-is,
   * don't assume it's one of the 9 known values.
   */
  status: string;
  /** Structured counterpart to `status` — richer than the list endpoint's order_status: also
   * carries the un-prefixed base code, whether it's a "partially_*" state, and a per-stage
   * shipment-count breakdown. */
  order_status?: {
    code: MekyaOrderStatus;
    label: string;
    base: MekyaOrderStatus;
    partial: boolean;
    total_units: number;
    breakdown: Partial<Record<MekyaOrderStatus, number>>;
  };
  payment_status: PaymentStatus;
  channel: string;
  vendor?: { name: string; seller_user_id?: string };
  customer: ApiOrderDetailCustomer;
  shipping?: { method: string; price: ApiMoney };
  subtotal?: ApiMoney;
  total?: ApiMoney;
  total_captured?: ApiMoney;
  discounts?: ApiOrderDiscount[];
  shipments: ApiShipment[];
  lines: ApiOrderLineItem[];
  /** Saleor order-history log, not a fulfillment stepper — shipments[].stepper drives the tracking UI instead. */
  timeline?: ApiOrderEvent[];
  /** Set only when this order was created by a buyer confirming a custom-order request.
   *  Null for ordinary orders, which is what keeps the fulfilment confirmation off them. */
  custom_order?: ApiOrderCustomOrderLink | null;
}

export interface ApiOrderCustomOrderLink {
  id: string;
  custom_status: string;
  contact_person: string | null;
  customer_email: string | null;
}

export async function getOrderDetail(orderId: string): Promise<ApiOrderDetail> {
  const res = await authService.api.get<ApiOrderDetail>(
    `/seller/orders/${encodeURIComponent(orderId)}`,
  );
  return res.data;
}

// ─── Shipment management ─────────────────────────────────────────────────────
// Seller-facing forward status machine: processing → ready → shipped → delivered. Cancel is only
// available from pending/order_placed/processing/ready — not once a shipment is out (shipped or
// delivered); use rtoReceiveShipment for the post-dispatch "came back" path instead.

export interface FulfillOrderRequest {
  tracking_number?: string;
  courier?: string;
  tracking_url?: string;
  /** Omit to fulfill all currently-unfulfilled lines; pass to fulfill only a subset (splitting the
   * order into multiple shipments — call again with the remaining line_ids for the next one). */
  line_ids?: string[];
}

export interface FulfillOrderResponse {
  order_id: string;
  fulfillment_id: string;
  status: string;
  tracking_number: string | null;
  fulfilled_at: string;
  message: string;
}

/** Creates a shipment for the given (or, if omitted, all unfulfilled) lines. Starts at "processing". */
export async function fulfillOrder(
  displayOrderId: string,
  body: FulfillOrderRequest = {},
): Promise<FulfillOrderResponse> {
  const res = await authService.api.post<FulfillOrderResponse>(
    `/seller/orders/${encodeURIComponent(displayOrderId)}/fulfill`,
    body,
  );
  return res.data;
}

export interface WarehouseCandidate {
  saleor_warehouse_id: string;
  name: string;
  city: string;
  pincode: string;
  /** null if geo data isn't available for this warehouse. */
  distance_km: number | null;
  /** Current load indicator — lower is less busy. */
  open_shipments: number;
}

/** Warehouses serviceable for `deliveryPincode`, sorted nearest-first then least-busy. */
export async function getWarehouseCandidates(
  orderId: string,
  deliveryPincode: string,
): Promise<WarehouseCandidate[]> {
  const res = await authService.api.get<{ candidates: WarehouseCandidate[] }>(
    `/seller/orders/${encodeURIComponent(orderId)}/warehouse-candidates?delivery_pincode=${encodeURIComponent(deliveryPincode)}`,
  );
  return res.data.candidates ?? [];
}

export interface CreateShipmentRequest {
  delivery_pincode: string;
  order_lines: { order_line_id: string; sku_id: string; quantity: number }[];
  fulfillment_model?: "self_fulfilled";
  /** From getWarehouseCandidates — overrides the seller's default single warehouse. */
  override_saleor_warehouse_id?: string;
}

/** The real "make a shipment from selected items + a chosen warehouse" endpoint. */
export async function createShipment(
  orderId: string,
  body: CreateShipmentRequest,
): Promise<FulfillOrderResponse> {
  const res = await authService.api.post<FulfillOrderResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/shipments`,
    body,
  );
  return res.data;
}

export type ShipmentPatchStatus = "processing" | "ready" | "shipped" | "delivered";

export interface UpdateShipmentStatusRequest {
  status: ShipmentPatchStatus;
  /** Synced to Saleor when status is "shipped". */
  tracking_number?: string;
  courier?: string;
  contact_person?: string;
  contact_phone?: string;
  estimated_delivery_at?: string;
  /** Max 500 chars. */
  note?: string;
}

export interface UpdateShipmentStatusResponse {
  order_id: string;
  fulfillment_id: string;
  status: string;
  tracking_number: string | null;
  courier?: string | null;
  /** Set when status is "shipped". */
  dispatched_at?: string | null;
  /** Set when status is "delivered". */
  delivered_at?: string | null;
  updated_at: string;
}

export async function updateShipmentStatus(
  orderId: string,
  fulfillmentId: string,
  body: UpdateShipmentStatusRequest,
): Promise<UpdateShipmentStatusResponse> {
  const res = await authService.api.patch<UpdateShipmentStatusResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/shipments/${encodeURIComponent(fulfillmentId)}/status`,
    body,
  );
  return res.data;
}

export interface CancelShipmentResponse {
  order_id: string;
  fulfillment_id: string;
  status: string;
  reason: string;
  cancelled_at: string;
}

/** Calls orderFulfillmentCancel in Saleor to restock inventory. `reason` is required, 1-500 chars. */
export async function cancelShipment(
  orderId: string,
  fulfillmentId: string,
  reason: string,
): Promise<CancelShipmentResponse> {
  const res = await authService.api.post<CancelShipmentResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/shipments/${encodeURIComponent(fulfillmentId)}/cancel`,
    { reason },
  );
  return res.data;
}

export interface RtoReceivedRequest {
  /** Required. */
  reason: string;
  note?: string;
}

export interface RtoReceivedResponse {
  order_id: string;
  fulfillment_id: string;
  status: string;
  reason: string;
  note: string | null;
  received_at: string;
}

/** Marks a shipment that came back (RTO) as received/restocked at the warehouse — no QC step. */
export async function rtoReceiveShipment(
  orderId: string,
  fulfillmentId: string,
  body: RtoReceivedRequest,
): Promise<RtoReceivedResponse> {
  const res = await authService.api.post<RtoReceivedResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/shipments/${encodeURIComponent(fulfillmentId)}/rto-received`,
    body,
  );
  return res.data;
}

/** Joins the inferred Saleor-style address fields into a single display line. */
export function formatApiAddress(addr?: ApiAddress | null): string {
  if (!addr) return "";
  const name = addr.full_name ?? "";
  const line = [
    addr.street_address_1,
    addr.street_address_2,
    addr.city,
    addr.country_area,
    addr.postal_code,
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");
  return [name, addr.company_name, line].filter(Boolean).join(" — ");
}

// ─── GET /seller/orders/returns ──────────────────────────────────────────────
// Returns and exchanges share the same list/detail/lifecycle endpoints; request_type is the only
// distinguishing field. Neither the list nor detail response carries a currency or per-order id —
// only a human-readable saleor_order_number — so amounts default to INR display and there is no
// order-detail deep link from a return row.

interface ApiReturnLine {
  order_line_id: string;
  product_name: string;
  sku?: string | null;
  quantity: number;
  /** e.g. "pending" | "approved" | "rejected" | "skipped" | "completed" — kept loose, backend list may grow. */
  resolution_status: string;
}

interface ApiReturnEvent {
  type: string;
  message: string;
  date: string;
  user?: string | null;
}

export type ReturnRequestType = "return" | "exchange" | "claim";

/** GET /seller/orders/returns `tab` param — server-side bucketing (pending / approved+received+
 * qc_pass_defect_check / qc_failed+qc_fail_shipped / rejected / qc_passed). Send `status` instead
 * for a single exact-status filter — the backend ignores `status` whenever `tab` is also set. */
export type ReturnTab = "pending" | "in_progress" | "qc_failed" | "rejected" | "completed";

interface ApiReturn {
  id: string;
  return_id: string;
  order_id: string;
  saleor_order_id?: string;
  request_type: ReturnRequestType;
  /** "pending" | "approved" | "received" | "qc_pass_defect_check" | "qc_passed" | "qc_failed" | "qc_fail_shipped" | "rejected". */
  status: string;
  number?: string;
  saleor_order_number?: string;
  customer_name?: string;
  reason_code?: string | null;
  created_at?: string;
  request_date?: string;
  /** Inbound AWB (customer → warehouse), set via /add-tracking. */
  return_tracking_number?: string | null;
  /** Outbound AWB (warehouse → customer), set via /reship. */
  reship_tracking_number?: string | null;
  /** Original-payment refund state for this return — null until relevant (e.g. exchanges). */
  payment_status?: "pending" | "refunded" | null;
}

const RETURN_STATUS_MAP: Record<string, ReturnStatus> = {
  pending: "Pending",
  approved: "Approved",
  received: "Received",
  qc_pass_defect_check: "Defect Check",
  qc_passed: "QC Passed",
  qc_failed: "QC Failed",
  qc_fail_shipped: "Shipped Back",
  rejected: "Rejected",
};

const RETURN_STATUS_TO_API: Record<ReturnStatus, string> = {
  Pending: "pending",
  Approved: "approved",
  Received: "received",
  "Defect Check": "qc_pass_defect_check",
  "QC Passed": "qc_passed",
  "QC Failed": "qc_failed",
  "Shipped Back": "qc_fail_shipped",
  Rejected: "rejected",
};

function mapApiReturn(r: ApiReturn): AllOrder {
  return {
    id: r.return_id,
    orderId: r.order_id,
    vendor: r.customer_name ?? "—",
    date: r.request_date ?? r.created_at ?? "",
    // The list endpoint doesn't return an amount — only the detail response's lines_total does.
    amount: "—",
    status: "Unfulfilled",
    paymentStatus: r.payment_status === "refunded" ? "Refunded" : "Pending",
    type: "B2C",
    delivery: r.return_tracking_number ?? "—",
    returnStatus: RETURN_STATUS_MAP[r.status] ?? "Pending",
    requestType: r.request_type,
    returnReasonCode: r.reason_code,
    orderNumber: r.saleor_order_number ?? r.number,
  };
}

export interface ListReturnsParams {
  channel?: "b2b" | "b2c";
  /** Preferred over `status` — server-side bucket matching several statuses at once. */
  tab?: ReturnTab;
  /** Ignored by the backend whenever `tab` is also set. */
  status?: ReturnStatus;
  /** Explicit multi-select — takes priority over `tab` server-side when non-empty. */
  statuses?: ReturnStatus[];
  request_type?: ReturnRequestType;
  /** Explicit multi-select — takes priority over `request_type` server-side when non-empty. */
  request_types?: ReturnRequestType[];
  /** Bucketed payment-status filter ("pending" | "completed" — see ListOrdersParams for the
   * bucketing rule). Returns map "refunded" -> completed, "pending" -> pending. */
  payment_status?: "pending" | "completed";
  search?: string;
  reason_code?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  page?: number;
}

export interface ListReturnsResponse {
  items: AllOrder[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export async function listReturns(params?: ListReturnsParams): Promise<ListReturnsResponse> {
  const query = new URLSearchParams();
  if (params?.channel) query.set("channel", params.channel);
  if (params?.tab) query.set("tab", params.tab);
  if (!params?.tab && params?.status) query.set("status", RETURN_STATUS_TO_API[params.status]);
  for (const s of params?.statuses ?? []) query.append("statuses", RETURN_STATUS_TO_API[s]);
  if (params?.request_type) query.set("request_type", params.request_type);
  for (const t of params?.request_types ?? []) query.append("request_types", t);
  if (params?.payment_status) query.set("payment_status", params.payment_status);
  if (params?.search) query.set("search", params.search);
  if (params?.reason_code) query.set("reason_code", params.reason_code);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.page) query.set("page", String(params.page));
  const qs = query.toString();
  const res = await authService.api.get<{
    items: ApiReturn[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  }>(`/seller/orders/returns${qs ? `?${qs}` : ""}`);
  const data = res.data;
  return {
    items: (data.items ?? []).map(mapApiReturn),
    page: data.page,
    page_size: data.page_size,
    total: data.total,
    total_pages: data.total_pages,
  };
}

// ─── POST /seller/orders/{order_id}/returns (seller-assisted creation) ──────
// No UI entry point yet — sellers only ever review customer-initiated returns today. This
// function exists so the capability is ready once there's a design for where it's triggered from.

export type ReturnReasonCode =
  | "ordered_by_mistake"
  | "item_not_as_described"
  | "wrong_item_received"
  | "damaged_item"
  | "size_too_small"
  | "size_too_large";

export interface CreateReturnRequest {
  request_type: ReturnRequestType;
  reason_code: ReturnReasonCode;
  /** Max 1000 chars. */
  details?: string;
  /** Max 3 URLs. */
  images?: string[];
  lines: { order_line_id: string; quantity: number }[];
}

export interface CreateReturnResponse {
  return_id: string;
  order_id: string;
  saleor_order_id: string;
  number?: string;
  request_type: ReturnRequestType;
  status: string;
  reason_code: string;
  reason_summary?: string;
  reason_details?: string | null;
  refund_amount: number | null;
  currency: string;
  items_requested: number;
  request_date: string;
  customer_name?: string;
  vendor_name?: string | null;
  lines: ApiReturnLine[];
  image_urls?: string[];
}

/** `orderId` — the Mekya display order id (e.g. "ORD-20260731-XXXXXX"), matching the contract's
 * `POST /seller/orders/{order_id}/returns` path — not the Saleor global id. */
export async function createReturn(
  orderId: string,
  body: CreateReturnRequest,
): Promise<CreateReturnResponse> {
  const res = await authService.api.post<CreateReturnResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/returns`,
    body,
  );
  return res.data;
}

// ─── GET /seller/orders/returns/{return_id} + lifecycle actions ──────────────

export type ReturnSettlementStatus = "not_applicable" | "refunded" | "exchange_created";

export interface ReturnDetailResponse {
  id: string;
  return_id: string;
  request_type: ReturnRequestType;
  status: string;
  can_approve_request: boolean;
  can_reject: boolean;
  /** True only when status is "approved". */
  can_add_tracking: boolean;
  /** True only when status is "approved". */
  can_mark_received: boolean;
  /** True only when status is "received". */
  can_pass_qc: boolean;
  /** True only when status is "received". */
  can_fail_qc: boolean;
  /** True only when status is "qc_pass_defect_check". */
  can_confirm_defective: boolean;
  can_confirm_not_defective: boolean;
  /** True only when status is "qc_failed". */
  can_ship_back: boolean;
  saleor_order_number?: string;
  customer_name?: string;
  reason_code?: string | null;
  reason_details?: string | null;
  /** Creation timestamp — the return's own request_date, not derived from `events`. */
  request_date?: string;
  image_urls?: string[];
  lines_total?: number;
  lines?: ApiReturnLine[];
  /** Newest first. */
  events?: ApiReturnEvent[];
  /** Set on qc-fail; the reason recorded for the failure. */
  qc_failure_reason?: string | null;
  /** Set after confirm-defective (or directly on a non-damaged qc-pass, when applicable). */
  is_defective?: boolean | null;
  /** Whether the item was put back into sellable stock. */
  restocked?: boolean | null;
  settlement_status?: ReturnSettlementStatus;
  /** Inbound AWB (customer → warehouse), set via /add-tracking. */
  return_tracking_number?: string | null;
  /** Set by Saleor's refund sync after qc_pass. */
  refund_reference?: string | null;
  /** Set when status is "rejected". */
  rejection_reason?: string | null;
  /** Outbound AWB (warehouse → customer), set via /reship (ship-back). */
  reship_tracking_number?: string | null;
  /** Set on qc_pass for request_type "exchange" — the new EXC-... order. */
  exchange_order_id?: string | null;
}

export async function getReturnDetails(returnId: string): Promise<ReturnDetailResponse> {
  const res = await authService.api.get<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}`,
  );
  return res.data;
}

/** pending → approved (return/exchange only). No request body. */
export async function approveReturnRequest(returnId: string): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/approve-request`,
    {},
  );
  return res.data;
}


export interface AddReturnTrackingRequest {
  /** Max 256 chars. */
  tracking_number: string;
  /** Max 128 chars. */
  courier?: string;
}

/** No stage change — status stays "approved". Only callable when status is "approved"; records
 * the inbound AWB (customer → warehouse). Replaces the removed .../pickup endpoint. */
export async function addReturnTracking(
  returnId: string,
  body: AddReturnTrackingRequest,
): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/add-tracking`,
    body,
  );
  return res.data;
}

/** approved → received. No request body. */
export async function receiveReturn(returnId: string): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/received`,
    {},
  );
  return res.data;
}

export interface QcPassReturnRequest {
  /** Max 512 chars. */
  note?: string;
  /** Defaults to the sum of all line totals if omitted. */
  refund_amount?: number;
}

/** received → qc_pass_defect_check (reason_code === "damaged_item") or → qc_passed (otherwise),
 * triggering the Saleor sync + settlement in the latter case. */
export async function qcPassReturn(
  returnId: string,
  body: QcPassReturnRequest,
): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/qc-pass`,
    body,
  );
  return res.data;
}

export interface ConfirmDefectiveRequest {
  is_defective: boolean;
}

/** qc_pass_defect_check → qc_passed either way. `is_defective: false` still restocks the item —
 * it means the item passed a closer inspection, not that QC failed. */
export async function confirmDefectiveReturn(
  returnId: string,
  body: ConfirmDefectiveRequest,
): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/confirm-defective`,
    body,
  );
  return res.data;
}

export interface QcFailReturnRequest {
  /** Max 512 chars. */
  qc_failure_reason?: string;
}

/** received → qc_failed. Records the failure reason; shipping the item back is now a separate
 * step (see shipBackReturn) rather than combined into this call. */
export async function qcFailReturn(
  returnId: string,
  body: QcFailReturnRequest = {},
): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/qc-fail`,
    body,
  );
  return res.data;
}

export interface RejectReturnRequest {
  /** Max 512 chars. */
  note?: string;
}

/** pending → rejected. */
export async function rejectReturn(
  returnId: string,
  body: RejectReturnRequest = {},
): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/reject`,
    body,
  );
  return res.data;
}

export interface ShipBackReturnRequest {
  /** Max 128 chars. */
  courier?: string;
  /** Max 128 chars. */
  contact_person?: string;
  /** Max 32 chars. */
  contact_phone?: string;
  estimated_delivery_at?: string;
}

/** qc_failed → qc_fail_shipped. Now a real status transition (previously metadata-only). */
export async function shipBackReturn(
  returnId: string,
  body: ShipBackReturnRequest,
): Promise<ReturnDetailResponse> {
  const res = await authService.api.patch<ReturnDetailResponse>(
    `/seller/orders/returns/${encodeURIComponent(returnId)}/reship`,
    body,
  );
  return res.data;
}

// ─── GET /seller/orders/exchange — Exchange is a real order resource ────────
// Created automatically when qc_pass fires for a request_type="exchange" return. Distinct from
// AllOrder/ApiOrder — has its own id (EXC-...), its own processing→ready→shipped→delivered status
// machine, and a price-difference settlement (extra_payment_due / refund_due) the customer's
// original order never has.

/** An exchange replacement starts "pending" (QC passed, shipment owed) and advances through
 * the ordinary order pipeline — picking a warehouse moves it to "processing". */
export type ExchangeOrderStatus = "pending" | "processing" | "ready" | "shipped" | "delivered";
export type ExchangeSettlementStatus = "not_applicable" | "pending" | "settled";

export interface ApiExchangeOrder {
  exchange_id: string;
  return_id: string;
  original_order_id: string;
  customer_name?: string;
  /** The original item being returned. */
  item_name: string;
  sku?: string | null;
  /** The item being shipped out in its place. */
  replacement_item_name: string;
  replacement_sku?: string | null;
  replacement_variant_id?: string | null;
  status: ExchangeOrderStatus;
  /** The replacement order's own Saleor id and ORD- display id. */
  exchange_saleor_order_id?: string | null;
  exchange_display_order_id?: string | null;
  tracking_number: string | null;
  courier: string | null;
  estimated_delivery_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  /** INR amount the customer owes — set when the exchange item costs more. */
  extra_payment_due: number | null;
  /** INR amount to refund the customer — set when the exchange item costs less. */
  refund_due: number | null;
  settlement_status: ExchangeSettlementStatus;
  created_at: string;
}

export interface ListExchangeOrdersResponse {
  items: ApiExchangeOrder[];
  total: number;
}

export async function listExchangeOrders(params?: {
  /** Server-side status filter — omit for all statuses. */
  status?: ExchangeOrderStatus;
  /** Explicit multi-select (repeated ?statuses=). */
  statuses?: ExchangeOrderStatus[];
  /** Bucketed settlement-status filter — "pending" verbatim, "completed" maps to "settled". */
  payment_status?: "pending" | "completed";
  limit?: number;
  offset?: number;
}): Promise<ListExchangeOrdersResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  for (const s of params?.statuses ?? []) query.append("statuses", s);
  if (params?.payment_status) query.set("payment_status", params.payment_status);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await authService.api.get<ListExchangeOrdersResponse>(
    `/seller/orders/exchange${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

export async function getExchangeOrder(exchangeId: string): Promise<ApiExchangeOrder> {
  const res = await authService.api.get<ApiExchangeOrder>(
    `/seller/orders/exchange/${encodeURIComponent(exchangeId)}`,
  );
  return res.data;
}

export interface UpdateExchangeStatusRequest {
  /** "processing" is the initial state set on creation — not a valid target here. */
  // "pending" is the starting state and "processing" is set by creating the shipment, so
  // neither is a manual choice.
  status: Exclude<ExchangeOrderStatus, "pending" | "processing">;
  /** Required when status is "shipped". */
  tracking_number?: string;
  courier?: string;
  contact_person?: string;
  contact_phone?: string;
  estimated_delivery_at?: string;
  note?: string;
}

export async function updateExchangeStatus(
  exchangeId: string,
  body: UpdateExchangeStatusRequest,
): Promise<ApiExchangeOrder> {
  const res = await authService.api.patch<ApiExchangeOrder>(
    `/seller/orders/exchange/${encodeURIComponent(exchangeId)}/status`,
    body,
  );
  return res.data;
}

// ─── GET /seller/orders/cancellations — Cancellations is a real resource ────
// Replaces filtering the main order list by status=Cancelled: this endpoint distinguishes a true
// pre-shipment Cancelled order from an RTO (shipped, then returned by the courier), and carries
// enough state (fulfillment_id, display_status) to act on directly from the list row.

export type CancellationType = "cancelled" | "rto";
/** no_return_needed: never shipped. awaiting_warehouse: RTO in transit back. received_restocked: RTO received + restocked. */
export type CancellationDisplayStatus = "no_return_needed" | "awaiting_warehouse" | "received_restocked";

export interface ApiCancellation {
  saleor_order_id: string;
  display_order_id: string;
  order_type: "B2C" | "B2B";
  fulfillment_id: string | null;
  /** Raw: "cancelled" | "rto" | "rto_received". */
  status: string;
  type: CancellationType;
  display_status: CancellationDisplayStatus;
  reason: string | null;
  tracking_number: string | null;
  courier: string | null;
  /** Bucketed payment status of the underlying Saleor order — null if it couldn't be resolved. */
  payment_status: "pending" | "completed" | null;
  updated_at: string;
}

export interface ListCancellationsResponse {
  items: ApiCancellation[];
  total: number;
  limit: number;
  offset: number;
}

export async function listCancellations(params?: {
  /** Omit for both cancelled and RTO rows. */
  type?: CancellationType;
  /** Bucketed payment status filter. */
  payment_status?: "pending" | "completed";
  /** B2B/B2C. Sent server-side so the returned `total` matches the rows shown. */
  order_type?: "B2B" | "B2C";
  search?: string;
  /** ISO yyyy-mm-dd. */
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<ListCancellationsResponse> {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.payment_status) query.set("payment_status", params.payment_status);
  if (params?.order_type) query.set("order_type", params.order_type);
  if (params?.search) query.set("search", params.search);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await authService.api.get<ListCancellationsResponse>(
    `/seller/orders/cancellations${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

/** The 4 seller-facing reasons accepted by POST /seller/orders/{order_id}/cancel. */
export type CancelOrderReason =
  | "Customer requested cancellation"
  | "Out of stock"
  | "Seller unable to fulfil"
  | "System / technical error";

export interface CancelOrderResponse {
  order_id: string;
  status: string;
  reason: string;
  cancelled_at: string;
}

/** Cancels a whole order pre-dispatch via Saleor orderCancel. Only valid before any shipment has
 * gone out — use {@link cancelShipment} instead once a fulfillment already exists. */
export async function cancelOrder(orderId: string, reason: CancelOrderReason): Promise<CancelOrderResponse> {
  const res = await authService.api.post<CancelOrderResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/cancel`,
    { reason },
  );
  return res.data;
}

// ─── Item-level cancellation (/seller/orders/cancelled-items) ────────────────
// Distinct from {@link listCancellations}, which is order/shipment-level (a whole order
// cancelled, or an RTO). This resource is one row per *cancelled line item*, so a
// 5-line order with 2 lines cancelled yields 2 rows here and stays otherwise shippable.
//
// Saleor can't express this: order lines are immutable once an order is confirmed, so the
// cancellation lives only in Mekya and its effect is to exclude the line from all future
// fulfillment/shipment builds.

/** not_applicable: nothing owed. refund_pending: owed, not yet paid out. refunded: settled. */
export type CancelledItemSettlementStatus = "not_applicable" | "refund_pending" | "refunded";

export interface ApiCancelledItem {
  cancellation_id: string;
  saleor_order_id: string;
  display_order_id: string | null;
  order_type: "B2C" | "B2B" | null;
  saleor_order_line_id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price_amount: number | string | null;
  currency: string;
  reason: string;
  /** true: units returned to sellable stock. false: deliberately not restocked.
   *  null: restock was requested but couldn't be applied — check the inventory ledger. */
  restocked: boolean | null;
  settlement_status: CancelledItemSettlementStatus;
  refund_reference: string | null;
  cancelled_at: string | null;
}

export interface ListCancelledItemsResponse {
  items: ApiCancelledItem[];
  total: number;
  limit: number;
  offset: number;
}

/** UI row shape for the Cancelled Items subtab. */
export interface CancelledItemRow {
  cancellationId: string;
  saleorOrderId: string;
  displayOrderId: string;
  orderType: "B2C" | "B2B" | null;
  orderLineId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number | null;
  refundAmount: number | null;
  currency: string;
  reason: string;
  restocked: boolean | null;
  settlementStatus: CancelledItemSettlementStatus;
  refundReference: string | null;
  cancelledAt: string | null;
}

export function mapApiCancelledItem(raw: ApiCancelledItem): CancelledItemRow {
  const unitPrice = raw.unit_price_amount === null ? null : Number(raw.unit_price_amount);
  const safeUnitPrice = unitPrice === null || Number.isNaN(unitPrice) ? null : unitPrice;
  return {
    cancellationId: raw.cancellation_id,
    saleorOrderId: raw.saleor_order_id,
    displayOrderId: raw.display_order_id ?? raw.saleor_order_id,
    orderType: raw.order_type,
    orderLineId: raw.saleor_order_line_id,
    productName: raw.product_name,
    sku: raw.sku ?? "—",
    quantity: raw.quantity,
    unitPrice: safeUnitPrice,
    // What the customer is owed for the cancelled units, if anything.
    refundAmount: safeUnitPrice === null ? null : safeUnitPrice * raw.quantity,
    currency: raw.currency,
    reason: raw.reason,
    restocked: raw.restocked,
    settlementStatus: raw.settlement_status,
    refundReference: raw.refund_reference,
    cancelledAt: raw.cancelled_at,
  };
}

export interface ListCancelledItemsParams {
  search?: string;
  /** ISO yyyy-mm-dd. */
  dateFrom?: string;
  dateTo?: string;
  /** B2B/B2C. Sent server-side so the returned `total` matches the rows shown — never
   *  filter the channel client-side, or pagination counts a page it then hides. */
  orderType?: "B2B" | "B2C";
  limit?: number;
  offset?: number;
}

export async function listCancelledItems(
  params?: ListCancelledItemsParams,
): Promise<ListCancelledItemsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("date_from", params.dateFrom);
  if (params?.dateTo) query.set("date_to", params.dateTo);
  if (params?.orderType) query.set("order_type", params.orderType);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await authService.api.get<ListCancelledItemsResponse>(
    `/seller/orders/cancelled-items${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

export async function getCancelledItem(cancellationId: string): Promise<ApiCancelledItem> {
  const res = await authService.api.get<ApiCancelledItem>(
    `/seller/orders/cancelled-items/${encodeURIComponent(cancellationId)}`,
  );
  return res.data;
}

export interface CancelOrderLinesRequest {
  /** Saleor order line IDs. Each line's whole unshipped remainder is cancelled. */
  line_ids: string[];
  reason: CancelOrderReason;
  /** Whether the cancelled units go back to sellable warehouse stock. */
  restock: boolean;
}

export interface CancelOrderLinesResponse {
  order_id: string;
  cancelled_lines: {
    cancellation_id: string;
    saleor_order_line_id: string;
    quantity: number;
    product_name: string;
    sku: string | null;
    restocked: boolean | null;
  }[];
  reason: string;
  restock_requested: boolean;
  cancelled_at: string;
}

/** Cancels individual line items pre-shipment. Unlike {@link cancelOrder} this leaves the
 * rest of the order shippable, and calls no Saleor order mutation. */
export async function cancelOrderLines(
  orderId: string,
  body: CancelOrderLinesRequest,
): Promise<CancelOrderLinesResponse> {
  const res = await authService.api.post<CancelOrderLinesResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/lines/cancel`,
    body,
  );
  return res.data;
}

export interface CancelShipmentItemsResponse {
  order_id: string;
  /** The parcel that was voided. */
  cancelled_shipment_id: string;
  /** The replacement parcel holding the kept items — null when nothing was kept. */
  new_shipment_id: string | null;
  cancelled_lines: {
    cancellation_id?: string;
    saleor_order_line_id: string;
    quantity: number;
    product_name: string;
    sku: string | null;
  }[];
  kept_lines: { saleor_order_line_id: string; quantity: number }[];
  /** True when the void succeeded but re-packing the remainder didn't — those items are
   *  unfulfilled again and need a new shipment. */
  repack_failed: boolean;
  reason: string;
  restocked: boolean;
  cancelled_at: string;
}

/**
 * Cancels units of one or more SKUs out of a packed, not-yet-dispatched shipment.
 *
 * Saleor fulfillments are immutable, so the backend voids the parcel and re-packs the
 * kept quantities into a new one — hence `new_shipment_id` in the response. Pre-dispatch
 * only; once shipped, use a return or RTO.
 */
export async function cancelShipmentItems(
  orderId: string,
  fulfillmentId: string,
  body: {
    lines: { line_id: string; quantity?: number }[];
    reason: CancelOrderReason;
    restock: boolean;
  },
): Promise<CancelShipmentItemsResponse> {
  const res = await authService.api.post<CancelShipmentItemsResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/shipments/${encodeURIComponent(
      fulfillmentId,
    )}/items/cancel`,
    body,
  );
  return res.data;
}

/** Bookkeeping only — money moves through the payment gateway, not this call. */
export async function updateCancelledItemSettlement(
  cancellationId: string,
  body: { settlement_status: CancelledItemSettlementStatus; refund_reference?: string | null },
): Promise<ApiCancelledItem> {
  const res = await authService.api.patch<ApiCancelledItem>(
    `/seller/orders/cancelled-items/${encodeURIComponent(cancellationId)}/settlement`,
    body,
  );
  return res.data;
}

// ─── GET /seller/orders/{order_id}/invoice/view ──────────────────────────────
// Backend returns a full HTML page — fetch as raw text with auth header.

export async function getOrderInvoice(orderId: string): Promise<string> {
  const tokens = authService.api.getAuthTokens();
  const res = await fetch(
    `${getPublicApiUrl()}/seller/orders/${encodeURIComponent(orderId)}/invoice/view`,
    {
      headers: tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {},
    },
  );
  if (!res.ok) throw new Error(`Invoice request failed (${res.status})`);
  return res.text();
}

// ─── GET /seller/orders/{order_id}/invoice/pdf ───────────────────────────────
// Raw application/pdf binary — bypasses the {success,data} envelope, so this uses a bare fetch.

export async function getOrderInvoicePdf(orderId: string): Promise<Blob> {
  const tokens = authService.api.getAuthTokens();
  const res = await fetch(
    `${getPublicApiUrl()}/seller/orders/${encodeURIComponent(orderId)}/invoice/pdf`,
    {
      headers: tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {},
    },
  );
  if (!res.ok) throw new Error(`Invoice PDF request failed (${res.status})`);
  return res.blob();
}

// ─── POST /seller/orders/bulk ─────────────────────────────────────────────────
// generate_invoice responds with a raw application/zip binary (no JSON envelope);
// update_status responds with the usual {success,data} JSON — branch on Content-Type,
// not on a "success" field, since the ZIP response has neither.

export type BulkOrderAction = "update_status" | "generate_invoice";

export interface BulkOrdersRequest {
  order_ids: string[];
  action: BulkOrderAction;
  payload?: { status?: string };
}

export interface BulkOrdersResponse {
  action: BulkOrderAction;
  affected: number;
  new_status?: string;
}

export type BulkOrdersResult =
  | { kind: "json"; data: BulkOrdersResponse }
  | { kind: "blob"; blob: Blob };

export async function bulkOrders(body: BulkOrdersRequest): Promise<BulkOrdersResult> {
  const tokens = authService.api.getAuthTokens();
  const res = await fetch(`${getPublicApiUrl()}/seller/orders/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Bulk action failed (${res.status})`);
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await res.json()) as { success: boolean; data: BulkOrdersResponse };
    return { kind: "json", data: json.data };
  }
  return { kind: "blob", blob: await res.blob() };
}

// ─── GET/POST /seller/orders/custom — custom-order workflow (special-handling requests) ──────
// A custom order flags an ALREADY-PLACED Saleor order for special handling (custom packaging,
// requirements text, reference-file uploads) — it does not represent a pre-order or a stock
// reservation. Lifecycle: pending_review -> approve -> awaiting_buyer_confirmation -> either
// buyer-confirm -> buyer_confirmed, or buyer-decline -> buyer_declined; pending_review -> reject
// -> rejected. Approve/reject/buyer-confirm are plain status transitions with no request body
// (reject takes an optional reason) — there is no per-line stock reservation anywhere in this
// flow. Order line items are read live from the underlying Saleor order (order_lines on the
// detail response), not stored/edited here.

export type CustomOrderRequestStatus =
  | "pending_review"
  | "awaiting_buyer_confirmation"
  | "buyer_confirmed"
  | "buyer_declined"
  | "rejected";

export interface ApiCustomOrderRequest {
  id: string;
  /** This request's own reference, "CUST-20260902-K8M2N1" — derived from its UUID, so it
   *  exists from intake and does not depend on a Saleor order being created. */
  custom_display_id?: string | null;
  saleor_order_id: string;
  display_order_id?: string | null;
  saleor_order_number?: string | null;
  custom_status: CustomOrderRequestStatus;
  custom_status_label: string;
  vendor_name?: string | null;
  customer_name?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  requirements_preview?: string | null;
  linked_saleor_order_id?: string | null;
  /** Human order number ("ORD-20260811-AFQPMY") for `linked_saleor_order_id`, which is itself
   * an opaque Saleor global ID. Null when the linked order has no metadata row yet. */
  linked_display_order_id?: string | null;
  /** Bucketed payment status of the linked Saleor order — null until buyer-confirm creates one
   * (pending_review/awaiting_buyer_confirmation/rejected/buyer_declined rows never have it). */
  payment_status?: "pending" | "completed" | null;
  created_at: string;
  updated_at: string;
}

export interface ListCustomOrderRequestsParams {
  custom_status?: CustomOrderRequestStatus;
  /** Combined-status filter (e.g. ["buyer_declined", "rejected"]) — resolved server-side, no
   * need to merge multiple paginated calls client-side. */
  custom_statuses?: CustomOrderRequestStatus[];
  /** Bucketed payment-status filter. Rows with no linked order yet never match. */
  payment_status?: "pending" | "completed";
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "created_at" | "total_amount";
  sort_order?: "asc" | "desc";
  /** 1-200, default 20. */
  limit?: number;
  /** >= 0, default 0. */
  offset?: number;
}

export interface ListCustomOrderRequestsResponse {
  items: ApiCustomOrderRequest[];
  total: number;
  limit: number;
  offset: number;
}

export async function listCustomOrderRequests(
  params?: ListCustomOrderRequestsParams,
): Promise<ListCustomOrderRequestsResponse> {
  const query = new URLSearchParams();
  if (params?.custom_status) query.set("custom_status", params.custom_status);
  for (const s of params?.custom_statuses ?? []) query.append("custom_statuses", s);
  if (params?.payment_status) query.set("payment_status", params.payment_status);
  if (params?.search) query.set("search", params.search);
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.sort_order) query.set("sort_order", params.sort_order);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset !== undefined) query.set("offset", String(params.offset));
  const qs = query.toString();
  const res = await authService.api.get<ListCustomOrderRequestsResponse>(
    `/seller/orders/custom${qs ? `?${qs}` : ""}`,
  );
  return res.data;
}

export interface CustomOrderKPIs {
  total_custom_orders: number;
  active_orders: number;
  pending_info: number;
  completed_orders: number;
}

/** Field names are stale (left over from an older status enum), but the counts already match the
 * current statuses: active_orders = pending_review, pending_info = awaiting_buyer_confirmation,
 * completed_orders = buyer_confirmed. No declined/rejected count — pair with a
 * `custom_statuses: ["buyer_declined", "rejected"]` list call for that tile. */
export async function getCustomOrderKPIs(): Promise<CustomOrderKPIs> {
  const res = await authService.api.get<CustomOrderKPIs>("/seller/orders/custom/kpis");
  return res.data;
}

export interface ApiOrderLine {
  line_id: string;
  product_name: string;
  variant_name?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price?: number | null;
  total_price?: number | null;
  currency?: string | null;
  thumbnail_url?: string | null;
}

export interface ApiCustomOrderStatusEvent {
  id: string;
  from_status: CustomOrderRequestStatus | null;
  to_status: CustomOrderRequestStatus;
  changed_by: string;
  changed_at: string;
  note?: string | null;
}

export interface ApiCustomOrderNote {
  id: string;
  author: string;
  body: string;
  edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiUploadedFile {
  name: string;
  url: string;
}

export interface ApiCustomOrderRequestDetail extends ApiCustomOrderRequest {
  contact_person?: string | null;
  customer_email?: string | null;
  requirements_text?: string | null;
  packaging_notes?: string | null;
  uploaded_files: ApiUploadedFile[];
  status_events: ApiCustomOrderStatusEvent[];
  notes: ApiCustomOrderNote[];
  order_lines: ApiOrderLine[];
  allowed_next_statuses: CustomOrderRequestStatus[];
}

export async function getCustomOrderRequestDetail(customOrderId: string): Promise<ApiCustomOrderRequestDetail> {
  const res = await authService.api.get<ApiCustomOrderRequestDetail>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}`,
  );
  return res.data;
}

/** pending_review -> awaiting_buyer_confirmation. No request body — there is no per-line stock
 * reservation in this flow. 422 INVALID_STATUS. */
export async function approveCustomOrderRequest(customOrderId: string): Promise<ApiCustomOrderRequestDetail> {
  const res = await authService.api.post<ApiCustomOrderRequestDetail>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}/approve`,
  );
  return res.data;
}

export interface RejectCustomOrderRequestBody {
  reason: string;
}

/** pending_review -> rejected. Reason is required. 422 INVALID_STATUS, 422 VALIDATION_FAILED. */
export async function rejectCustomOrderRequest(
  customOrderId: string,
  body: RejectCustomOrderRequestBody,
): Promise<ApiCustomOrderRequestDetail> {
  const res = await authService.api.post<ApiCustomOrderRequestDetail>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}/reject`,
    body,
  );
  return res.data;
}

/** awaiting_buyer_confirmation -> buyer_confirmed. 422 INVALID_STATUS. */
export async function buyerConfirmCustomOrderRequest(customOrderId: string): Promise<ApiCustomOrderRequestDetail> {
  const res = await authService.api.post<ApiCustomOrderRequestDetail>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}/buyer-confirm`,
    {},
  );
  return res.data;
}

export interface AddCustomOrderNoteBody {
  body: string;
}

export async function addCustomOrderNote(
  customOrderId: string,
  body: AddCustomOrderNoteBody,
): Promise<ApiCustomOrderNote> {
  const res = await authService.api.post<ApiCustomOrderNote>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}/notes`,
    body,
  );
  return res.data;
}

export async function editCustomOrderNote(
  customOrderId: string,
  noteId: string,
  body: AddCustomOrderNoteBody,
): Promise<ApiCustomOrderNote> {
  const res = await authService.api.patch<ApiCustomOrderNote>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}/notes/${encodeURIComponent(noteId)}`,
    body,
  );
  return res.data;
}

export async function deleteCustomOrderNote(customOrderId: string, noteId: string): Promise<void> {
  await authService.api.delete<null>(
    `/seller/orders/custom/${encodeURIComponent(customOrderId)}/notes/${encodeURIComponent(noteId)}`,
  );
}

export interface MarkDemandFulfilledResponse {
  order_id: string;
  demand_fulfilled: boolean;
}

/** 422 ORDER_NOT_CUSTOM_LINKED / INVALID_STATUS. Unblocks Pack & Label on the linked order's lines. */
export async function markDemandFulfilled(orderId: string): Promise<MarkDemandFulfilledResponse> {
  const res = await authService.api.post<MarkDemandFulfilledResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/demand-fulfilled`,
    {},
  );
  return res.data;
}
