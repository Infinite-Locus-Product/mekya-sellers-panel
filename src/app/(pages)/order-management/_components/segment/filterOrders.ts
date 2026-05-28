import type {
    AllOrder,
    CustomOrderStatus,
    OrderStatus,
    PaymentStatus,
    ProductInventoryType,
    ReturnStatus,
} from "@/lib/tableTypes";
import { getOrderProductNames } from "./helpers";

export interface FilterSegmentOrdersInput {
    readonly segmentOrders: readonly AllOrder[];
    readonly segment: "b2c" | "b2b";
    readonly orderView: "all" | "returns";
    readonly customOrderStatusFilter: "all" | CustomOrderStatus;
    readonly returnStatusFilter: "all" | ReturnStatus;
    readonly statusFilter: "all" | OrderStatus;
    readonly paymentFilter: "all" | PaymentStatus;
    readonly inventoryTypeFilter: "all" | ProductInventoryType;
    readonly searchQuery: string;
}

/**
 * Pure filter for the order-management table. Keeps list logic testable and out of the client component.
 */
export function filterSegmentOrders({
    segmentOrders,
    segment,
    orderView,
    customOrderStatusFilter,
    returnStatusFilter,
    statusFilter,
    paymentFilter,
    inventoryTypeFilter,
    searchQuery,
}: FilterSegmentOrdersInput): AllOrder[] {
    return segmentOrders.filter((order) => {
        if (orderView === "returns") {
            if (segment === "b2b") {
                if (order.customOrderStatus === undefined) return false;
                if (
                    customOrderStatusFilter !== "all" &&
                    order.customOrderStatus !== customOrderStatusFilter
                ) {
                    return false;
                }
            } else {
                if (!order.returnStatus) return false;
                if (returnStatusFilter !== "all" && order.returnStatus !== returnStatusFilter) {
                    return false;
                }
            }
        } else {
            if (segment === "b2b" && order.customOrderStatus !== undefined) return false;
            if (statusFilter !== "all" && order.status !== statusFilter) return false;
            if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) return false;
            if (
                segment === "b2b" &&
                inventoryTypeFilter !== "all" &&
                order.inventoryType !== inventoryTypeFilter
            ) {
                return false;
            }
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                order.id.toLowerCase().includes(q) ||
                order.vendor.toLowerCase().includes(q) ||
                getOrderProductNames(order).some((name) => name.toLowerCase().includes(q));
            if (!matchesSearch) return false;
        }
        return true;
    });
}
