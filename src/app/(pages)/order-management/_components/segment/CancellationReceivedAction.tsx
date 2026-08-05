"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { rtoReceiveShipment } from "@/lib/api/orders";

/** "Mark Item Received" as a direct list-row action — the cancellation row already carries its own
 * fulfillment_id, so this skips the detail page entirely. */
export function CancellationReceivedAction({
    orderId,
    fulfillmentId,
    onDone,
}: Readonly<{ orderId: string; fulfillmentId: string; onDone?: () => void }>) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const confirm = async () => {
        if (!reason.trim()) {
            toast.error("Reason required");
            return;
        }
        setIsSubmitting(true);
        try {
            await rtoReceiveShipment(orderId, fulfillmentId, {
                reason: reason.trim(),
                ...(note.trim() ? { note: note.trim() } : {}),
            });
            toast.success("Marked RTO received — item restocked");
            setOpen(false);
            onDone?.();
        } catch (err) {
            toast.error("Update failed", {
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
                        <DialogTitle className="text-base font-semibold">Mark item received</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">Reason (required)</label>
                            <Input value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-foreground">Note (optional)</label>
                            <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9 text-sm" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="button" size="sm" disabled={isSubmitting} onClick={confirm}>
                            {isSubmitting ? "Confirming…" : "Confirm"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOpen(true)}>
                Mark Item Received
            </Button>
        </>
    );
}
