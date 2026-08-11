import { XCircle } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import {
    KpiOrdersBagIcon,
    KpiReturnUndoIcon,
    KpiTotalRevenueIcon,
    KpiPendingOrdersIcon,
    KpiDeliveredOrdersIcon,
} from "@/assets/icons";
import type { OrderKpis } from "@/lib/api/orders";

export interface OrderManagementKpiGridProps {
    readonly stats: OrderKpis | null;
}

/** Tiles mirror GET /seller/orders/kpis exactly — no client-side derivation. Returns and
 *  Cancellations get one tile each; they used to be two return tiles (initiated / in process)
 *  split across the same lifecycle, which left cancellations with no tile at all. */
export function OrderManagementKpiGrid({ stats }: Readonly<OrderManagementKpiGridProps>) {
    const s = stats ?? {
        pending: 0,
        processing: 0,
        ready_for_dispatch: 0,
        shipped: 0,
        returns: 0,
        cancellations: 0,
    };

    return (
        <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-3 xl:grid-cols-6 min-[1920px]:gap-3">
            <KPICard title="Pending" value={String(s.pending)} icon={<KpiPendingOrdersIcon />} kpiType={1} />
            <KPICard title="Processing" value={String(s.processing)} icon={<KpiOrdersBagIcon />} kpiType={2} />
            <KPICard
                title="Ready for Dispatch"
                value={String(s.ready_for_dispatch)}
                icon={<KpiDeliveredOrdersIcon />}
                kpiType={3}
            />
            <KPICard title="Shipped" value={String(s.shipped)} icon={<KpiTotalRevenueIcon />} kpiType={4} />
            <KPICard
                title="Returns"
                value={String(s.returns)}
                icon={<KpiReturnUndoIcon />}
                kpiType={5}
            />
            <KPICard
                title="Cancellations"
                value={String(s.cancellations)}
                icon={<XCircle aria-hidden />}
                kpiType={3}
            />
        </div>
    );
}
