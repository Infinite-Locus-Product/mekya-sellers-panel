"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Boxes, Loader2, Search } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { TableSortIcon } from "@/assets/icons/shared";
import { cn } from "@/lib/utils";
import {
    getWarehouse,
    getWarehouseInventory,
    updateWarehouseInventory,
    type ApiWarehouse,
    type WarehouseInventoryItem,
    type WarehouseInventorySortBy,
    type WarehouseInventorySortOrder,
    type WarehouseInventoryStockStatus,
    type WarehouseInventorySummary,
} from "@/lib/api/warehouses";
import {
    FULFILLMENT_MODEL_LABEL,
    WAREHOUSE_STATUS_LABEL,
    WAREHOUSE_STATUS_VARIANT,
    formatWarehouseAddress,
} from "../_components/warehouseStatus";

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const KPI_OPTIONS: Array<{ value: WarehouseInventoryStockStatus; label: string; count: (s: WarehouseInventorySummary) => number }> = [
    { value: "all", label: "Total SKUs", count: (s) => s.total_skus },
    { value: "in_stock", label: "In Stock", count: (s) => s.in_stock },
    { value: "out_of_stock", label: "Out of Stock", count: (s) => s.out_of_stock },
];

export interface WarehouseDetailClientProps {
    readonly warehouseId: string;
}

