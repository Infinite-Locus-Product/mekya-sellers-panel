import type { StatusVariant } from "@/components/shared/StatusBadge"
import type { OrderType, PaymentStatus, ProductInventoryType } from "@/lib/tableTypes"

export interface OrderItem {
  product: string
  sku: string
  quantity: number
  price: number
  total: number
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
  address: string
}

export interface PaymentInfo {
  method: string
  status: PaymentStatus
  subtotal: number
  gst: number
  shippingCharges: number
  total: number
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

export interface OrderDetailsData {
  id: string
  placedDate: string
  placedTime: string
  status: StatusVariant
  customer: CustomerInfo
  payment: PaymentInfo
  items: OrderItem[]
  timeline: FulfillmentTimelineItem[]
  adminNotes?: string
  orderType: OrderType
  inventoryType?: ProductInventoryType
  b2bLineItems?: B2BOrderLineDisplay[]
  b2bFulfillmentStats?: B2BFulfillmentStats
}
