"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import { formatMoney } from "@/lib/utils";
import {
    CUSTOM_ORDER_REQUEST_STATUS_LABEL,
    type CustomOrderRequestDetail,
} from "./segment/customOrderTypes";

const STATUS_VARIANT: Record<CustomOrderRequestDetail["status"], StatusVariant> = {
    pending_review: "pending",
    awaiting_buyer_confirmation: "processing",
    buyer_confirmed: "delivered",
    buyer_declined: "canceled",
    rejected: "canceled",
};

function formatDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

interface CustomOrderDetailsModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly data: CustomOrderRequestDetail | null;
    readonly onApprove: (customOrderId: string) => Promise<void>;
    readonly onReject: (payload: { customOrderId: string; reason: string }) => Promise<void>;
    readonly onBuyerConfirm: (customOrderId: string) => Promise<void>;
    readonly onAddNote: (payload: { customOrderId: string; body: string }) => Promise<void>;
    readonly onEditNote: (payload: { customOrderId: string; noteId: string; body: string }) => Promise<void>;
    readonly onDeleteNote: (payload: { customOrderId: string; noteId: string }) => Promise<void>;
}

function CustomOrderDetailsModalInner({
    data,
    onOpenChange,
    onApprove,
    onReject,
    onBuyerConfirm,
    onAddNote,
    onEditNote,
    onDeleteNote,
}: Readonly<{
    data: CustomOrderRequestDetail;
    onOpenChange: (open: boolean) => void;
    onApprove: CustomOrderDetailsModalProps["onApprove"];
    onReject: CustomOrderDetailsModalProps["onReject"];
    onBuyerConfirm: CustomOrderDetailsModalProps["onBuyerConfirm"];
    onAddNote: CustomOrderDetailsModalProps["onAddNote"];
    onEditNote: CustomOrderDetailsModalProps["onEditNote"];
    onDeleteNote: CustomOrderDetailsModalProps["onDeleteNote"];
}>) {
    const [rejectReason, setRejectReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newNoteBody, setNewNoteBody] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingBody, setEditingBody] = useState("");
    const [noteActionPending, setNoteActionPending] = useState(false);

    const totalQty = data.orderLines.reduce((sum, l) => sum + l.quantity, 0);
    const amountLabel =
        data.totalAmount != null
            ? formatMoney({ amount: data.totalAmount, currency: data.currency ?? "INR" })
            : "—";

    const submitApprove = async () => {
        setIsSubmitting(true);
        try {
            await onApprove(data.id);
        } finally {
            setIsSubmitting(false);
        }
    };

    const trimmedRejectReason = rejectReason.trim();

    const submitReject = async () => {
        if (!trimmedRejectReason) return;
        setIsSubmitting(true);
        try {
            await onReject({ customOrderId: data.id, reason: trimmedRejectReason });
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitBuyerConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onBuyerConfirm(data.id);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitAddNote = async () => {
        const body = newNoteBody.trim();
        if (!body) return;
        setNoteActionPending(true);
        try {
            await onAddNote({ customOrderId: data.id, body });
            setNewNoteBody("");
        } finally {
            setNoteActionPending(false);
        }
    };

    const startEditNote = (noteId: string, currentBody: string) => {
        setEditingNoteId(noteId);
        setEditingBody(currentBody);
    };

    const cancelEditNote = () => {
        setEditingNoteId(null);
        setEditingBody("");
    };

    const submitEditNote = async (noteId: string) => {
        const body = editingBody.trim();
        if (!body) return;
        setNoteActionPending(true);
        try {
            await onEditNote({ customOrderId: data.id, noteId, body });
            cancelEditNote();
        } finally {
            setNoteActionPending(false);
        }
    };

    const submitDeleteNote = async (noteId: string) => {
        if (!window.confirm("Delete this note? This cannot be undone.")) return;
        setNoteActionPending(true);
        try {
            await onDeleteNote({ customOrderId: data.id, noteId });
        } finally {
            setNoteActionPending(false);
        }
    };

    return (
        <div className="flex max-h-[85vh] flex-col gap-4 overflow-hidden p-1">
            <DialogHeader className="shrink-0 space-y-1 text-left">
                <DialogTitle className="text-lg font-semibold">Custom order request</DialogTitle>
                <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{data.id}</span>
                    {" · Saleor order "}
                    <span className="font-medium text-foreground">{data.saleorOrderNumber ?? data.saleorOrderId}</span>
                    {data.linkedDisplayOrderId ? (
                        <>
                            {" "}
                            · Linked order{" "}
                            <span className="font-medium text-foreground">{data.linkedDisplayOrderId}</span>
                        </>
                    ) : null}
                </p>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Vendor</dt>
                        <dd className="font-medium">{data.vendorName ?? "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Customer</dt>
                        <dd className="font-medium">{data.customerName ?? "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Contact</dt>
                        <dd className="font-medium">
                            {data.contactPerson ?? "—"}
                            {data.customerEmail ? ` · ${data.customerEmail}` : ""}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Request date</dt>
                        <dd className="font-medium">{formatDateTime(data.createdAt)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Total amount</dt>
                        <dd className="font-medium">{amountLabel}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd className="mt-0.5">
                            <StatusBadge variant={STATUS_VARIANT[data.status]}>
                                {CUSTOM_ORDER_REQUEST_STATUS_LABEL[data.status]}
                            </StatusBadge>
                        </dd>
                    </div>
                </dl>

                {data.requirementsText || data.packagingNotes ? (
                    <div className="space-y-2">
                        {data.requirementsText ? (
                            <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                <p className="font-medium text-foreground">Requirements</p>
                                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{data.requirementsText}</p>
                            </div>
                        ) : null}
                        {data.packagingNotes ? (
                            <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                <p className="font-medium text-foreground">Packaging notes</p>
                                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{data.packagingNotes}</p>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {data.uploadedFiles.length > 0 ? (
                    <div>
                        <p className="mb-1.5 text-sm font-medium">Uploaded reference files</p>
                        <ul className="flex flex-wrap gap-2">
                            {data.uploadedFiles.map((f, i) => (
                                <li key={`${f.url}-${i}`}>
                                    <a
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-foreground underline-offset-2 hover:underline"
                                    >
                                        {f.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-3 py-2 font-medium">SKU</th>
                                <th className="px-3 py-2 font-medium">Product</th>
                                <th className="px-3 py-2 font-medium">Qty</th>
                                <th className="px-3 py-2 font-medium">Unit price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.orderLines.map((line) => (
                                <tr key={line.lineId} className="border-b last:border-0">
                                    <td className="px-3 py-2 text-muted-foreground">{line.sku ?? "—"}</td>
                                    <td className="px-3 py-2">
                                        {line.productName}
                                        {line.variantName ? (
                                            <span className="text-muted-foreground"> — {line.variantName}</span>
                                        ) : null}
                                    </td>
                                    <td className="px-3 py-2">{line.quantity}</td>
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {line.unitPrice != null
                                            ? formatMoney({ amount: line.unitPrice, currency: line.currency ?? "INR" })
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-muted/30 font-medium">
                                <td colSpan={2} className="px-3 py-2 text-right">
                                    Total
                                </td>
                                <td className="px-3 py-2">{totalQty}</td>
                                <td className="px-3 py-2">{amountLabel}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {data.status === "pending_review" ? (
                    <div className="space-y-1.5">
                        <label htmlFor="reject-reason" className="text-sm font-medium">
                            Rejection reason (required to reject)
                        </label>
                        <textarea
                            id="reject-reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Why is this request being rejected?"
                            rows={2}
                            required
                            className="w-full rounded-md border bg-background p-2 text-sm"
                        />
                    </div>
                ) : null}

                {data.statusEvents.length > 0 ? (
                    <div>
                        <p className="mb-1.5 text-sm font-medium">Status history</p>
                        <ol className="space-y-2">
                            {data.statusEvents.map((event) => (
                                <li key={event.id} className="rounded-md border bg-muted/30 p-2.5 text-xs">
                                    <p className="font-medium text-foreground">
                                        {event.fromStatus
                                            ? `${CUSTOM_ORDER_REQUEST_STATUS_LABEL[event.fromStatus]} → `
                                            : ""}
                                        {CUSTOM_ORDER_REQUEST_STATUS_LABEL[event.toStatus]}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {formatDateTime(event.changedAt)} · {event.changedBy}
                                    </p>
                                    {event.note ? <p className="mt-1 text-muted-foreground">{event.note}</p> : null}
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : null}

                <div>
                    <p className="mb-1.5 text-sm font-medium">Notes</p>
                    <div className="space-y-2">
                        {data.notes.map((note) => (
                            <div key={note.id} className="rounded-md border bg-muted/30 p-2.5 text-xs">
                                {editingNoteId === note.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editingBody}
                                            onChange={(e) => setEditingBody(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border bg-background p-2 text-xs"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={cancelEditNote}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={noteActionPending || !editingBody.trim()}
                                                onClick={() => submitEditNote(note.id)}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-foreground">
                                                {note.author}
                                                {note.edited ? (
                                                    <span className="ml-1 font-normal text-muted-foreground">(edited)</span>
                                                ) : null}
                                            </p>
                                            <div className="flex shrink-0 gap-1">
                                                <button
                                                    type="button"
                                                    aria-label="Edit note"
                                                    disabled={noteActionPending}
                                                    onClick={() => startEditNote(note.id, note.body)}
                                                    className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                                                >
                                                    <Pencil className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Delete note"
                                                    disabled={noteActionPending}
                                                    onClick={() => submitDeleteNote(note.id)}
                                                    className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{note.body}</p>
                                        <p className="mt-1 text-muted-foreground">{formatDateTime(note.updatedAt)}</p>
                                    </>
                                )}
                            </div>
                        ))}
                        {data.notes.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No notes yet.</p>
                        ) : null}
                    </div>
                    <div className="mt-2 space-y-1.5">
                        <textarea
                            value={newNoteBody}
                            onChange={(e) => setNewNoteBody(e.target.value)}
                            rows={2}
                            placeholder="Add an internal note…"
                            className="w-full rounded-md border bg-background p-2 text-xs"
                        />
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                disabled={noteActionPending || !newNoteBody.trim()}
                                onClick={submitAddNote}
                            >
                                Add note
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    <X className="mr-2 h-4 w-4" aria-hidden />
                    Close
                </Button>
                {data.status === "pending_review" ? (
                    <>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isSubmitting || !trimmedRejectReason}
                            onClick={submitReject}
                        >
                            Reject
                        </Button>
                        <Button type="button" disabled={isSubmitting} onClick={submitApprove}>
                            {isSubmitting ? "Approving…" : "Approve"}
                        </Button>
                    </>
                ) : data.status === "awaiting_buyer_confirmation" ? (
                    <Button type="button" disabled={isSubmitting} onClick={submitBuyerConfirm}>
                        {isSubmitting ? "Confirming…" : "Mark Buyer Confirmed"}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

export function CustomOrderDetailsModal({
    open,
    onOpenChange,
    data,
    onApprove,
    onReject,
    onBuyerConfirm,
    onAddNote,
    onEditNote,
    onDeleteNote,
}: Readonly<CustomOrderDetailsModalProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden sm:max-w-2xl">
                {!data ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <CustomOrderDetailsModalInner
                        key={data.id}
                        data={data}
                        onOpenChange={onOpenChange}
                        onApprove={onApprove}
                        onReject={onReject}
                        onBuyerConfirm={onBuyerConfirm}
                        onAddNote={onAddNote}
                        onEditNote={onEditNote}
                        onDeleteNote={onDeleteNote}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
