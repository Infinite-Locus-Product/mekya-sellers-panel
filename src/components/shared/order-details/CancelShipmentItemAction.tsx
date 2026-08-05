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
import { cancelShipmentItems, type CancelOrderReason } from "@/lib/api/orders";
import { CANCEL_REASONS, parseCancelQuantity } from "./utils";

/**
 * Cancels some or all units of one SKU out of a packed, not-yet-dispatched shipment.
 *
 * Saleor fulfillments are immutable, so the backend voids this parcel and re-packs what's
 * kept into a new one (carrying the tracking number across). The seller is told that
 * plainly, because the shipment they're looking at will be replaced.
 */
export function CancelShipmentItemAction({
    orderId,
    fulfillmentId,
    orderLineId,
    productName,
    packedQuantity,
    onDone,
}: Readonly<{
    orderId: string;
    fulfillmentId: string;
    orderLineId: string;
    productName: string;
    /** Units of this SKU in this parcel — the cap for the picker. */
    packedQuantity: number;
    onDone?: () => void;
}>) {
    const [open, setOpen] = useState(false);
    // Raw text, not a number: the field must be clearable while retyping, and an
    // over-cap value should be explained rather than silently rewritten.
    const [quantityText, setQuantityText] = useState("1");
    const [reason, setReason] = useState<CancelOrderReason>(CANCEL_REASONS[0]);
    const [restock, setRestock] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { value: quantity, error: quantityError } = parseCancelQuantity(
        quantityText,
        packedQuantity,
    );

    const confirm = async () => {
        if (quantity === null) return;
        setIsSubmitting(true);
        try {
            const res = await cancelShipmentItems(orderId, fulfillmentId, {
                lines: [{ line_id: orderLineId, quantity }],
                reason,
                restock,
            });
            if (res.repack_failed) {
                toast.warning(`${productName} cancelled, but the parcel wasn't rebuilt`, {
                    description:
                        "The remaining items are unfulfilled again — create a new shipment for them.",
                });
            } else {
                toast.success(
                    `${quantity} × ${productName} cancelled`,
                    {
                        description: res.new_shipment_id
                            ? "The parcel was repacked with the remaining items."
                            : "Nothing was left in the parcel, so it was cancelled.",
                    },
                );
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

    const openDialog = () => {
        setQuantityText("1");
        setReason(CANCEL_REASONS[0]);
        setRestock(true);
        setOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Cancel item</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Remove <span className="font-medium text-foreground">{productName}</span>{" "}
                        from this shipment. The parcel will be repacked with whatever remains, so it
                        gets a new shipment entry.
                    </p>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="cancel-shipment-item-qty"
                            className="text-xs font-medium text-foreground"
                        >
                            Quantity to cancel{" "}
                            <span className="text-muted-foreground">(max {packedQuantity})</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label="Decrease quantity"
                                disabled={(quantity ?? 1) <= 1}
                                onClick={() =>
                                    setQuantityText(String(Math.max(1, (quantity ?? 1) - 1)))
                                }
                            >
                                −
                            </Button>
                            <input
                                id="cancel-shipment-item-qty"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={quantityText}
                                aria-invalid={quantityError ? true : undefined}
                                aria-describedby={quantityError ? "cancel-shipment-item-qty-error" : undefined}
                                onChange={(e) => setQuantityText(e.target.value)}
                                onBlur={() => {
                                    // Normalise only once the user has finished typing.
                                    if (quantity !== null) setQuantityText(String(quantity));
                                }}
                                className="h-8 w-16 rounded-md border border-border bg-background px-2 text-center text-sm aria-invalid:border-destructive"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label="Increase quantity"
                                disabled={(quantity ?? packedQuantity) >= packedQuantity}
                                onClick={() =>
                                    setQuantityText(
                                        String(Math.min(packedQuantity, (quantity ?? 0) + 1)),
                                    )
                                }
                            >
                                +
                            </Button>
                            {packedQuantity > 1 ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setQuantityText(String(packedQuantity))}
                                >
                                    All {packedQuantity}
                                </Button>
                            ) : null}
                        </div>
                        {quantityError ? (
                            <p
                                id="cancel-shipment-item-qty-error"
                                role="alert"
                                className="text-[11px] text-destructive"
                            >
                                {quantityError}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-3 space-y-1.5">
                        <label className="text-xs font-medium text-foreground">
                            Reason for cancellation
                        </label>
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
                                name="cancel-shipment-item-restock"
                                className="size-3.5"
                                checked={restock}
                                onChange={() => setRestock(true)}
                            />
                            <span>Yes — return to sellable stock</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border border-border p-2 text-xs sm:text-sm">
                            <input
                                type="radio"
                                name="cancel-shipment-item-restock"
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
                            disabled={isSubmitting || quantity === null}
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
                variant="ghost"
                className="h-6 px-2 text-[11px] text-destructive hover:text-destructive"
                onClick={openDialog}
            >
                Cancel
            </Button>
        </>
    );
}
