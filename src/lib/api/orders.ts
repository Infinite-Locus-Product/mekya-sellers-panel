import { authService } from "@/lib/auth/authService";
import type { AllOrder, OrderStatus, PaymentStatus, ProductInventoryType } from "@/lib/tableTypes";

// ─── GET /seller/orders ───────────────────────────────────────────────────────
// NOTE: ApiOrder fields below are based on a typical Saleor-backed response.
// Confirm with backend team once the stub is wired to Saleor.

interface ApiOrderLineItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ApiOrder {
  order_id: string;
  number?: string;
  created_at: string;
  status: string;
  payment_status: string;
  channel: string;          // "b2b" | "b2c"
  total_amount: number;
  currency: string;
  customer_name: string;
  tracking_number?: string | null;
  inventory_type?: string;  // "ready_to_ship" | "pre_booking" | "stock_clearance" | "sale_or_return"
  line_items?: ApiOrderLineItem[];
}

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  canceled: "Canceled",
  cancelled: "Canceled",
  returned: "Returned",
  "partial fulfillment": "Partial Fulfillment",
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
};

export function mapApiOrder(r: ApiOrder): AllOrder {
  return {
    id: r.order_id,
    vendor: r.customer_name,
    date: r.created_at.slice(0, 10),
    amount: `₹${r.total_amount.toLocaleString("en-IN")}`,
    status: ORDER_STATUS_MAP[r.status.toLowerCase()] ?? "Pending",
    paymentStatus: PAYMENT_STATUS_MAP[r.payment_status?.toLowerCase()] ?? "Pending",
    type: r.channel?.toLowerCase() === "b2b" ? "B2B" : "B2C",
    delivery: r.tracking_number ?? "—",
    inventoryType: r.inventory_type as ProductInventoryType | undefined,
    productList: r.line_items?.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  };
}

export interface ListOrdersParams {
  status?: string;
  limit?: number;
}

export interface ListOrdersResponse {
  orders: AllOrder[];
  has_next: boolean;
}

export async function listOrders(params?: ListOrdersParams): Promise<ListOrdersResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const res = await authService.api.get<{ orders: ApiOrder[]; has_next: boolean }>(
    `/seller/orders${qs ? `?${qs}` : ""}`,
  );
  const data = res.data ?? { orders: [], has_next: false };
  return {
    orders: (data.orders ?? []).map(mapApiOrder),
    has_next: data.has_next ?? false,
  };
}

// ─── POST /seller/orders/{order_id}/fulfill ───────────────────────────────────

export interface FulfillOrderRequest {
  tracking_number?: string | null;
  courier?: string | null;
  tracking_url?: string | null;
}

export interface FulfillOrderResponse {
  order_id: string;
  tracking_number: string | null;
  status: string;
}

export async function fulfillOrder(
  orderId: string,
  body: FulfillOrderRequest,
): Promise<FulfillOrderResponse> {
  const res = await authService.api.post<FulfillOrderResponse>(
    `/seller/orders/${encodeURIComponent(orderId)}/fulfill`,
    body,
  );
  return res.data;
}

// ─── POST /seller/orders/bulk ─────────────────────────────────────────────────

export type BulkOrderAction = "update_status" | "generate_invoice";

export interface BulkOrdersRequest {
  order_ids: string[];
  action: BulkOrderAction;
  payload?: { status?: string };
}

export interface BulkOrdersResponse {
  action: BulkOrderAction;
  affected: number;
  message: string;
}

export async function bulkOrders(body: BulkOrdersRequest): Promise<BulkOrdersResponse> {
  const res = await authService.api.post<BulkOrdersResponse>(`/seller/orders/bulk`, body);
  return res.data;
}
