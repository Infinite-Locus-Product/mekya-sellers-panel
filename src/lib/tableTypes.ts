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

/** B2B Custom Orders tab only — pipeline status shown in the custom orders table. */
export type CustomOrderStatus =
  | "In Process"
  | "Pending Further information"
  | "Fulfilled";

export type ProductInventoryType =
  | "ready_to_ship"
  | "pre_booking"
  | "stock_clearance"
  | "sale_or_return";

/** B2B + `pre_booking` only: fulfillment sub-state when order `status` is Partial Fulfillment. */
export type B2BPartialFulfillmentStatus =
  | "not_fulfilled"
  | "partially_fulfilled"
  | "fully_fulfilled";

export interface B2BPartialFulfillmentQuantities {
  total: number;
  fulfilled: number;
  delivered: number;
  pending: number;
}

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
 * Return Requests / custom orders table: return status labels include "Return Requested";
 * wider than {@link TABLE_BADGE_PILL_COLUMN_CLASS} so the badge is not truncated under `table-fixed`.
 */
export const TABLE_RETURN_STATUS_COLUMN_CLASS =
  "min-w-0 whitespace-nowrap w-[9.25rem] max-w-[9.25rem] sm:w-[10rem] sm:max-w-[10rem] md:w-[10.5rem] md:max-w-[10.5rem] lg:w-[11rem] lg:max-w-[11rem] xl:w-[11.5rem] xl:max-w-[11.5rem] 2xl:w-[12rem] 2xl:max-w-[12rem] min-[1920px]:w-[14rem] min-[1920px]:max-w-[14rem]";

/** Custom orders status column — fits "Pending Further information" under `table-fixed`. */
export const TABLE_CUSTOM_ORDER_STATUS_COLUMN_CLASS =
  "min-w-0 w-[11rem] max-w-[11rem] sm:w-[12rem] sm:max-w-[12rem] md:w-[13rem] md:max-w-[13rem] lg:w-[14rem] lg:max-w-[14rem] xl:w-[15rem] xl:max-w-[15rem] 2xl:w-[16rem] 2xl:max-w-[16rem] min-[1920px]:w-[20rem] min-[1920px]:max-w-[20rem]";

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
  /**
   * B2B + `pre_booking` only: must be set on mock/API rows.
   * When `status` is Delivered, use `fully_fulfilled`. When `status` is Partial Fulfillment, use one of the three values.
   */
  partial_fulfillment_status?: B2BPartialFulfillmentStatus;
  /** Optional counts used by Order Status card for B2B pre-booking fulfillment tracking. */
  partial_fulfillment_quantities?: B2BPartialFulfillmentQuantities;
  /** When set, this order appears in the Return Requests view. */
  returnStatus?: ReturnStatus;
  /**
   * When set, this B2B row is listed under **Custom Orders** (not Bulk Orders KPIs/table).
   * Use with {@link CustomOrderStatus} and `deadline`.
   */
  customOrderStatus?: CustomOrderStatus;
  /** Custom order promised date (e.g. `21-Oct-2025`). */
  deadline?: string;
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
