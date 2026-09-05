import type { OrderType, PaymentStatus, ProductInventoryType } from "@/lib/tableTypes"
import type { FulfillmentStatus, SaleorFulfillmentStatus } from "@/lib/api/orders"

/** Coarse grouping used to order a multi-shipment order's parcels for display: every order's
 *  regular parcels first, then any that were replaced via an exchange, then anything returned,
 *  then anything cancelled — see classifyShipmentKind and ShipmentsSection's sort. */
export type ShipmentKind = "normal" | "exchange" | "returned" | "cancelled"

const SHIPMENT_KIND_DISPLAY_ORDER: Readonly<Record<ShipmentKind, number>> = {
  normal: 0,
  exchange: 1,
  returned: 2,
  cancelled: 3,
}

export function shipmentKindDisplayOrder(kind: ShipmentKind): number {
  return SHIPMENT_KIND_DISPLAY_ORDER[kind]
}

/** Classifies a shipment from Saleor's own fulfillment status — the only signal that
 *  distinguishes "this parcel was replaced by an exchange" or "this parcel came back" from a
 *  normal one; the Mekya stepper (FulfillmentStatus) has no such states of its own. */
export function classifyShipmentKind(saleorStatus: SaleorFulfillmentStatus | null | undefined): ShipmentKind {
  switch (saleorStatus) {
    case "REPLACED":
      return "exchange"
    case "RETURNED":
    case "REFUNDED_AND_RETURNED":
    case "REFUNDED":
      return "returned"
    case "CANCELED":
      return "cancelled"
    default:
      return "normal"
  }
}

export interface OrderItem {
  product: string
  sku: string
  quantity: number
  price: number
  total: number
  imageUrl?: string
  /** Saleor order line ID — required to act on a single line (e.g. cancel it). Optional
   *  because the backend marks it optional and mock/legacy data may omit it. */
  orderLineId?: string
  /** Units already cancelled on this line via item-level cancellation. */
  cancelledQuantity?: number
  /** Units that can still be cancelled: not yet shipped and not already cancelled.
   *  0 means the Cancel action must be hidden for this line. */
  cancellableQuantity?: number
  /** Units that are neither in an active shipment nor cancelled — e.g. a shipment attempt
   *  for this line was voided and only part of it was subsequently cancelled, leaving a
   *  remainder that still needs someone to ship or cancel it. Surfaced to the seller so an
   *  order sitting in the Pending filter has a visible reason instead of looking "done". */
  pendingQuantity?: number
  /** Where this line's units actually stand, one entry per distinct state, quantities
   *  summing to `quantity`. A line is not necessarily in one state: units can sit in
   *  different shipments, and a partially-cancelled line has both cancelled and shipped
   *  units. Without this the items table showed no state at all, so an order badged
   *  "Partially Cancelled" listed items that read as though everything had shipped. */
  statuses?: OrderItemStatusCount[]
}

/** A line's units that were cancelled rather than shipped. They belong to no parcel, so
 *  without listing them separately the shipments view accounts for only part of the order —
 *  ORD-20260821-SDC1VN showed two Delivered parcels and no trace of its cancelled unit. */
export interface OrderDetailCancelledLine {
  orderLineId: string
  productName: string
  sku: string | null
  quantity: number
}

export interface OrderItemStatusCount {
  /** Display label — a shipment's current step ("Delivered"), or "Cancelled"/"Pending". */
  label: string
  quantity: number
}

export interface FulfillmentTimelineItem {
  stage: string
  date: string
  time: string
  completed: boolean
  current: boolean
}

export interface CustomerInfo {
  name: string
  company?: string
  tag?: OrderType | "general"
  email: string
  phone: string
  /** Legacy single address line — used when shipping/billing aren't separately known (mock data). */
  address: string
  shippingAddress?: string
  billingAddress?: string
}

/** One step in a shipment's Order Placed → Processing → Ready for pickup → Shipped → In Transit → Delivered stepper. */
export interface ShipmentStepperStep {
  key: FulfillmentStatus
  label: string
  completed: boolean
  /** ISO 8601, or null if this step hasn't happened yet. */
  timestamp: string | null
}

/** One SKU inside a shipment. Rendered as its own row so quantities and per-item
 *  actions are addressable, rather than collapsed into one summary line. */
export interface ShipmentItemDisplay {
  name: string
  quantity: number
  /** Saleor order line ID — needed to act on this item (e.g. cancel it). */
  orderLineId: string | null
  sku: string | null
  /** Units of this line that can still be cancelled: unshipped and not already
   *  cancelled. 0 means the cancel action must be hidden for this row. */
  cancellableQuantity: number
}

