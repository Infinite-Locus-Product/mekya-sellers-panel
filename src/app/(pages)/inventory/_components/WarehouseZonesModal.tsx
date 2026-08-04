"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getServiceableZones, putServiceableZones, type ServiceableZoneInput } from "@/lib/api/warehouses";

interface ZoneRow extends ServiceableZoneInput {
    key: number;
}

let nextKey = 0;
function emptyRow(): ZoneRow {
    nextKey += 1;
    return { key: nextKey, pincode_start: "", pincode_end: "", sla_days: 5 };
}

export interface WarehouseZonesModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly warehouseId: string;
    readonly warehouseName: string;
}

/** Full-replace editor for a warehouse's serviceable pincode zones (GET/PUT .../serviceable-zones). */
export function WarehouseZonesModal({
    open,
    onOpenChange,
    warehouseId,
    warehouseName,
}: Readonly<WarehouseZonesModalProps>) {
    const [rows, setRows] = useState<ZoneRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setIsLoading(true);
        getServiceableZones(warehouseId)
            .then((zones) => {
                if (cancelled) return;
                setRows(
                    zones.length > 0
                        ? zones.map((z) => {
                              nextKey += 1;
                              return { key: nextKey, pincode_start: z.pincode_start, pincode_end: z.pincode_end, sla_days: z.sla_days };
                          })
                        : [emptyRow()],
                );
            })
            .catch(() => {
                if (!cancelled) toast.error("Could not load serviceable zones");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, warehouseId]);

    const updateRow = (key: number, patch: Partial<ServiceableZoneInput>) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    };

    const removeRow = (key: number) => {
        setRows((prev) => prev.filter((r) => r.key !== key));
    };

    const save = async () => {
        const cleaned = rows.filter((r) => r.pincode_start.trim() && r.pincode_end.trim());
        const invalid = cleaned.find(
            (r) => r.pincode_start.trim().length !== 6 || r.pincode_end.trim().length !== 6 || r.sla_days < 1 || r.sla_days > 30,
        );
        if (invalid) {
            toast.error("Each zone needs 6-digit pincodes and an SLA between 1 and 30 days");
            return;
        }
        setIsSaving(true);
        try {
            await putServiceableZones(
                warehouseId,
                cleaned.map((r) => ({ pincode_start: r.pincode_start.trim(), pincode_end: r.pincode_end.trim(), sla_days: r.sla_days })),
            );
            toast.success("Serviceable zones updated");
            onOpenChange(false);
        } catch (err) {
            toast.error("Could not update zones", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Serviceable zones — {warehouseName}</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Loading zones…
                    </div>
                ) : (
                    <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                        <div className="grid grid-cols-[1fr_1fr_5rem_2rem] gap-2 text-xs font-medium text-muted-foreground">
                            <span>Pincode start</span>
                            <span>Pincode end</span>
                            <span>SLA (days)</span>
                            <span />
                        </div>
                        {rows.map((row) => (
                            <div key={row.key} className="grid grid-cols-[1fr_1fr_5rem_2rem] items-center gap-2">
                                <Input
                                    placeholder="400001"
                                    value={row.pincode_start}
                                    onChange={(e) => updateRow(row.key, { pincode_start: e.target.value })}
                                    className="h-8 text-sm"
                                />
                                <Input
                                    placeholder="400099"
                                    value={row.pincode_end}
                                    onChange={(e) => updateRow(row.key, { pincode_end: e.target.value })}
                                    className="h-8 text-sm"
                                />
                                <Input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={row.sla_days}
                                    onChange={(e) => updateRow(row.key, { sla_days: Number(e.target.value) || 1 })}
                                    className="h-8 text-sm"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-8"
                                    onClick={() => removeRow(row.key)}
                                    aria-label="Remove zone"
                                >
                                    <Trash2 className="size-4" aria-hidden />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => setRows((prev) => [...prev, emptyRow()])}
                        >
                            <Plus className="size-3.5" aria-hidden />
                            Add zone
                        </Button>
                    </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="button" size="sm" disabled={isSaving || isLoading} onClick={save}>
                        {isSaving ? "Saving…" : "Save zones"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
