"use client";

import { ReturnDetailsModal } from "@/app/(pages)/order-management/_components/ReturnDetailsModal";
import { CustomOrderDetailsModal } from "@/app/(pages)/order-management/_components/CustomOrderDetailsModal";
import type { ReturnDetailsData } from "@/app/(pages)/order-management/_components/ReturnDetailsModal";
import type { CustomOrderDetailsData } from "@/app/(pages)/order-management/_components/CustomOrderDetailsModal";

export interface SegmentOrderModalsProps {
    readonly returnDetailsOpen: boolean;
    readonly onReturnDetailsOpenChange: (open: boolean) => void;
    readonly returnDetailsData: ReturnDetailsData | null;
    readonly customOrderDetailsOpen: boolean;
    readonly onCustomOrderDetailsOpenChange: (open: boolean) => void;
    readonly customOrderDetailsData: CustomOrderDetailsData | null;
}

export function SegmentOrderModals({
    returnDetailsOpen,
    onReturnDetailsOpenChange,
    returnDetailsData,
    customOrderDetailsOpen,
    onCustomOrderDetailsOpenChange,
    customOrderDetailsData,
}: Readonly<SegmentOrderModalsProps>) {
    return (
        <>
            <ReturnDetailsModal
                open={returnDetailsOpen}
                onOpenChange={onReturnDetailsOpenChange}
                data={returnDetailsData}
            />
            <CustomOrderDetailsModal
                open={customOrderDetailsOpen}
                onOpenChange={onCustomOrderDetailsOpenChange}
                data={customOrderDetailsData}
            />
        </>
    );
}
