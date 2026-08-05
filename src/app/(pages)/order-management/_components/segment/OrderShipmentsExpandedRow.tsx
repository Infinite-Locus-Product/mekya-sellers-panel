"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getOrderDetail } from "@/lib/api/orders";
import type { OrderDetailUnfulfilledLine, ShipmentDisplay } from "@/components/shared/order-details/types";
import { ShipmentsSection } from "@/components/shared/order-details/ShipmentsSection";
import { mapApiOrderDetailToOrderDetailsData } from "@/app/(pages)/order-management/[orderId]/mapOrderDetail";

interface ExpandedRowShipmentData {
    shipments: ShipmentDisplay[];
    unfulfilledLines: OrderDetailUnfulfilledLine[];
    deliveryPincode: string | null;
    orderStatus: string;
}

/** Survives row collapse/re-expand (DataTable unmounts the expanded row on collapse) so
 * re-opening the same order doesn't re-fetch its shipments every time. */
const shipmentsCache = new Map<string, ExpandedRowShipmentData>();

export interface OrderShipmentsExpandedRowProps {
    readonly orderId: string;
}

/** Lazily fetches order detail on first expand and renders its shipments inline in the list. */
export function OrderShipmentsExpandedRow({ orderId }: Readonly<OrderShipmentsExpandedRowProps>) {
    const [data, setData] = useState<ExpandedRowShipmentData | null>(shipmentsCache.get(orderId) ?? null);
    const [loading, setLoading] = useState(!shipmentsCache.has(orderId));
    const [error, setError] = useState(false);
    const [refreshToken, setRefreshToken] = useState(0);

    useEffect(() => {
        if (shipmentsCache.has(orderId) && refreshToken === 0) return;
        // Deferred to a microtask (not a synchronous effect-body call) and guarded by `cancelled`
        // so a slower superseded request can't clobber a faster, newer one's result.
        let cancelled = false;
        queueMicrotask(() => {
            if (cancelled) return;
            setLoading(true);
            setError(false);
        });
        getOrderDetail(orderId)
            .then((detail) => {
                if (cancelled) return;
                const mapped = mapApiOrderDetailToOrderDetailsData(detail);
                const next: ExpandedRowShipmentData = {
                    shipments: mapped.shipments ?? [],
                    unfulfilledLines: mapped.unfulfilledLines ?? [],
                    deliveryPincode: mapped.deliveryPincode ?? null,
                    orderStatus: mapped.status,
                };
                shipmentsCache.set(orderId, next);
                setData(next);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [orderId, refreshToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading shipments…
            </div>
        );
    }
    if (error) {
        return <p className="p-4 text-xs text-muted-foreground">Couldn&apos;t load shipment details.</p>;
    }
    if (!data) {
        return <p className="p-4 text-xs text-muted-foreground">No shipments yet.</p>;
    }
    return (
        <div className="p-3 sm:p-4">
            <ShipmentsSection
                shipments={data.shipments}
                orderId={orderId}
                unfulfilledLines={data.unfulfilledLines}
                deliveryPincode={data.deliveryPincode}
                orderStatus={data.orderStatus}
                onRefresh={() => setRefreshToken((t) => t + 1)}
            />
        </div>
    );
}
