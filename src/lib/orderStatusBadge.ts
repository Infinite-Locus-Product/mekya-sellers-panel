import type { StatusVariant } from "@/components/shared/StatusBadge"
import type { CustomOrderStatus, OrderStatus } from "@/lib/tableTypes"

const ORDER_STATUS_TO_BADGE_VARIANT: Record<OrderStatus, StatusVariant> = {
  Draft: "draft",
  Unconfirmed: "unconfirmed",
  Unfulfilled: "unfulfilled",
  "Partially Fulfilled": "partially_fulfilled",
  Fulfilled: "fulfilled",
  "Partially Returned": "partially_returned",
  Returned: "returned",
  Cancelled: "canceled",
  Expired: "expired",
}

/**
 * Falls back to "unfulfilled" for any status string outside the known enum — the backend has
 * been observed sending richer/derived labels (e.g. "Partially Shipped") beyond the documented
 * Saleor-native set, and an unstyled-but-not-crashing badge beats throwing mid-render.
 */
export function orderStatusToBadgeVariant(status: string): StatusVariant {
  return ORDER_STATUS_TO_BADGE_VARIANT[status as OrderStatus] ?? "unfulfilled"
}

const CUSTOM_ORDER_STATUS_TO_BADGE: Record<CustomOrderStatus, StatusVariant> = {
  "In Process": "custom_in_process",
  "Pending Further Information": "custom_pending_info",
  Fulfilled: "custom_fulfilled",
  Cancelled: "canceled",
}

export function customOrderStatusToBadgeVariant(
  status: CustomOrderStatus,
): StatusVariant {
  return CUSTOM_ORDER_STATUS_TO_BADGE[status]
}
