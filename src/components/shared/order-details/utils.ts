import type { StatusVariant } from "@/components/shared/StatusBadge";
import type { OrderType } from "@/lib/tableTypes";
import type { B2BBundleKind, FulfillmentTimelineItem } from "./types";

export type StatusUpdateOption = Readonly<{
  value: StatusVariant;
  label: string;
}>;

/**
 * Labels for the order status update Select, aligned with list filters:
 * - B2B partial fulfillment (stats card): fulfillment progress wording.
 * - B2B otherwise: Pending … Canceled (no Partial Fulfillment / Completed).
 * - B2C: Pending … Canceled (no Partial Fulfillment / Completed in the picker).
 */
export function getOrderStatusUpdateOptions(params: {
  orderType: OrderType;
  /** B2B wholesale view with line-level fulfillment stats. */
  isPartialFulfillmentContext: boolean;
}): readonly StatusUpdateOption[] {
  const { orderType, isPartialFulfillmentContext } = params;

  if (isPartialFulfillmentContext) {
    return [
      { value: "pending", label: "0 Fulfilled" },
      { value: "partial", label: "Partially Fulfilled" },
      { value: "delivered", label: "Fully Fulfilled" },
    ];
  }

  if (orderType === "B2B") {
    return [
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "returned", label: "Returned" },
      { value: "canceled", label: "Canceled" },
    ];
  }

  return [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "returned", label: "Returned" },
    { value: "canceled", label: "Canceled" },
  ];
}

export const READY_FOR_DISPATCH = "Ready for Dispatch";

export function filterFulfillmentTimeline(
  items: FulfillmentTimelineItem[],
): FulfillmentTimelineItem[] {
  return items.filter(
    (item) => item.stage !== "Canceled" && item.stage !== "Cancelled",
  );
}

export function bundleKindLabel(kind: B2BBundleKind): string {
  return kind === "set_purchase" ? "Set Purchase" : "Single Size Bundle";
}

export function statusLabelText(status: StatusVariant): string {
  if (status === "partial") return "Partial Fulfillment";
  if (status === "custom_in_process") return "In Process";
  if (status === "custom_pending_info") return "Pending Further information";
  if (status === "custom_fulfilled") return "Fulfilled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
