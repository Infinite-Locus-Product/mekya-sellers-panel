"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cancelOrderLines, type CancelOrderReason } from "@/lib/api/orders";
import { CANCEL_REASONS } from "./utils";

/** Cancels a single order line pre-shipment. The caller only renders this when the line still
 * has unshipped, un-cancelled units (see OrderItem.cancellableQuantity) — matching the backend's
 * own NOTHING_TO_CANCEL guard. The rest of the order stays shippable, which is what separates
 * this from a whole-shipment cancel (via Saleor orderFulfillmentCancel). */
export function CancelLineItemAction({
    orderId,
    orderLineId,
    productName,
    quantity,
    onDone,
}: Readonly<{
    orderId: string;
    orderLineId: string;
    productName: string;
    /** Units that will be cancelled — the whole unshipped remainder of this line. */
    quantity: number;
    onDone?: () => void;
}>) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<CancelOrderReason>(CANCEL_REASONS[0]);
    const [restock, setRestock] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const confirm = async () => {
        setIsSubmitting(true);
        try {
            const res = await cancelOrderLines(orderId, {
                line_ids: [orderLineId],
                reason,
                restock,
            });
            // restocked comes back null when a restock was asked for but couldn't be applied
            // (no variant/warehouse on the line, or Saleor refused) — the cancellation still
            // succeeded, so say so rather than reporting a plain success.
            const line = res.cancelled_lines[0];
            if (restock && line && line.restocked !== true) {
                toast.warning(`${productName} cancelled, but stock was not returned`, {
                    description: "Cancellation saved. Adjust this SKU's stock manually.",
                });
            } else {
                toast.success(`${productName} cancelled`, {
                    description: restock
                        ? `${quantity} unit${quantity === 1 ? "" : "s"} returned to sellable stock.`
                        : `${quantity} unit${quantity === 1 ? "" : "s"} cancelled without restocking.`,
                });
            }
            setOpen(false);
            onDone?.();
        } catch (err) {
            toast.error("Could not cancel item", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Cancel item</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Cancel{" "}
                        <span className="font-medium text-foreground">
                            {quantity} × {productName}
                        </span>{" "}
                        from {orderId}? The rest of the order can still be shipped. This cannot be undone.
                    </p>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Reason for cancellation</label>
                        <Select value={reason} onValueChange={(v) => setReason(v as CancelOrderReason)}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CANCEL_REASONS.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-3 space-y-1.5">
                        <span className="text-xs font-medium text-foreground">
                            Do these units go back to warehouse stock?
                        </span>
                        <label className="flex items-center gap-2 rounded-md border border-border p-2 text-xs sm:text-sm">
                            <input
                                type="radio"
                                name="cancel-restock"
                                className="size-3.5"
                                checked={restock}
                                onChange={() => setRestock(true)}
                            />
                            <span>
                                Yes — return to sellable stock
                                <span className="block text-[11px] text-muted-foreground">
                                    Units become available to sell again.
                                </span>
                            </span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border border-border p-2 text-xs sm:text-sm">
                            <input
                                type="radio"
                                name="cancel-restock"
                                className="size-3.5"
                                checked={!restock}
                                onChange={() => setRestock(false)}
                            />
                            <span>
                                No — do not restock
                                <span className="block text-[11px] text-muted-foreground">
                                    Use when the units are damaged or missing.
                                </span>
                            </span>
                        </label>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Go back
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={confirm}
                        >
                            {isSubmitting ? "Cancelling…" : "Confirm cancellation"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => setOpen(true)}
            >
                Cancel
            </Button>
        </>
    );
}
