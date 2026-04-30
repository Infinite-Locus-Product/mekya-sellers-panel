import type { AllOrder } from "@/lib/tableTypes";

/** KPI row excludes B2B custom-order rows (tab-specific); matches prior `segmentOrdersForKpis` behavior. */
export function sliceOrdersForKpis(segmentOrders: readonly AllOrder[], segment: "b2c" | "b2b"): AllOrder[] {
    if (segment === "b2b") {
        return segmentOrders.filter((o) => o.customOrderStatus === undefined);
    }
    return [...segmentOrders];
}

export interface OrderManagementKpiStats {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
    returnOrders: number;
}

export function computeKpiStats(orders: readonly AllOrder[]): OrderManagementKpiStats {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
        const numeric = Number(order.amount.replaceAll(/[^\d.]/g, ""));
        return sum + (Number.isNaN(numeric) ? 0 : numeric);
    }, 0);
    const pendingOrders = orders.filter((o) => String(o.status) === "Pending").length;
    const deliveredOrders = orders.filter((o) => String(o.status) === "Delivered").length;
    const returnOrders = orders.filter((o) => (o.paymentStatus as string) === "Refunded").length;

    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders, returnOrders };
}
