"use client";

import { useCallback, useEffect, useState } from "react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { listWarehouses, type ApiWarehouse } from "@/lib/api/warehouses";
import { WarehousesTab } from "./_components/WarehousesTab";

export function InventoryClient() {
    const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([]);
    const [loadingWarehouses, setLoadingWarehouses] = useState(true);
    const [warehousesRefreshToken, setWarehousesRefreshToken] = useState(0);

    const refreshWarehouses = useCallback(() => setWarehousesRefreshToken((t) => t + 1), []);

    useEffect(() => {
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoadingWarehouses(true);
        });
        listWarehouses()
            .then((result) => {
                if (!cancelled) setWarehouses(result);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingWarehouses(false);
            });
        return () => {
            cancelled = true;
        };
    }, [warehousesRefreshToken]);

    return (
        <div className="min-w-0 max-w-full space-y-3 min-[1920px]:space-y-4">
            <Breadcrumb
                items={[
                    { label: "Seller Dashboard", href: "/" },
                    { label: "Warehouse" },
                ]}
            />

            <div className="flex min-w-0 flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                    <h1 className="text-base font-semibold text-foreground xl:text-lg min-[1920px]:text-2xl">
                        Warehouse
                    </h1>
                    <p className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                        Manage your warehouses and serviceable zones.
                    </p>
                </div>
            </div>

            <Card className="min-w-0 overflow-hidden">
                <CardContent className="min-w-0 bg-[#F9FAF9] px-1.5 pt-2 sm:px-3 sm:pt-3 lg:px-4 min-[1920px]:px-6">
                    <WarehousesTab
                        warehouses={warehouses}
                        loading={loadingWarehouses}
                        onChanged={refreshWarehouses}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
