import { XCircle, RefreshCw } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { KpiOrdersBagIcon, KpiReturnUndoIcon, KpiDeliveredOrdersIcon } from "@/assets/icons";
import type { OrderKpis } from "@/lib/api/orders";

export interface OrderManagementKpiGridProps {
    readonly stats: OrderKpis | null;
    /** Which storefront's orders these tiles describe. B2B drops the Exchange and Returned
     *  tiles: returns and exchanges are a B2C flow (their tabs live under B2C Orders, and
     *  B2B's are Bulk Orders / Cancellation / Custom Orders), so on B2B they could only
     *  ever read 0 — a tile that can never move is noise pretending to be a metric. */
    readonly segment: "b2c" | "b2b";
}

/** Tiles mirror GET /seller/orders/kpis exactly — no client-side derivation.
 *
 *  These count *items*, not orders: every figure is items x quantity, so an order of three
 *  shirts contributes three. They replaced per-status order tiles (Pending / Processing /
 *  Ready for Dispatch / Shipped / Returns / Cancellations), which answered "how many orders
 *  sit here" rather than "how much stock has moved".
 *
 *  Delivered, Exchange, Returned and Cancelled are mutually exclusive per unit, so they add
 *  up to at most Total — a unit delivered and then returned counts only under Returned.
 *
 *  B2C shows all five; B2B shows Total / Delivered / Cancelled only. See `segment` above for
 *  why. The endpoint still returns the other two figures, so nothing downstream changes. */
export function OrderManagementKpiGrid({
    stats,
    segment,
}: Readonly<OrderManagementKpiGridProps>) {
    const showsReturnFlow = segment === "b2c";
    const s = stats ?? {
        total_items: 0,
        delivered_items: 0,
        exchange_items: 0,
        returned_items: 0,
        cancelled_items: 0,
    };

    return (
        <div
            className={`grid min-w-0 grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-3 min-[1920px]:gap-3 ${
                showsReturnFlow ? "xl:grid-cols-5" : "xl:grid-cols-3"
            }`}
        >
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
            {showsReturnFlow ? (
                <>
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
                </>
            ) : null}
            <KPICard
                title="Cancelled Items"
                value={String(s.cancelled_items)}
                icon={<XCircle aria-hidden />}
                kpiType={4}
            />
        </div>
    );
}
