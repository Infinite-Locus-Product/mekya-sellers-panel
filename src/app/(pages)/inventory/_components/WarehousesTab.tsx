"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ApiWarehouse } from "@/lib/api/warehouses";
import { RegisterWarehouseModal } from "./RegisterWarehouseModal";
import { WarehouseZonesModal } from "./WarehouseZonesModal";
import {
    FULFILLMENT_MODEL_LABEL,
    WAREHOUSE_STATUS_LABEL,
    WAREHOUSE_STATUS_VARIANT,
    formatWarehouseAddress,
} from "./warehouseStatus";

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export interface WarehousesTabProps {
    readonly warehouses: ApiWarehouse[];
    readonly loading: boolean;
    readonly onChanged: () => void;
}

export function WarehousesTab({ warehouses, loading, onChanged }: Readonly<WarehousesTabProps>) {
    const router = useRouter();
    const [registerOpen, setRegisterOpen] = useState(false);
    const [zonesWarehouse, setZonesWarehouse] = useState<ApiWarehouse | null>(null);

    const columns: TableColumn<ApiWarehouse>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Warehouse",
                cell: (row) => (
                    <div>
                        <p className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">{row.name}</p>
                        <p className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                            {formatWarehouseAddress(row.address)}
                        </p>
                    </div>
                ),
            },
            {
                key: "fulfillment_model",
                header: "Fulfillment Model",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {FULFILLMENT_MODEL_LABEL[row.fulfillment_model]}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                cell: (row) => (
                    <div>
                        <StatusBadge variant={WAREHOUSE_STATUS_VARIANT[row.status]} className="w-auto px-3">
                            {WAREHOUSE_STATUS_LABEL[row.status]}
                        </StatusBadge>
                        {row.status === "rejected" && row.rejection_reason ? (
                            <p className="mt-1 text-[11px] text-destructive">{row.rejection_reason}</p>
                        ) : null}
                        {row.status === "pending_approval" ? (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                {row.dry_run_completed_at
                                    ? "Dry run complete"
                                    : `${row.dry_run_orders_required} dry-run order(s) required`}
                            </p>
                        ) : null}
                    </div>
                ),
            },
            {
                key: "created_at",
                header: "Registered",
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {formatDate(row.created_at)}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => router.push(`/inventory/${row.id}`)}
                        >
                            View
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setZonesWarehouse(row)}
                        >
                            Manage zones
                        </Button>
                    </div>
                ),
            },
        ],
        [router]
    );

    return (
        <div className="space-y-3">
            <RegisterWarehouseModal open={registerOpen} onOpenChange={setRegisterOpen} onRegistered={onChanged} />
            {zonesWarehouse ? (
                <WarehouseZonesModal
                    open={Boolean(zonesWarehouse)}
                    onOpenChange={(open) => {
                        if (!open) setZonesWarehouse(null);
                    }}
                    warehouseId={zonesWarehouse.id}
                    warehouseName={zonesWarehouse.name}
                />
            ) : null}

            <div className="flex justify-end">
                <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setRegisterOpen(true)}
                >
                    <Plus className="size-3.5" aria-hidden />
                    Register warehouse
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={warehouses}
                    striped
                    emptyMessage="No warehouses registered yet."
                />
            )}
        </div>
    );
}
