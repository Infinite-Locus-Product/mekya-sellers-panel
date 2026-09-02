import { XCircle, RefreshCw } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { KpiOrdersBagIcon, KpiReturnUndoIcon, KpiDeliveredOrdersIcon } from "@/assets/icons";
import type { OrderKpis } from "@/lib/api/orders";

export interface OrderManagementKpiGridProps {
    readonly stats: OrderKpis | null;
}

/** Tiles mirror GET /seller/orders/kpis exactly — no client-side derivation.
 *
 *  These count *items*, not orders: every figure is items x quantity, so an order of three
 *  shirts contributes three. They replaced per-status order tiles (Pending / Processing /
 *  Ready for Dispatch / Shipped / Returns / Cancellations), which answered "how many orders
 *  sit here" rather than "how much stock has moved".
 *
 *  Delivered, Exchange, Returned and Cancelled are mutually exclusive per unit, so they add
 *  up to at most Total — a unit delivered and then returned counts only under Returned. */
export function OrderManagementKpiGrid({ stats }: Readonly<OrderManagementKpiGridProps>) {
    const s = stats ?? {
        total_items: 0,
        delivered_items: 0,
        exchange_items: 0,
        returned_items: 0,
        cancelled_items: 0,
    };

    return (
        <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-3 xl:grid-cols-5 min-[1920px]:gap-3">
            <KPICard
                title="Total Order Items"
                value={String(s.total_items)}
                icon={<KpiOrdersBagIcon />}
                kpiType={1}
            />
            <KPICard
                title="Delivered Items"
                value={String(s.delivered_items)}
                icon={<KpiDeliveredOrdersIcon />}
                kpiType={2}
            />
            <KPICard
                title="Exchange Items"
                value={String(s.exchange_items)}
                icon={<RefreshCw aria-hidden />}
                kpiType={3}
            />
            <KPICard
                title="Returned Items"
                value={String(s.returned_items)}
                icon={<KpiReturnUndoIcon />}
                kpiType={5}
            />
            <KPICard
                title="Cancelled Items"
                value={String(s.cancelled_items)}
                icon={<XCircle aria-hidden />}
                kpiType={4}
            />
        </div>
    );
}
