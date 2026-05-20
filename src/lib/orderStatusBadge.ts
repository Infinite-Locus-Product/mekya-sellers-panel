import type { StatusVariant } from "@/components/shared/StatusBadge"
import type { OrderStatus } from "@/lib/tableTypes"

const ORDER_STATUS_TO_BADGE_VARIANT: Record<OrderStatus, StatusVariant> = {
  Completed: "delivered",
  Pending: "pending",
  Canceled: "canceled",
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Returned: "returned",
}

export function orderStatusToBadgeVariant(status: OrderStatus): StatusVariant {
  return ORDER_STATUS_TO_BADGE_VARIANT[status]
}
