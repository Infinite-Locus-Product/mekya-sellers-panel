import type { StatusVariant } from "@/components/shared/StatusBadge"
import type { FulfillmentTimelineItem } from "./types"
import type { B2BBundleKind } from "./types"

export const READY_FOR_DISPATCH = "Ready for Dispatch"

export function filterFulfillmentTimeline(items: FulfillmentTimelineItem[]): FulfillmentTimelineItem[] {
  return items.filter((item) => item.stage !== "Canceled" && item.stage !== "Cancelled")
}

export function bundleKindLabel(kind: B2BBundleKind): string {
  return kind === "set_purchase" ? "Set Purchase" : "Single Size Bundle"
}

export function statusLabelText(status: StatusVariant): string {
  if (status === "partial") return "Partial Fulfillment"
  return status.charAt(0).toUpperCase() + status.slice(1)
}