export function WarehouseDetailClient({ warehouseId }: Readonly<WarehouseDetailClientProps>) {
    const [warehouse, setWarehouse] = useState<ApiWarehouse | null>(null);
    const [loadingWarehouse, setLoadingWarehouse] = useState(true);

    const [items, setItems] = useState<WarehouseInventoryItem[]>([]);
    const [summary, setSummary] = useState<WarehouseInventorySummary | null>(null);
    const [stockStatus, setStockStatus] = useState<WarehouseInventoryStockStatus>("all");
    const [sortBy, setSortBy] = useState<WarehouseInventorySortBy>("sku");
    const [sortOrder, setSortOrder] = useState<WarehouseInventorySortOrder>("asc");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [edits, setEdits] = useState<Record<string, string>>({});
    const [loadingInventory, setLoadingInventory] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        let cancelled = false;
        setLoadingWarehouse(true);
        getWarehouse(warehouseId)
            .then((result) => {
                if (!cancelled) setWarehouse(result);
            })
            .catch(() => {
                if (!cancelled) toast.error("Could not load warehouse details");
            })
            .finally(() => {
                if (!cancelled) setLoadingWarehouse(false);
            });
        return () => {
            cancelled = true;
        };
    }, [warehouseId]);

    useEffect(() => {
        let cancelled = false;
        setLoadingInventory(true);
        getWarehouseInventory(warehouseId, {
            stock_status: stockStatus,
            sort_by: sortBy,
            sort_order: sortOrder,
            search: debouncedSearch.trim() || undefined,
        })
            .then((result) => {
                if (cancelled) return;
                setItems(result.inventory);
                setSummary(result.summary);
                setEdits({});
            })
            .catch(() => {
                if (!cancelled) toast.error("Could not load warehouse inventory");
            })
            .finally(() => {
                if (!cancelled) setLoadingInventory(false);
            });
        return () => {
            cancelled = true;
        };
    }, [warehouseId, stockStatus, sortBy, sortOrder, debouncedSearch]);

    const toggleSort = (column: WarehouseInventorySortBy) => {
        if (sortBy === column) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const dirtyRows = useMemo(
        () =>
            items
                .filter((item) => {
                    const edited = edits[item.sku];
                    return edited !== undefined && edited.trim() !== "" && Number(edited) !== item.quantity;
                })
                .map((item) => ({ sku: item.sku, new_quantity: Number(edits[item.sku]) })),
        [items, edits],
    );

    // Server-driven sort (sort_by/sort_order query params) — mirrors DataTable's own
    // sortable-header button classes so it's visually identical, but wired to our own state.
    const sortHeader = (key: WarehouseInventorySortBy, label: string) => {
        const sortState = sortBy === key ? sortOrder : "none";
        return (
            <button
                type="button"
                onClick={() => toggleSort(key)}
                className="-my-1 inline-flex w-full min-w-0 items-center gap-1 rounded-sm px-0.5 py-0.5 text-foreground transition-colors hover:bg-black/[0.06] hover:text-foreground min-[1920px]:gap-2 min-[1920px]:py-1"
            >
                <span className="min-w-0">{label}</span>
                <TableSortIcon state={sortState} className="size-2.5 shrink-0 sm:size-3 min-[1920px]:size-3.5" />
            </button>
        );
    };

    const columns: TableColumn<WarehouseInventoryItem>[] = useMemo(
        () => [
            {
                key: "sku",
                header: sortHeader("sku", "SKU"),
                cell: (row) => (
                    <span className="truncate text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.sku}
                    </span>
                ),
            },
            {
                key: "product_name",
                header: sortHeader("product_name", "Product"),
                cell: (row) => (
                    <span className="truncate text-[11px] font-normal text-muted-foreground min-[1920px]:text-sm">
                        {row.product_name}
                        {row.variant_name ? ` — ${row.variant_name}` : ""}
                    </span>
                ),
            },
            {
                key: "quantity",
                header: sortHeader("quantity", "Qty here"),
                cell: (row) => {
                    const value = edits[row.sku] ?? String(row.quantity);
                    const isDirty = dirtyRows.some((r) => r.sku === row.sku);
                    return (
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            value={value}
                            onChange={(e) => setEdits((prev) => ({ ...prev, [row.sku]: e.target.value }))}
                            className={`h-8 w-28 text-sm text-muted-foreground ${isDirty ? "border-amber-500 focus-visible:ring-amber-500" : ""}`}
                        />
                    );
                },
            },
            {
                key: "total_quantity",
                header: sortHeader("total_quantity", "Total qty"),
                cell: (row) => (
                    <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        {row.total_quantity}
                    </span>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sortBy, sortOrder, edits, dirtyRows],
    );

    const invalidEdit = Object.entries(edits).some(([, value]) => {
        if (value.trim() === "") return false;
        const num = Number(value);
        return !Number.isFinite(num) || num < 0 || !Number.isInteger(num);
    });

    const save = async () => {
        if (invalidEdit) {
            toast.error("Quantities must be whole numbers of 0 or more");
            return;
        }
        if (dirtyRows.length === 0) {
            toast.error("No quantity changes to save");
            return;
        }
        setIsSaving(true);
        try {
            const res = await updateWarehouseInventory(
                warehouseId,
                dirtyRows.map((row) => ({ sku_id: row.sku, new_quantity: row.new_quantity })),
            );
            if (res.failed > 0) {
                toast.error(`${res.applied} updated, ${res.failed} failed`, {
                    description: res.errors.length > 0 ? JSON.stringify(res.errors[0]) : undefined,
                });
            } else {
                toast.success(`Updated ${res.applied} SKU${res.applied === 1 ? "" : "s"}`);
            }
            setItems((prev) =>
                prev.map((item) => {
                    const match = dirtyRows.find((row) => row.sku === item.sku);
                    return match ? { ...item, quantity: match.new_quantity } : item;
                }),
            );
            setEdits({});
        } catch (err) {
            toast.error("Could not update inventory", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-w-0 max-w-full space-y-3 min-[1920px]:space-y-4">
            <Breadcrumb
                items={[
                    { label: "Seller Dashboard", href: "/" },
                    { label: "Warehouse", href: "/inventory" },
                    { label: warehouse?.name ?? "Warehouse details" },
                ]}
            />

            <div className="space-y-1.5">
                <h1 className="text-base font-semibold text-foreground xl:text-lg min-[1920px]:text-2xl">
                    {warehouse?.name ?? "Warehouse details"}
                </h1>
                <p className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                    Warehouse details and SKU-level stock at this location.
                </p>
            </div>

            <Card className="min-w-0 overflow-hidden">
                <CardContent className="min-w-0 space-y-3 bg-[#F9FAF9] px-3 py-3 min-[1920px]:px-6 min-[1920px]:py-4">
                    {loadingWarehouse ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !warehouse ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                            Could not load this warehouse.
                        </p>
                    ) : (
                        <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1fr] min-[1920px]:text-sm">
                            <div>
                                <dt className="text-muted-foreground">Address</dt>
                                <dd className="mt-0.5 font-medium text-foreground">
                                    {formatWarehouseAddress(warehouse.address)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Fulfillment model</dt>
                                <dd className="mt-0.5 font-medium text-foreground">
                                    {FULFILLMENT_MODEL_LABEL[warehouse.fulfillment_model]}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="mt-1">
                                    <StatusBadge
                                        variant={WAREHOUSE_STATUS_VARIANT[warehouse.status]}
                                        className="w-auto px-3"
                                    >
                                        {WAREHOUSE_STATUS_LABEL[warehouse.status]}
                                    </StatusBadge>
                                    {warehouse.status === "rejected" && warehouse.rejection_reason ? (
                                        <p className="mt-1 text-[11px] text-destructive">
                                            {warehouse.rejection_reason}
                                        </p>
                                    ) : null}
                                    {warehouse.status === "pending_approval" ? (
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            {warehouse.dry_run_completed_at
                                                ? "Dry run complete"
                                                : `${warehouse.dry_run_orders_required} dry-run order(s) required`}
                                        </p>
                                    ) : null}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Registered</dt>
                                <dd className="mt-0.5 font-medium text-foreground">
                                    {formatDate(warehouse.created_at)}
                                </dd>
                            </div>
                        </dl>
                    )}
                </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
                <CardContent className="min-w-0 bg-[#F9FAF9] px-3 py-3 min-[1920px]:px-6 min-[1920px]:py-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground min-[1920px]:text-base">
                            <Boxes className="size-4 shrink-0 text-muted-foreground min-[1920px]:size-5" aria-hidden />
                            SKU Inventory
                        </h2>
                    </div>

                    <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-center">
                        <div className="relative h-8 w-full min-w-0 min-[1920px]:h-10 lg:w-[448px] lg:shrink-0">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground min-[1920px]:left-3 min-[1920px]:size-4" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search product or SKU"
                                className="box-border h-full w-full min-w-0 rounded-[4px] border border-input bg-[#E8E9E8] py-0 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[1920px]:pl-10 min-[1920px]:pr-2 min-[1920px]:text-sm"
                                aria-label="Search inventory by product or SKU"
                            />
                        </div>

                        <div
                            role="radiogroup"
                            aria-label="Filter by stock status"
                            className="flex flex-wrap items-center gap-1.5"
                        >
                            {KPI_OPTIONS.map((opt) => {
                                const selected = stockStatus === opt.value;
                                return (
                                    <label
                                        key={opt.value}
                                        className={cn(
                                            "flex h-8 w-[154px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 transition-colors min-[1920px]:h-10",
                                            selected
                                                ? "border-[#E8E9E8] bg-[#E8E9E8]"
                                                : "border-[#E8E9E8] bg-white hover:bg-[#F2F2F2]",
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="stock_status"
                                            className="size-3 shrink-0 accent-black"
                                            checked={selected}
                                            onChange={() => setStockStatus(opt.value)}
                                        />
                                        <span className="truncate text-[11px] text-muted-foreground">{opt.label}</span>
                                        <span className="ml-auto shrink-0 text-sm font-semibold text-foreground">
                                            {summary ? opt.count(summary) : "—"}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2 lg:ml-auto">
                            <p className="text-[11px] text-muted-foreground">
                                {dirtyRows.length > 0
                                    ? `${dirtyRows.length} unsaved change${dirtyRows.length === 1 ? "" : "s"}`
                                    : ""}
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                className="h-8 text-xs min-[1920px]:h-10"
                                disabled={isSaving || loadingInventory || dirtyRows.length === 0}
                                onClick={save}
                            >
                                {isSaving ? "Saving…" : "Save changes"}
                            </Button>
                        </div>
                    </div>

                    {loadingInventory ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={items}
                            striped
                            emptyMessage="No SKUs match this filter."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
