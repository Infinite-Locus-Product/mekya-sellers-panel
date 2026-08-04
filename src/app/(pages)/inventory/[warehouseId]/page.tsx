import { Suspense } from "react";
import { WarehouseDetailClient } from "./WarehouseDetailClient";

interface WarehouseDetailPageProps {
    params: Promise<{ warehouseId: string }>;
}

export default async function WarehouseDetailPage({ params }: Readonly<WarehouseDetailPageProps>) {
    const { warehouseId } = await params;
    return (
        <Suspense fallback={null}>
            <WarehouseDetailClient warehouseId={warehouseId} />
        </Suspense>
    );
}
