export type OrderStatus =
  | "Completed"
  | "Pending"
  | "Canceled"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Returned"
  | "Partial Fulfillment";

export type OrderType = "B2B" | "B2C";
export type PaymentStatus = "Paid" | "Pending";

export type ReturnStatus = "Return Requested" | "Approved" | "Completed";

export type ProductInventoryType =
  | "ready_to_ship"
  | "pre_booking"
  | "stock_clearance"
  | "sale_or_return";

export const PRODUCT_INVENTORY_TYPE_LABELS: Record<
  ProductInventoryType,
  string
> = {
  ready_to_ship: "Ready to Ship",
  stock_clearance: "Stock Clearance",
  pre_booking: "Pre-Booking",
  sale_or_return: "Sale or Return",
};

/**
 * Inventory + order-status columns: definite width at each breakpoint; shrinks with viewport
 * (`table-fixed`). Text scales inside `StatusBadge` / `InventoryTypeBadge`.
 */
export const TABLE_BADGE_PILL_COLUMN_CLASS =
  "min-w-0 whitespace-nowrap w-[6.5rem] max-w-[6.5rem] sm:w-[7.25rem] sm:max-w-[7.25rem] md:w-[8rem] md:max-w-[8rem] lg:w-[8.75rem] lg:max-w-[8.75rem] xl:w-[9.5rem] xl:max-w-[9.5rem] 2xl:w-[10rem] 2xl:max-w-[10rem] min-[1920px]:w-[12rem] min-[1920px]:max-w-[12rem]";

/**
 * Payment status column: same idea — fixed width per breakpoint, narrower than badge columns;
 * pills use `ORDER_PAYMENT_PILL_BASE` for matching text scale.
 */
export const TABLE_PAYMENT_STATUS_COLUMN_CLASS =
  "min-w-0 whitespace-nowrap w-[4rem] max-w-[4rem] sm:w-[4.125rem] sm:max-w-[4.125rem] md:w-[4.25rem] md:max-w-[4.25rem] lg:w-[4.5rem] lg:max-w-[4.5rem] xl:w-[5rem] xl:max-w-[5rem] 2xl:w-[5.25rem] 2xl:max-w-[5.25rem] min-[1920px]:w-[5.75rem] min-[1920px]:max-w-[5.75rem]";

export interface AllOrder {
  id: string;
  vendor: string;
  date: string;
  amount: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  type: OrderType;
  delivery: string;
  /** B2B / wholesale inventory classification for the order line. */
  inventoryType?: ProductInventoryType;
  /** When set, this order appears in the Return Requests view. */
  returnStatus?: ReturnStatus;
  productList?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export type UserStatus = "active" | "inactive" | "pending" | "suspended";
export type UserRole = "Brand" | "Agent" | "Retailer" | "Institutional Buyer";

export interface UserRow {
  id: string;
  vendor: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  onboardingdate: string;
}

export type ProductListingActiveStatus = "active" | "inactive";
export interface ProductRow {
  id: string;
  name: string;
  articleNumber: string;
  category: string;
  sizes: string;
  colors: string;
  inventoryType: ProductInventoryType;
  price: string;
  quantity: number;
  status: ProductListingActiveStatus;
}
