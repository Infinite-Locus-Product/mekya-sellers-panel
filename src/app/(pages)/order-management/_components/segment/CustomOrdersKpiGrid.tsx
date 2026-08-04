import { KPICard } from "@/components/shared/KPICard";
import {
    KpiOrdersBagIcon,
    KpiPendingOrdersIcon,
    KpiDeliveredOrdersIcon,
} from "@/assets/icons";
import { Clock, XCircle } from "lucide-react";

export interface CustomOrderRequestKpis {
    totalRequests: number;
    pendingReview: number;
    awaitingConfirmation: number;
    buyerConfirmed: number;
    declinedOrRejected: number;
}

export interface CustomOrdersKpiGridProps {
    readonly stats: CustomOrderRequestKpis | null;
}

/** KPI row for the Custom Orders tab. Total/pending-review/awaiting-confirmation/buyer-confirmed
 * come from the real GET /seller/orders/custom/kpis endpoint; declined/rejected is a separate
 * combined-status list lookup since that endpoint doesn't track it — see the fetch effect in
 * OrderManagementSegmentClient. */
export function CustomOrdersKpiGrid({ stats }: Readonly<CustomOrdersKpiGridProps>) {
    const value = (n: number | undefined) => (stats ? String(n ?? 0) : "—");

    return (
        <div className="grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-5 min-[1920px]:gap-3">
            <KPICard
                title="Total Requests"
                value={value(stats?.totalRequests)}
                icon={<KpiOrdersBagIcon />}
                kpiType={1}
            />
            <KPICard
                title="Pending Review"
                value={value(stats?.pendingReview)}
                icon={<KpiPendingOrdersIcon />}
                kpiType={2}
            />
            <KPICard
                title="Awaiting Confirmation"
                value={value(stats?.awaitingConfirmation)}
                icon={<Clock className="size-4" />}
                kpiType={3}
            />
            <KPICard
                title="Buyer Confirmed"
                value={value(stats?.buyerConfirmed)}
                icon={<KpiDeliveredOrdersIcon />}
                kpiType={4}
            />
            <KPICard
                title="Declined / Rejected"
                value={value(stats?.declinedOrRejected)}
                icon={<XCircle className="size-4" />}
                kpiType={5}
            />
        </div>
    );
}
