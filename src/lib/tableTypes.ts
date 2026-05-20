export type OrderStatus =
  | "Completed"
  | "Pending"
  | "Canceled"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Returned"

export type OrderType = "B2B" | "B2C"
export type PaymentStatus = "Paid" | "Pending" | "Refunded"

/** Return pipeline for rows shown in the Return Requests view. */
export type ReturnStatus = "Return Requested" | "Approved" | "Completed"

export interface OrderLineItem {
  name: string
  price: number | string
  quantity: number
}

export interface AllOrder {
  id: string
  vendor: string
  date: string
  amount: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  type: OrderType
  delivery: string
  /** Line items for product list / return modal; optional for legacy mock rows. */
  productList?: OrderLineItem[]
  /** When set, the order appears in the Return Requests view. */
  returnStatus?: ReturnStatus
}

export type UserStatus = "active" | "inactive" | "pending" | "suspended"
export type UserRole = "Brand" | "Agent" | "Retailer" | "Institutional Buyer"

export interface UserRow {
  id: string
  vendor: string
  email: string
  role: UserRole
  status: UserStatus
  onboardingdate: string
}

export type ProductInventoryType =
  | "ready_to_ship"
  | "pre_booking"
  | "stock_clearance"
  | "sale_or_return"

export type ProductListingActiveStatus = "active" | "inactive"
export interface ProductRow {
  id: string
  name: string
  articleNumber: string
  category: string
  sizes: string
  colors: string
  inventoryType: ProductInventoryType
  price: string
  quantity: number
  status: ProductListingActiveStatus
}

export const PRODUCT_INVENTORY_TYPE_LABELS: Record<ProductInventoryType, string> = {
  ready_to_ship: "Ready to Ship",
  stock_clearance: "Stock Clearance",
  pre_booking: "Pre-Booking",
  sale_or_return: "Sale or Return",
}
