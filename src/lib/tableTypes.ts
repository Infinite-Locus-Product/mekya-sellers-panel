/**
 * Shared types for order and user table data.
 * Used by order-management, user-management, dashboard, and OrderDetails.
 */

export type OrderStatus =
  | "delivered"
  | "pending"
  | "shipped"
  | "processing"
  | "canceled"
  | "returned"

export type OrderType = "B2B" | "B2C"
export type PaymentStatus = "Paid" | "Pending" | "Refunded"

export interface AllOrder {
  id: string
  vendor: string
  date: string
  amount: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  type: OrderType
  delivery: string
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
