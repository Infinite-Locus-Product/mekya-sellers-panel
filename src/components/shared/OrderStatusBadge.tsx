import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge"
import type { AllOrder } from "@/lib/tableTypes"

/**
 * The one place an order's pipeline status is turned into a badge.
 *
 * Driven by `order_status.code` (`currentStatus`) — the same pipeline stage the Orders
 * subtabs and row actions key off — not the raw Saleor `status` string. Computed
 * backend-side from all of the order's shipments; "partially_*" appears when they aren't
 * all at the same stage.
 *
 * Keying off the code rather than the label matters: a label-keyed lookup has to enumerate
 * every string the backend might send, and anything it misses (e.g. "Partially Cancelled")
 * silently falls through to a wrong-but-plausible colour. The code set is closed and
 * type-checked, so a new pipeline status fails the build instead of rendering incorrectly.
 */
export type CurrentStatusKey = NonNullable<AllOrder["currentStatus"]> | "none"

export const CURRENT_STATUS_LABEL: Record<CurrentStatusKey, string> = {
  none: "Pending",
  pending: "Pending",
  processing: "Processing",
  ready_for_dispatch: "Ready for Pickup",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  partially_processing: "Partially Processing",
  partially_ready_for_dispatch: "Partially Ready for Pickup",
  partially_ready: "Partially Ready",
  partially_shipped: "Partially Shipped",
  partially_delivered: "Partially Delivered",
  partially_returned: "Partially Returned",
  partially_cancelled: "Partially Cancelled",
}

export const CURRENT_STATUS_VARIANT: Record<CurrentStatusKey, StatusVariant> = {
  none: "pending",
  pending: "pending",
  processing: "processing",
  ready_for_dispatch: "pending",
  ready: "pending",
  shipped: "shipped",
  delivered: "delivered",
  returned: "returned",
  cancelled: "canceled",
  partially_processing: "partial",
  partially_ready_for_dispatch: "partial",
  partially_ready: "partial",
  partially_shipped: "partial",
  partially_delivered: "partial",
  partially_returned: "partial",
  partially_cancelled: "partial",
}

/**
 * Resolves the badge key for a row.
 *
 * `currentStatus` is authoritative. `mekyaStatus`
 * (`OrderFulfillmentCurrent.current_status`) is only the last recorded fulfilment action
 * and has no partial concept at all, so it's a fallback for orders with no order_status
 * cache yet (brand new, never recomputed) — using it as primary would silently drop
 * "partially_" information.
 */
export function orderStatusKey(row: Pick<AllOrder, "currentStatus" | "mekyaStatus">): CurrentStatusKey {
  return row.currentStatus ?? row.mekyaStatus ?? "none"
}

export function OrderStatusBadge({
  order,
}: Readonly<{ order: Pick<AllOrder, "currentStatus" | "mekyaStatus"> }>) {
  const key = orderStatusKey(order)
  return <StatusBadge variant={CURRENT_STATUS_VARIANT[key]}>{CURRENT_STATUS_LABEL[key]}</StatusBadge>
}
