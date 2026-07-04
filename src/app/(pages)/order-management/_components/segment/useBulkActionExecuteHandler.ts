"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { BulkActionExecuteMeta } from "@/app/(pages)/order-management/_components/BulkActionModal";
import { bulkOrders, type BulkOrderAction } from "@/lib/api/orders";
import { getBulkActionSuccessMessage } from "./bulkActionMessages";

export function useBulkActionExecuteHandler(onClearSelection: () => void) {
    return useCallback(
        (action: string, orderIds: readonly string[], meta?: BulkActionExecuteMeta) => {
            const payload =
                action === "update_status" && meta?.newOrderStatus
                    ? { status: meta.newOrderStatus.toLowerCase() }
                    : {};

            bulkOrders({
                order_ids: [...orderIds],
                action: action as BulkOrderAction,
                payload,
            })
                .then((res) => toast.success(res.message))
                .catch((err: unknown) =>
                    toast.error("Bulk action failed", {
                        description: err instanceof Error ? err.message : "Please try again.",
                    }),
                )
                .finally(() => onClearSelection());
        },
        [onClearSelection]
    );
}
