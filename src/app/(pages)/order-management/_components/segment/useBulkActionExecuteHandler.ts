"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { BulkActionExecuteMeta } from "@/app/(pages)/order-management/_components/BulkActionModal";
import { getBulkActionSuccessMessage } from "./bulkActionMessages";

/**
 * Mirrors the prior inline `onExecute`: toast then always clear selection in `finally`.
 */
export function useBulkActionExecuteHandler(onClearSelection: () => void) {
    return useCallback(
        (action: string, orderIds: readonly string[], meta?: BulkActionExecuteMeta) => {
            try {
                const message = getBulkActionSuccessMessage(action, orderIds.length, meta);
                toast.success(message);
            } finally {
                onClearSelection();
            }
        },
        [onClearSelection]
    );
}
