"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { OrderBulkActionDialogIcon } from "@/assets/icons/order-management";
import type { OrderStatus } from "@/lib/tableTypes";

const BULK_ACTION_OPTIONS = [
    { value: "update_status", label: "Update Status" },
    { value: "generate_invoice", label: "Generate Invoices" },
] as const;

/** Statuses available when bulk-updating order status (matches order workflow UI). */
const BULK_NEW_ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
    { value: "Pending", label: "Pending" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Returned", label: "Returned" },
    { value: "Canceled", label: "Canceled" },
];

const selectTriggerClass = cn(
    "w-full border-0 bg-[#E8E9E8] shadow-none hover:bg-[#dde0dd]",
    "text-foreground data-[placeholder]:text-[#000000]"
);

export type BulkActionExecuteMeta = {
    /** Target order status when `action` is `update_status`. */
    newOrderStatus?: OrderStatus;
};

export interface BulkActionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedOrderIds: readonly string[];
    onExecute?: (action: string, orderIds: readonly string[], meta?: BulkActionExecuteMeta) => void;
}
export function BulkActionModal({
    open,
    onOpenChange,
    selectedOrderIds,
    onExecute,
}: Readonly<BulkActionModalProps>) {
    const [action, setAction] = useState<string>("");
    const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus | "">("");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setAction("");
            setNewOrderStatus("");
        }
        onOpenChange(nextOpen);
    };

    const count = selectedOrderIds.length;
    const orderWord = count === 1 ? "order" : "orders";
    const needsNewStatus = action === "update_status";
    const showInvoiceHint = action === "generate_invoice";
    const canExecute =
        Boolean(action) &&
        count > 0 &&
        (!needsNewStatus || Boolean(newOrderStatus));

    const handleExecute = () => {
        if (!canExecute) return;
        const meta: BulkActionExecuteMeta | undefined =
            needsNewStatus && newOrderStatus ? { newOrderStatus } : undefined;
        onExecute?.(action, selectedOrderIds, meta);
        handleOpenChange(false);
    };

    const primaryButtonLabel = (() => {
        if (action === "generate_invoice") return "Generate Invoice";
        if (action === "update_status") return `Update Status (${count} ${orderWord})`;
        const opt = BULK_ACTION_OPTIONS.find((o) => o.value === action);
        const base = opt?.label ?? "Execute";
        return `${base} (${count} ${orderWord})`;
    })();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                hideDefaultClose
                className={cn(
                    "!flex !min-h-[362px] !h-auto !max-h-[min(440px,92vh)] !w-[580px] !max-w-[min(580px,calc(100vw-2rem))] !flex-col !gap-0 !overflow-hidden !rounded-[5px] !p-0 !opacity-100",
                    "!left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2",
                    "xl:!left-[670px] xl:!top-[359px] xl:!translate-x-0 xl:!translate-y-0"
                )}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <OrderBulkActionDialogIcon className="size-5 shrink-0 min-[1920px]:size-6" />

                        <h2 id="bulk-action-title" className="text-base font-semibold text-foreground">
                            Bulk Action
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleOpenChange(false)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Close"
                    >
                        <span className="text-lg leading-none" aria-hidden>
                            ×
                        </span>
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">Selected Orders</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedOrderIds.map((id) => (
                                <span
                                    key={id}
                                    className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                                >
                                    {id}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Select Action</p>
                        <Select
                            value={action}
                            onValueChange={(value) => {
                                setAction(value);
                                if (value !== "update_status") setNewOrderStatus("");
                            }}
                        >
                            <SelectTrigger className={selectTriggerClass} size="sm">
                                <SelectValue placeholder="Choose bulk action" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                                {BULK_ACTION_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {showInvoiceHint ? (
                            <p className="rounded-[5px] border border-border/40 bg-[#F5F5F5] px-3 py-2.5 text-left text-sm leading-snug text-foreground">
                                Generate and download invoices for {count}{" "}
                                {count === 1 ? "selected order" : "selected orders"}.
                            </p>
                        ) : null}

                        {needsNewStatus ? (
                            <div className="space-y-2 pt-1">
                                <p className="text-sm font-medium text-foreground">New Status</p>
                                <Select
                                    value={newOrderStatus}
                                    onValueChange={(value) => setNewOrderStatus(value as OrderStatus)}
                                >
                                    <SelectTrigger className={selectTriggerClass} size="sm">
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                        {BULK_NEW_ORDER_STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 justify-between gap-3 border-t border-border px-4 py-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-foreground bg-background text-foreground hover:bg-muted w-full"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={!canExecute}
                        className={cn(
                            "min-w-[12rem]",
                            canExecute
                                ? "bg-foreground text-background hover:bg-foreground/90 w-full h-[45px]"
                                : "bg-muted text-muted-foreground w-full"
                        )}
                        onClick={handleExecute}
                    >
                        {primaryButtonLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
