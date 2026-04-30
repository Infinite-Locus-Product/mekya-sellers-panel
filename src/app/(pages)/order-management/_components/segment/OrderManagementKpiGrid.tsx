import { KPICard } from "@/components/shared/KPICard";
import {
    KpiOrdersBagIcon,
    KpiReturnUndoIcon,
    KpiTotalRevenueIcon,
    KpiPendingOrdersIcon,
    KpiDeliveredOrdersIcon,
} from "@/assets/icons";
import type { OrderManagementKpiStats } from "./kpiMetrics";

export interface OrderManagementKpiGridProps {
    readonly stats: OrderManagementKpiStats;
}

export function OrderManagementKpiGrid({ stats }: Readonly<OrderManagementKpiGridProps>) {
    const { totalOrders, totalRevenue, pendingOrders, deliveredOrders, returnOrders } = stats;

    return (
        <div className="grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3 xl:grid-cols-5 min-[1920px]:gap-3">
            <KPICard title="Total Orders" value={String(totalOrders)} icon={<KpiOrdersBagIcon />} kpiType={1} />
            <KPICard
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                icon={<KpiTotalRevenueIcon />}
                kpiType={2}
            />
            <KPICard
                title="Pending Orders"
                value={String(pendingOrders)}
                icon={<KpiPendingOrdersIcon />}
                kpiType={3}
            />
            <KPICard
                title="Delivered"
                value={String(deliveredOrders)}
                icon={<KpiDeliveredOrdersIcon />}
                kpiType={4}
            />
            <KPICard
                title="Return & Exchanges"
                value={String(returnOrders)}
                icon={<KpiReturnUndoIcon />}
                kpiType={5}
            />
        </div>
    );
}
