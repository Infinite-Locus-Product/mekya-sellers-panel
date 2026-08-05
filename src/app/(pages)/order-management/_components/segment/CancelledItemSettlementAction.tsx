"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    updateCancelledItemSettlement,
    type CancelledItemSettlementStatus,
} from "@/lib/api/orders";

const SETTLEMENT_OPTIONS: { value: CancelledItemSettlementStatus; label: string }[] = [
    { value: "not_applicable", label: "No refund due" },
    { value: "refund_pending", label: "Refund pending" },
    { value: "refunded", label: "Refunded" },
];

/** Records the refund state of a cancelled item. Bookkeeping only — money moves through the
 * payment gateway, not this call, so this is the seller telling Mekya what already happened. */
export function CancelledItemSettlementAction({
    cancellationId,
    currentStatus,
    currentReference,
    onDone,
}: Readonly<{
    cancellationId: string;
    currentStatus: CancelledItemSettlementStatus;
    currentReference: string | null;
    onDone?: () => void;
}>) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<CancelledItemSettlementStatus>(currentStatus);
    const [reference, setReference] = useState(currentReference ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const confirm = async () => {
        setIsSubmitting(true);
        try {
            await updateCancelledItemSettlement(cancellationId, {
                settlement_status: status,
                refund_reference: reference.trim() || null,
            });
            toast.success("Refund status updated");
            setOpen(false);
            onDone?.();
        } catch (err) {
            toast.error("Could not update refund status", {
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
                        <DialogTitle className="text-base font-semibold">Update refund status</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Record the refund state for{" "}
                        <span className="font-medium text-foreground">{cancellationId}</span>. This
                        does not move money — set it once the refund is actually processed.
                    </p>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Refund status</label>
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v as CancelledItemSettlementStatus)}
                        >
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SETTLEMENT_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-3 space-y-1.5">
                        <label className="text-xs font-medium text-foreground">
                            Reference <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <Input
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="e.g. gateway refund ID"
                            maxLength={128}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="button" size="sm" disabled={isSubmitting} onClick={confirm}>
                            {isSubmitting ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                    setStatus(currentStatus);
                    setReference(currentReference ?? "");
                    setOpen(true);
                }}
            >
                Refund
            </Button>
        </>
    );
}
