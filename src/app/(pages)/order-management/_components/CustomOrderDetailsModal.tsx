"use client";

import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Pencil, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CustomOrderFile {
    readonly name: string;
    /** When set, "open" on chip uses this URL (e.g. blob or static path). */
    readonly href?: string;
}

export interface CustomOrderLine {
    readonly product: string;
    readonly sku?: string;
    readonly quantity: number | string;
    readonly price: string;
    readonly total: string;
}

export interface CustomOrderDetailsData {
    readonly orderId: string;
    readonly vendorName: string;
    readonly orderDate: string;
    readonly contactPerson: string;
    readonly deadline: string;
    readonly orderValue: string;
    readonly currentStatusLabel: string;
    readonly customizationRequirements: string;
    readonly uploadedFiles: readonly CustomOrderFile[];
    readonly packagingPreferences: string;
    readonly lines: readonly CustomOrderLine[];
}

const CUSTOM_STATUS_OPTIONS = [
    { value: "none", label: "None" },
    { value: "in_process", label: "In Process" },
    { value: "fulfilled", label: "Fulfilled" },
    { value: "pending_info", label: "Pending Info" },
] as const;

type CustomizationStatusValue = (typeof CUSTOM_STATUS_OPTIONS)[number]["value"];

function parseINR(value: string): number {
    const numeric = Number.parseFloat(String(value ?? "").replaceAll(/[₹,]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
}

interface CustomOrderDetailsModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly data: CustomOrderDetailsData | null;
    readonly onUpdateStatus?: (payload: {
        data: CustomOrderDetailsData;
        newStatus: string;
        adminNotes: string;
    }) => void;
}

interface CustomOrderDetailsModalInnerProps {
    readonly data: CustomOrderDetailsData;
    readonly onOpenChange: (open: boolean) => void;
    readonly onUpdateStatus?: CustomOrderDetailsModalProps["onUpdateStatus"];
}

function CustomOrderDetailsModalInner({
    data,
    onOpenChange,
    onUpdateStatus,
}: CustomOrderDetailsModalInnerProps) {
    const [newStatus, setNewStatus] = useState<CustomizationStatusValue | undefined>(undefined);
    const [adminNotes, setAdminNotes] = useState("");

    /** Sum of line totals (for reference). */
    const linesSumFormatted = useMemo(() => {
        const sum = data.lines.reduce((acc, line) => acc + parseINR(line.total), 0);
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(sum);
    }, [data.lines]);

    /** Footer matches order value when parseable (same as header), else line sum. */
    const requirementFooterTotal = useMemo(() => {
        const fromOrder = parseINR(data.orderValue);
        if (fromOrder > 0) {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(fromOrder);
        }
        return linesSumFormatted;
    }, [data.orderValue, linesSumFormatted]);

    const handleDownloadAttachments = () => {
        const withHref = data.uploadedFiles.filter((f) => Boolean(f.href));
        if (withHref.length === 0) {
            toast.message("No downloadable files", {
                description: "Attach file URLs when the API provides them.",
            });
            return;
        }
        for (const file of withHref) {
            if (file.href) window.open(file.href, "_blank", "noopener,noreferrer");
        }
    };

    const hasSelectedNewStatus = useMemo(
        () =>
            newStatus !== undefined &&
            CUSTOM_STATUS_OPTIONS.some((option) => option.value === newStatus),
        [newStatus]
    );

    return (
        <>
            <div className="shrink-0 px-[min(1.25vw,24px)] pt-[clamp(12px,0.75vw,16px)]">
                <DialogHeader className="mb-0 border-b-0 pb-0">
                    <DialogTitle className="pr-10 text-left text-xl font-medium leading-tight sm:text-2xl">
                        <span className="flex items-center gap-2">
                            <Pencil className="size-5 shrink-0 text-foreground" aria-hidden />
                            <span>Customization Requests</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-3 h-px w-full bg-[#E8E9E8]" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-[min(1.25vw,24px)] pb-2 pt-[clamp(10px,0.625vw,12px)]">
                <div className="box-border min-h-[min(7.8125vw,150px)] w-full max-w-[823px] shrink-0 rounded-[5px] bg-[#E8E9E8] p-[clamp(10px,0.833vw,16px)]">
                    <div className="grid grid-cols-1 gap-x-[clamp(12px,1.25vw,24px)] gap-y-[clamp(6px,0.52vw,10px)] sm:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">Vendor Name</p>
                            <p className="text-[clamp(11px,0.677vw,12px)] font-normal leading-snug text-foreground">
                                {data.vendorName}
                            </p>
                        </div>
                        <div>
                            <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">Contact Person</p>
                            <p className="text-[clamp(11px,0.677vw,12px)] font-normal leading-snug text-foreground">
                                {data.contactPerson}
                            </p>
                        </div>
                        <div>
                            <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">Order Value</p>
                            <p className="text-[clamp(11px,0.677vw,13px)] font-medium leading-snug">
                                {data.orderValue}
                            </p>
                        </div>
                        <div>
                            <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">Order Date</p>
                            <p className="text-[clamp(11px,0.677vw,12px)] font-normal leading-snug">{data.orderDate}</p>
                        </div>
                        <div>
                            <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">Deadline</p>
                            <p className="text-[clamp(11px,0.677vw,12px)] font-normal leading-snug">{data.deadline}</p>
                        </div>
                        <div>
                            <p className="pb-1 text-[clamp(11px,0.625vw,14px)] font-medium">Current Status</p>
                            <span className="inline-flex max-w-full items-center rounded-full bg-[#DBEAFE] px-2.5 py-0.5 text-[clamp(10px,0.625vw,12px)] font-medium leading-tight text-[#1D4ED8]">
                                {data.currentStatusLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0 border-t border-dotted border-[#C4C4C4] pt-[clamp(10px,0.833vw,16px)]">
                    <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Customization Requirements</p>
                    <div className="rounded-[5px] bg-[#E8E9E8] p-[clamp(10px,0.625vw,12px)]">
                        <p className="text-[clamp(11px,0.677vw,13px)] leading-relaxed text-foreground">
                            {data.customizationRequirements}
                        </p>
                    </div>
                </div>

                <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0 border-t border-dotted border-[#C4C4C4] pt-[clamp(10px,0.833vw,16px)]">
                    <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Uploaded Files</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-wrap gap-2">
                            {data.uploadedFiles.map((file) => (
                                <button
                                    key={file.name}
                                    type="button"
                                    className="inline-flex max-w-full items-center gap-1.5 rounded-[5px] border border-border px-2.5 py-1.5 text-left text-[clamp(10px,0.677vw,12px)] font-medium text-foreground hover:bg-[#DCDEDD]"
                                    onClick={() => {
                                        if (file.href) window.open(file.href, "_blank", "noopener,noreferrer");
                                    }}
                                >
                                    <Upload className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                    <span className="min-w-0 truncate">{file.name}</span>
                                </button>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="default"
                            className="h-8 shrink-0 gap-2 bg-[#122130] px-2 text-xs text-white hover:bg-[#122130]/90 sm:h-8 sm:text-xs font-normal"
                            onClick={handleDownloadAttachments}
                        >
                            <Download className="size-4 shrink-0" aria-hidden />
                            Download Attachments
                        </Button>
                    </div>
                </div>

                <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0 border-t border-dotted border-[#C4C4C4] pt-[clamp(10px,0.833vw,16px)]">
                    <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Packaging Preferences</p>
                    <div className="rounded-[5px] bg-[#E8E9E8] p-[clamp(10px,0.625vw,12px)]">
                        <p className="text-[clamp(11px,0.677vw,13px)] leading-relaxed text-foreground">
                            {data.packagingPreferences}
                        </p>
                    </div>
                </div>

                <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0 border-t border-dotted border-[#C4C4C4] pt-[clamp(10px,0.833vw,16px)]">
                    <div className="mb-2 flex flex-col gap-2">
                        <p className="text-[clamp(12px,0.729vw,14px)] font-medium">Requirement</p>
                        <div className="h-px w-full border-t border-dotted border-[#C4C4C4]" aria-hidden />
                    </div>
                    <div className="overflow-x-auto rounded-[5px] bg-[#E8E9E8]">
                        <table className="w-full min-w-[28rem] border-collapse text-[clamp(10px,0.677vw,13px)]">
                            <thead>
                                <tr className="border-b border-border/60 bg-[#E8E9E8]">
                                    <th className="px-2 py-2 text-left font-medium">Product</th>
                                    <th className="px-2 py-2 text-left font-medium">SKU</th>
                                    <th className="px-2 py-2 text-left font-medium">Quantity</th>
                                    <th className="px-2 py-2 text-left font-medium">Price</th>
                                    <th className="px-2 py-2 text-right font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lines.length === 0 ? (
                                    <tr className="bg-white">
                                        <td
                                            colSpan={5}
                                            className="px-3 py-6 text-center text-[clamp(11px,0.677vw,13px)] text-muted-foreground"
                                        >
                                            No product lines for this order.
                                        </td>
                                    </tr>
                                ) : (
                                    data.lines.map((line, index) => (
                                        <tr
                                            key={`${line.sku ?? line.product}-${index}`}
                                            className="border-b border-border/40 bg-white last:border-b-0"
                                        >
                                            <td className="max-w-[40%] break-words px-2 py-2 align-top font-semibold text-foreground sm:max-w-none">
                                                {line.product}
                                            </td>
                                            <td className="px-2 py-2 align-top font-normal">{line.sku ?? "—"}</td>
                                            <td className="px-2 py-2 align-top font-normal">{line.quantity}</td>
                                            <td className="px-2 py-2 align-top font-normal">{line.price}</td>
                                            <td className="px-2 py-2 text-right align-top font-normal">{line.total}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-[#E8E9E8] font-semibold">
                                    <td colSpan={4} className="px-2 py-2 text-right">
                                        TOTAL
                                    </td>
                                    <td className="px-2 py-2 text-right">{requirementFooterTotal}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0 border-t border-dotted border-[#C4C4C4] pt-[clamp(10px,0.833vw,16px)]">
                    <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Update Customization Status</p>
                    <Select
                        value={newStatus}
                        onValueChange={(value) => setNewStatus(value as CustomizationStatusValue)}
                    >
                        <SelectTrigger className="h-10 w-full max-w-full rounded-[5px] border border-border bg-[#E8E9E8] px-3 text-left text-[clamp(11px,0.677vw,13px)] text-foreground shadow-none">
                            <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                            {CUSTOM_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mt-[clamp(10px,0.833vw,16px)] shrink-0">
                    <p className="mb-1.5 text-[clamp(12px,0.729vw,14px)] font-medium">Admin Notes</p>
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this status update"
                        rows={4}
                        className="w-full resize-y rounded-[5px] border border-border bg-[#E8E9E8] px-3 py-2 text-[clamp(11px,0.677vw,13px)] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <div className="shrink-0 border-t border-[#E8E9E8] px-3 py-2 sm:px-[min(1.25vw,24px)] sm:py-[clamp(12px,0.833vw,16px)]">
                <Button
                    type="button"
                    disabled={!hasSelectedNewStatus}
                    className={cn(
                        "h-10 w-full rounded-[5px] text-sm font-medium text-white min-[1920px]:h-11",
                        hasSelectedNewStatus
                            ? "bg-[#122130] hover:bg-[#122130]/90"
                            : "bg-[#C8C8C8] hover:bg-[#C8C8C8]"
                    )}
                    onClick={() => {
                        if (!hasSelectedNewStatus || newStatus === undefined) return;
                        const label =
                            CUSTOM_STATUS_OPTIONS.find((o) => o.value === newStatus)?.label ?? newStatus;
                        onUpdateStatus?.({
                            data,
                            newStatus: label,
                            adminNotes: adminNotes.trim(),
                        });
                        toast.success("Customization status updated", {
                            description: `Set to “${label}”.`,
                        });
                        onOpenChange(false);
                    }}
                >
                    Update Status
                </Button>
            </div>
        </>
    );
}

export function CustomOrderDetailsModal({
    open,
    onOpenChange,
    data,
    onUpdateStatus,
}: CustomOrderDetailsModalProps) {
    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={
                    "!flex !max-w-none flex-col !gap-0 overflow-hidden rounded-[5px] !p-0 " +
                    "!left-1/2 !top-1/2 !h-[min(43.3333vw,832px,calc(100dvh-2*clamp(12px,1.25vw,24px)))] " +
                    "!w-[min(45.3646vw,871px,calc(100vw-2*clamp(12px,1.25vw,24px)))] !max-h-[calc(100dvh-2*clamp(12px,1.25vw,24px))] " +
                    "!-translate-x-1/2 !-translate-y-1/2 " +
                    "min-[1920px]:!left-[min(27.2917vw,524px)] min-[1920px]:!top-[min(6.4583vw,124px)] min-[1920px]:!h-[min(43.3333vw,832px)] " +
                    "min-[1920px]:!w-[min(45.3646vw,871px)] min-[1920px]:!translate-x-0 min-[1920px]:!translate-y-0"
                }
            >
                <CustomOrderDetailsModalInner
                    key={`${data.orderId}-${open}`}
                    data={data}
                    onOpenChange={onOpenChange}
                    onUpdateStatus={onUpdateStatus}
                />
            </DialogContent>
        </Dialog>
    );
}
