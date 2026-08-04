import type { CancelOrderReason, FulfillmentStatus } from "@/lib/api/orders";
import type { B2BBundleKind, FulfillmentTimelineItem, ShipmentStepperStep } from "./types";

export const READY_FOR_PICKUP = "Ready for pickup";

/**
 * Resolves a shipment's current stage to its stable key.
 *
 * `stepper.currentStep` is a display label owned by the backend, so anything that
 * branches on behaviour must go through this and compare `FulfillmentStatus` keys —
 * matching label text directly means a copy change silently disables the UI.
 */
export function findCurrentStepKey(
  currentStep: string,
  steps: ShipmentStepperStep[],
): FulfillmentStatus | null {
  const needle = currentStep.trim().toLowerCase();
  return steps.find((s) => s.label.trim().toLowerCase() === needle)?.key ?? null;
}

/**
 * Stages at which a parcel's contents can still be changed. Cancelling an item voids the
 * fulfillment and re-packs the remainder, which only works while the goods are still in
 * the warehouse — after dispatch the right tool is a return or RTO.
 */
const ITEM_EDITABLE_STEP_KEYS: ReadonlySet<FulfillmentStatus> = new Set<FulfillmentStatus>([
  "order_placed",
  "processing",
  "ready",
]);

export function canEditShipmentItems(
  currentStep: string,
  steps: ShipmentStepperStep[],
): boolean {
  const key = findCurrentStepKey(currentStep, steps);
  return key !== null && ITEM_EDITABLE_STEP_KEYS.has(key);
}

/**
 * The reasons the backend accepts for any cancellation (`CancelOrderLinesRequest.reason`
 * and `OrderCancelRequest.reason` share one Literal). Single source so a new reason can't
 * be added to some modals and missed in others.
 */
export const CANCEL_REASONS: readonly CancelOrderReason[] = [
  "Customer requested cancellation",
  "Out of stock",
  "Seller unable to fulfil",
  "System / technical error",
] as const;

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

/**
 * Validates a cancellation quantity typed by the seller.
 *
 * Deliberately does NOT clamp while typing: silently rewriting the field mid-keystroke
 * means clearing it snaps back to 1 (`Number("")` is 0) and asking for more than is in
 * the parcel is swallowed without explanation. The caller keeps the raw string, shows
 * `error`, and blocks submit while `value` is null.
 */
export function parseCancelQuantity(
  raw: string,
  max: number,
): { value: number | null; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: null };
  if (!/^\d+$/.test(trimmed)) return { value: null, error: "Enter a whole number." };
  const n = Number(trimmed);
  if (n < 1) return { value: null, error: "Cancel at least 1." };
  if (n > max) {
    return { value: null, error: `Only ${max} unit${max === 1 ? "" : "s"} available here.` };
  }
  return { value: n, error: null };
}
