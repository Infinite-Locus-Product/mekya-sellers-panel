import type { StatusVariant } from "@/components/shared/StatusBadge"
import type { CustomOrderStatus, OrderStatus } from "@/lib/tableTypes"

const ORDER_STATUS_TO_BADGE_VARIANT: Record<OrderStatus, StatusVariant> = {
  Completed: "completed",
  Delivered: "delivered",
  Pending: "pending",
  Canceled: "canceled",
  Processing: "processing",
  Shipped: "shipped",
  Returned: "returned",
  "Partial Fulfillment": "partial",
}

export function orderStatusToBadgeVariant(status: OrderStatus): StatusVariant {
  return ORDER_STATUS_TO_BADGE_VARIANT[status]
}

const CUSTOM_ORDER_STATUS_TO_BADGE: Record<CustomOrderStatus, StatusVariant> = {
  "In Process": "custom_in_process",
  "Pending Further information": "custom_pending_info",
  Fulfilled: "custom_fulfilled",
}

export function customOrderStatusToBadgeVariant(
  status: CustomOrderStatus,
): StatusVariant {
  return CUSTOM_ORDER_STATUS_TO_BADGE[status]
}
