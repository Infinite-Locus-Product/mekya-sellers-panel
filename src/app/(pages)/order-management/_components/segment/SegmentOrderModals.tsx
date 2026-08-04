"use client";

import { ReturnDetailsModal } from "@/app/(pages)/order-management/_components/ReturnDetailsModal";
import type {
    AddTrackingPayload,
    ConfirmDefectivePayload,
    QcFailPayload,
    QcPassPayload,
    RejectPayload,
    ReturnDetailsData,
    ShipBackPayload,
} from "@/app/(pages)/order-management/_components/ReturnDetailsModal";

export interface SegmentOrderModalsProps {
    readonly returnDetailsOpen: boolean;
    readonly onReturnDetailsOpenChange: (open: boolean) => void;
    readonly returnDetailsData: ReturnDetailsData | null;
    readonly onApproveRequestReturn: (returnId: string) => Promise<void>;
    readonly onAddTrackingReturn: (payload: AddTrackingPayload) => Promise<void>;
    readonly onReceiveReturn: (returnId: string) => Promise<void>;
    readonly onQcPassReturn: (payload: QcPassPayload) => Promise<void>;
    readonly onQcFailReturn: (payload: QcFailPayload) => Promise<void>;
    readonly onConfirmDefectiveReturn: (payload: ConfirmDefectivePayload) => Promise<void>;
    readonly onRejectReturn: (payload: RejectPayload) => Promise<void>;
    readonly onShipBackReturn: (payload: ShipBackPayload) => Promise<void>;
}

export function SegmentOrderModals({
    returnDetailsOpen,
    onReturnDetailsOpenChange,
    returnDetailsData,
    onApproveRequestReturn,
    onAddTrackingReturn,
    onReceiveReturn,
    onQcPassReturn,
    onQcFailReturn,
    onConfirmDefectiveReturn,
    onRejectReturn,
    onShipBackReturn,
}: Readonly<SegmentOrderModalsProps>) {
    return (
        <ReturnDetailsModal
            open={returnDetailsOpen}
            onOpenChange={onReturnDetailsOpenChange}
            data={returnDetailsData}
            onApproveRequest={onApproveRequestReturn}
            onAddTracking={onAddTrackingReturn}
            onMarkReceived={onReceiveReturn}
            onQcPass={onQcPassReturn}
            onQcFail={onQcFailReturn}
            onConfirmDefective={onConfirmDefectiveReturn}
            onReject={onRejectReturn}
            onShipBack={onShipBackReturn}
        />
    );
}