export interface ShipmentDisplay {
  id: string
  createdAt: string
  trackingNumber: string | null
  warehouse: string | null
  /** From the shipment's raw Saleor status via classifyShipmentKind — drives display order. */
  kind: ShipmentKind
  items: ShipmentItemDisplay[]
  stepper: {
    currentStep: string
    steps: ShipmentStepperStep[]
  }
}

/** An order line with quantity still not attached to any shipment — computed client-side (line
 *  quantity minus what every existing shipment already claims). Powers the warehouse-based
 *  shipment-splitting UI. */
export interface OrderDetailUnfulfilledLine {
  orderLineId: string
  skuId: string
  productName: string
  quantity: number
}

export interface PaymentInfo {
  method: string
  status: PaymentStatus
  subtotal: number
  gst: number
  shippingCharges: number
  total: number
  /** Informational only — not already subtracted from subtotal/total. */
  discount?: number
}

export type B2BBundleKind = "set_purchase" | "single_size_bundle"

export interface B2BIncludedLine {
  label: string
}

export interface B2BConfigurationDisplay {
  id: string
  title: string
  itemsPerSet: number
  bundleKind: B2BBundleKind
  sizeLabels: string[]
  colorLabel: string
  colorSwatches: string[]
  setsOrdered: number
  lineTotal: number
  includedLines: B2BIncludedLine[]
}

export interface B2BPartialColorRow {
  colorLabel: string
  colorHex: string
  cells: { size: string; qty: number }[]
  totalQty: number
  totalPrice: number
}

export interface B2BFulfillmentStats {
  totalItems: number
  fulfilled: number
  delivered: number
  pending: number
}

export interface B2BOrderLineDisplay {
  productName: string
  articleNumber: string
  sku: string
  wholesalePricePerSet: number
  mainImageSrc: string
  thumbnailSrcs: readonly string[]
  configurations: B2BConfigurationDisplay[]
  totalSets: number
  lineTotalAmount: number
  partialFulfillmentRows?: B2BPartialColorRow[]
  wholesalePriceUnitLabel?: "per set" | "per item"
  isCustomOrder?: boolean
}

/** Origin custom-order request for an order created via buyer-confirm. */
export interface OrderCustomOrderLink {
  id: string
  customStatus: string
  contactPerson: string | null
  customerEmail: string | null
}

/** Where a replacement order came from. Absent on ordinary orders — a replacement is only
 *  distinguishable by this, since on its own it looks like any other order with a zero
 *  total, the goods having been paid for on the original order. */
export interface OrderExchangeLink {
  /** This order's own id; an exchange and its replacement order share one identifier. */
  exchangeId: string | null
  /** The order the exchange was raised against. */
  originalOrderId: string | null
  /** The request holding the item that was sent back. */
  returnId: string | null
  itemName: string | null
  sku: string | null
}

export interface OrderDetailsData {
  id: string
  placedDate: string
  placedTime: string
  /** Raw display label from the API/mock data (e.g. "Fulfilled", "Partially Shipped") — the badge
   *  variant/color is derived from this at render time via orderStatusToBadgeVariant. */
  status: string
  customer: CustomerInfo
  payment: PaymentInfo
  items: OrderItem[]
  timeline: FulfillmentTimelineItem[]
  orderType: OrderType
  inventoryType?: ProductInventoryType
  b2bLineItems?: B2BOrderLineDisplay[]
  b2bFulfillmentStats?: B2BFulfillmentStats
  /** Present for real /seller/orders/{order_id} data — one entry per Saleor fulfillment. */
  shipments?: ShipmentDisplay[]
  /** Lines with quantity not yet attached to any shipment — drives the "make shipment with
   *  selected items" warehouse-splitting flow. Undefined for legacy/mock data. */
  unfulfilledLines?: OrderDetailUnfulfilledLine[]
  cancelledLines?: OrderDetailCancelledLine[]
  /** Shipping address postal code — looks up warehouse candidates for a new shipment. */
  deliveryPincode?: string | null
  /** The custom-order request this order came from, when it came from one. Undefined for
   *  ordinary orders, which fulfil in one click with no confirmation. */
  customOrder?: OrderCustomOrderLink | null
  /** The exchange this order replaces, when it is a replacement. Undefined otherwise. */
  exchange?: OrderExchangeLink | null
  invoiceNumber?: string
  orderNumber?: string
  channel?: "b2b" | "b2c"
}
