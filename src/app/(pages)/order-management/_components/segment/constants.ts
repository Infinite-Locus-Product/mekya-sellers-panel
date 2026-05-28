import type {
    CustomOrderStatus,
    OrderStatus,
    ProductInventoryType,
    ReturnStatus,
} from "@/lib/tableTypes";
import { PRODUCT_INVENTORY_TYPE_LABELS } from "@/lib/tableTypes";
import type { ReturnItemLine } from "@/app/(pages)/order-management/_components/ReturnDetailsModal";

/** Shared table cell styling for payment pills */
export const ORDER_PAYMENT_PILL_BASE =
    "inline-flex h-[22px] w-full min-w-0 max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-center text-[9px] font-medium leading-none sm:h-7 sm:px-2 sm:text-[11px] min-[1920px]:h-8 min-[1920px]:text-sm";

/** AppSelect trigger: responsive width and truncation for dense filter bars */
export const ORDER_FILTER_SELECT_TRIGGER_CLASS =
    "h-8 min-w-0 shrink px-1.5 text-left text-xs min-[1920px]:h-10 min-[1920px]:px-3 min-[1920px]:text-sm max-lg:flex-1 max-lg:basis-0 max-lg:!w-full max-lg:max-w-full max-lg:overflow-hidden lg:flex-none lg:w-max lg:!w-max lg:max-w-[min(100%,22rem)] lg:overflow-hidden max-[480px]:grow-0 max-[480px]:basis-full max-[480px]:!w-full max-[480px]:flex-none [&_[data-slot=select-value]]:min-w-0 max-lg:[&_[data-slot=select-value]]:flex-1 max-lg:[&_[data-slot=select-value]]:truncate lg:[&_[data-slot=select-value]]:max-w-full lg:[&_[data-slot=select-value]]:overflow-visible lg:[&_[data-slot=select-value]]:text-clip lg:[&_[data-slot=select-value]]:whitespace-nowrap";

/** Order view segmented control: active tab (All / Returns) */
export const ORDER_VIEW_TAB_ACTIVE_CLASS =
    "flex-1 rounded-full bg-white p-1.5 text-center text-[10px] font-medium text-black shadow-sm min-[1920px]:p-2 min-[1920px]:text-xs";

/** Order view segmented control: idle tab */
export const ORDER_VIEW_TAB_IDLE_CLASS =
    "flex-1 rounded-full p-1 text-center text-[10px] font-medium text-black min-[1920px]:text-xs";

/** Demo rows used to pad return modal item lists for layout previews */
export const RETURN_ITEMS_DEMO_FILL: ReturnItemLine[] = [
    { product: "Premium Kurta", sku: "PW-001", quantity: 1, price: "₹2,499", total: "₹2,499" },
    { product: "Cotton T-Shirt", sku: "PW-002", quantity: 2, price: "₹899", total: "₹1,798" },
    { product: "Linen Shirt", sku: "PW-003", quantity: 1, price: "₹1,299", total: "₹1,299" },
    { product: "Slim Fit Jeans", sku: "PW-004", quantity: 1, price: "₹2,199", total: "₹2,199" },
    { product: "Sports Shoes", sku: "PW-005", quantity: 1, price: "₹3,499", total: "₹3,499" },
];

export const B2C_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: string; value: "all" | OrderStatus }> = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Returned", value: "Returned" },
    { label: "Canceled", value: "Canceled" },
];

export const B2B_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: string; value: "all" | OrderStatus }> = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Returned", value: "Returned" },
    { label: "Canceled", value: "Canceled" },
];

export const B2B_CUSTOM_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{
    label: string;
    value: "all" | CustomOrderStatus;
}> = [
    { label: "All status", value: "all" },
    { label: "In Process", value: "In Process" },
    { label: "Pending Further information", value: "Pending Further information" },
    { label: "Fulfilled", value: "Fulfilled" },
];

export const B2C_RETURN_STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: string; value: "all" | ReturnStatus }> = [
    { label: "All status", value: "all" },
    { label: "Return Requested", value: "Return Requested" },
    { label: "Approved", value: "Approved" },
    { label: "Completed", value: "Completed" },
];

export const DATE_FILTER_OPTIONS = [
    { label: "All Dates", value: "all_dates" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
] as const;

export const B2B_INVENTORY_TYPE_FILTER_OPTIONS: ReadonlyArray<{
    label: string;
    value: "all" | ProductInventoryType;
}> = [
    { label: "All Inventory Types", value: "all" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.ready_to_ship, value: "ready_to_ship" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.sale_or_return, value: "sale_or_return" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.stock_clearance, value: "stock_clearance" },
    { label: PRODUCT_INVENTORY_TYPE_LABELS.pre_booking, value: "pre_booking" },
];

export const PAGE_TITLE_ORDER_MANAGEMENT = "Order Management System";
