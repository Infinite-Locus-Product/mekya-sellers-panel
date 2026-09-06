"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateExchangeStatus, type ExchangeOrderStatus } from "@/lib/api/orders";
import { EXCHANGE_STATUS_LABEL } from "./constants";

/** "cancelled" is excluded alongside the two entry states: it is terminal and reached only
 * by cancelling the replacement order's lines, never by advancing the exchange from here. */
type ManualExchangeStatus = Exclude<
    ExchangeOrderStatus,
    "pending" | "processing" | "cancelled"
>;

/** Pending has no manual advance on purpose: a replacement leaves Pending by having its
 * shipment created (which is where the warehouse is chosen), exactly as an ordinary order
 * does. Offering a button here would let the status run ahead of the real fulfillment. */
const NEXT_STATUS: Record<ExchangeOrderStatus, ManualExchangeStatus | null> = {
    pending: null,
    processing: "ready",
    ready: "shipped",
    shipped: "delivered",
    delivered: null,
    // Terminal: the replacement order was cancelled, so there is no shipment left to advance.
    cancelled: null,
};

/** Single "advance to next stage" action for an exchange order's own status machine, mirroring
 * ShipmentActions' forward-only flow. All shipped-transition fields are optional per the contract
 * (tracking_number included) — nothing here is required to confirm. */
export function ExchangeStatusActions({
    exchangeId,
    status,
    onDone,
}: Readonly<{ exchangeId: string; status: ExchangeOrderStatus; onDone?: () => void }>) {
    const next = NEXT_STATUS[status];
    const [modalOpen, setModalOpen] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courier, setCourier] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!next) return null;

    const advance = async (
        extra: {
            tracking_number?: string;
            courier?: string;
            contact_person?: string;
            contact_phone?: string;
            estimated_delivery_at?: string;
            note?: string;
        } = {}
    ) => {
        setIsSubmitting(true);
        try {
            await updateExchangeStatus(exchangeId, { status: next, ...extra });
            toast.success(`Exchange marked as ${EXCHANGE_STATUS_LABEL[next].toLowerCase()}`);
            setModalOpen(false);
            onDone?.();
        } catch (err) {
            toast.error("Update failed", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (next === "shipped") {
        return (
            <>
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-base font-semibold">Mark exchange as shipped</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Tracking number (optional)</label>
                                <Input
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Courier (optional)</label>
                                <Input
                                    value={courier}
                                    onChange={(e) => setCourier(e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Contact person (optional)</label>
                                    <Input
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Contact phone (optional)</label>
                                    <Input
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">
                                    Estimated delivery (optional)
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={estimatedDeliveryAt}
                                    onChange={(e) => setEstimatedDeliveryAt(e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground">Note (optional)</label>
                                <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9 text-sm" />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={isSubmitting}
                                onClick={() =>
                                    advance({
                                        ...(trackingNumber.trim() ? { tracking_number: trackingNumber.trim() } : {}),
                                        ...(courier.trim() ? { courier: courier.trim() } : {}),
                                        ...(contactPerson.trim() ? { contact_person: contactPerson.trim() } : {}),
                                        ...(contactPhone.trim() ? { contact_phone: contactPhone.trim() } : {}),
                                        ...(estimatedDeliveryAt
                                            ? { estimated_delivery_at: new Date(estimatedDeliveryAt).toISOString() }
                                            : {}),
                                        ...(note.trim() ? { note: note.trim() } : {}),
                                    })
                                }
                            >
                                {isSubmitting ? "Confirming…" : "Confirm"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setModalOpen(true)}>
                    Mark Shipped
                </Button>
            </>
        );
    }

    return (
        <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isSubmitting}
            onClick={() => advance()}
        >
            {isSubmitting ? "Updating…" : `Mark ${EXCHANGE_STATUS_LABEL[next]}`}
        </Button>
    );
}
