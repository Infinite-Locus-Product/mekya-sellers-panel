"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markDemandFulfilled } from "@/lib/api/orders";

/** Single-click action for a buyer-confirmed custom order's linked order — no request body, so no
 * modal. Lives here (on the custom-order row) rather than the Orders tab since the real order
 * record has no field indicating it's demand-blocked; this custom-order row is the only place that
 * context exists. */
export function MarkDemandFulfilledAction({
    orderId,
    onDone,
}: Readonly<{ orderId: string; onDone?: () => void }>) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const confirm = async () => {
        setIsSubmitting(true);
        try {
            await markDemandFulfilled(orderId);
            toast.success(`${orderId} — demand fulfilled, Pack & Label unblocked`);
            onDone?.();
        } catch (err) {
            toast.error("Could not mark demand fulfilled", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" disabled={isSubmitting} onClick={confirm}>
            {isSubmitting ? "Updating…" : "Demand Fulfilled"}
        </Button>
    );
}
