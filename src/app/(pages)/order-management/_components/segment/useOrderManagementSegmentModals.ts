"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import type { AllOrder, ReturnStatus } from "@/lib/tableTypes";
import type {
    AddTrackingPayload,
    ConfirmDefectivePayload,
    QcFailPayload,
    QcPassPayload,
    RejectPayload,
    ReturnDetailsData,
    ShipBackPayload,
} from "@/app/(pages)/order-management/_components/ReturnDetailsModal";
import {
    addCustomOrderNote,
    addReturnTracking,
    approveCustomOrderRequest,
    approveReturnRequest,
    buyerConfirmCustomOrderRequest,
    confirmDefectiveReturn,
    deleteCustomOrderNote,
    editCustomOrderNote,
    getCustomOrderRequestDetail,
    getReturnDetails,
    qcFailReturn,
    qcPassReturn,
    receiveReturn,
    rejectCustomOrderRequest,
    rejectReturn,
    shipBackReturn,
    type ReturnDetailResponse,
} from "@/lib/api/orders";
import { formatMoney } from "@/lib/utils";
import {
    mapApiCustomOrderRequestDetail,
    type CustomOrderRequestDetail,
} from "./customOrderTypes";

const RETURN_STATUS_MAP: Record<string, ReturnStatus> = {
    pending: "Pending",
    approved: "Approved",
    received: "Received",
    qc_pass_defect_check: "Defect Check",
    qc_passed: "QC Passed",
    qc_failed: "QC Failed",
    qc_fail_shipped: "Shipped Back",
    rejected: "Rejected",
};

function mapReturnDetailToData(r: ReturnDetailResponse): ReturnDetailsData {
    return {
        returnId: r.return_id,
        orderNumber: r.saleor_order_number,
        vendor: r.customer_name ?? "—",
        // Prefer the return's own request_date; events (when that's absent) are newest-first, so
        // the creation event is the last one, not the first.
        requestDate: r.request_date ?? r.events?.[r.events.length - 1]?.date,
        linesTotal: formatMoney({ amount: r.lines_total ?? 0, currency: "INR" }),
        requestType: r.request_type,
        status: RETURN_STATUS_MAP[r.status] ?? "Pending",
        reasonCode: r.reason_code,
        reasonDetails: r.reason_details ?? undefined,
        canApproveRequest: r.can_approve_request,
        canReject: r.can_reject,
        canAddTracking: r.can_add_tracking,
        canMarkReceived: r.can_mark_received,
        canQcPass: r.can_pass_qc,
        canQcFail: r.can_fail_qc,
        canConfirmDefective: r.can_confirm_defective,
        canConfirmNotDefective: r.can_confirm_not_defective,
        canShipBack: r.can_ship_back,
        items: (r.lines ?? []).map((line) => ({
            orderLineId: line.order_line_id,
            product: line.product_name,
            sku: line.sku,
            quantity: line.quantity,
            resolutionStatus: line.resolution_status,
        })),
        rejectionReason: r.rejection_reason,
        refundReference: r.refund_reference,
        exchangeOrderId: r.exchange_order_id,
        qcFailureReason: r.qc_failure_reason,
        returnTrackingNumber: r.return_tracking_number,
        reshipTrackingNumber: r.reship_tracking_number,
    };
}

export interface UseOrderManagementSegmentModalsReturn {
    returnDetailsOpen: boolean;
    setReturnDetailsOpen: (open: boolean) => void;
    returnDetailsData: ReturnDetailsData | null;
    setReturnDetailsData: Dispatch<SetStateAction<ReturnDetailsData | null>>;
    customOrderDetailsOpen: boolean;
    setCustomOrderDetailsOpen: (open: boolean) => void;
    customOrderDetailsData: CustomOrderRequestDetail | null;
    isCustomOrderDetailsLoading: boolean;
    openCustomOrderDetails: (customOrderId: string) => void;
    openReturnDetails: (order: AllOrder) => void;
    handleApproveCustomOrderRequest: (customOrderId: string) => Promise<void>;
    handleRejectCustomOrderRequest: (payload: { customOrderId: string; reason: string }) => Promise<void>;
    handleBuyerConfirmCustomOrderRequest: (customOrderId: string) => Promise<void>;
    handleAddCustomOrderNote: (payload: { customOrderId: string; body: string }) => Promise<void>;
    handleEditCustomOrderNote: (payload: { customOrderId: string; noteId: string; body: string }) => Promise<void>;
    handleDeleteCustomOrderNote: (payload: { customOrderId: string; noteId: string }) => Promise<void>;
    handleApproveRequestReturn: (returnId: string) => Promise<void>;
    handleAddTrackingReturn: (payload: AddTrackingPayload) => Promise<void>;
    handleReceiveReturn: (returnId: string) => Promise<void>;
    handleQcPassReturn: (payload: QcPassPayload) => Promise<void>;
    handleQcFailReturn: (payload: QcFailPayload) => Promise<void>;
    handleConfirmDefectiveReturn: (payload: ConfirmDefectivePayload) => Promise<void>;
    handleRejectReturn: (payload: RejectPayload) => Promise<void>;
    handleShipBackReturn: (payload: ShipBackPayload) => Promise<void>;
}

export function useOrderManagementSegmentModals(options?: {
    /** Called after a status change succeeds, so the caller can refresh the custom-orders list/KPIs. */
    onCustomOrderChanged?: () => void;
    /** Called after a return/exchange lifecycle action succeeds, so the caller can refresh the returns list. */
    onReturnChanged?: () => void;
}): UseOrderManagementSegmentModalsReturn {
    const { onCustomOrderChanged, onReturnChanged } = options ?? {};

    const [returnDetailsOpen, setReturnDetailsOpen] = useState(false);
    const [returnDetailsData, setReturnDetailsData] = useState<ReturnDetailsData | null>(null);
    const [customOrderDetailsOpen, setCustomOrderDetailsOpen] = useState(false);
    const [customOrderDetailsData, setCustomOrderDetailsData] = useState<CustomOrderRequestDetail | null>(null);
    const [isCustomOrderDetailsLoading, setIsCustomOrderDetailsLoading] = useState(false);

    const fetchCustomOrderDetail = useCallback((id: string) => {
        setIsCustomOrderDetailsLoading(true);
        getCustomOrderRequestDetail(id)
            .then((detail) => setCustomOrderDetailsData(mapApiCustomOrderRequestDetail(detail)))
            .catch((err: unknown) => {
                toast.error("Failed to load custom order", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
                setCustomOrderDetailsOpen(false);
            })
            .finally(() => setIsCustomOrderDetailsLoading(false));
    }, []);

    const openCustomOrderDetails = useCallback(
        (customOrderId: string) => {
            setReturnDetailsOpen(false);
            setReturnDetailsData(null);
            setCustomOrderDetailsData(null);
            setCustomOrderDetailsOpen(true);
            fetchCustomOrderDetail(customOrderId);
        },
        [fetchCustomOrderDetail]
    );

    const handleApproveCustomOrderRequest = useCallback(
        async (customOrderId: string) => {
            try {
                await approveCustomOrderRequest(customOrderId);
                toast.success("Custom order approved — awaiting buyer confirmation");
                setCustomOrderDetailsOpen(false);
                onCustomOrderChanged?.();
            } catch (err) {
                toast.error("Could not approve custom order", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onCustomOrderChanged]
    );

    const handleRejectCustomOrderRequest = useCallback(
        async ({ customOrderId, reason }: { customOrderId: string; reason: string }) => {
            try {
                await rejectCustomOrderRequest(customOrderId, { reason });
                toast.success("Custom order rejected");
                setCustomOrderDetailsOpen(false);
                onCustomOrderChanged?.();
            } catch (err) {
                toast.error("Could not reject custom order", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onCustomOrderChanged]
    );

    const handleBuyerConfirmCustomOrderRequest = useCallback(
        async (customOrderId: string) => {
            try {
                await buyerConfirmCustomOrderRequest(customOrderId);
                toast.success("Buyer confirmed");
                setCustomOrderDetailsOpen(false);
                onCustomOrderChanged?.();
            } catch (err) {
                toast.error("Could not mark buyer confirmed", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onCustomOrderChanged]
    );

    const handleAddCustomOrderNote = useCallback(
        async ({ customOrderId, body }: { customOrderId: string; body: string }) => {
            try {
                await addCustomOrderNote(customOrderId, { body });
                fetchCustomOrderDetail(customOrderId);
            } catch (err) {
                toast.error("Could not add note", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [fetchCustomOrderDetail]
    );

    const handleEditCustomOrderNote = useCallback(
        async ({ customOrderId, noteId, body }: { customOrderId: string; noteId: string; body: string }) => {
            try {
                await editCustomOrderNote(customOrderId, noteId, { body });
                fetchCustomOrderDetail(customOrderId);
            } catch (err) {
                toast.error("Could not edit note", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [fetchCustomOrderDetail]
    );

    const handleDeleteCustomOrderNote = useCallback(
        async ({ customOrderId, noteId }: { customOrderId: string; noteId: string }) => {
            try {
                await deleteCustomOrderNote(customOrderId, noteId);
                toast.success("Note deleted");
                fetchCustomOrderDetail(customOrderId);
            } catch (err) {
                toast.error("Could not delete note", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [fetchCustomOrderDetail]
    );

    const openReturnDetails = useCallback((order: AllOrder) => {
        setCustomOrderDetailsOpen(false);
        setCustomOrderDetailsData(null);
        setReturnDetailsOpen(true);

        getReturnDetails(order.id)
            .then((r) => setReturnDetailsData(mapReturnDetailToData(r)))
            .catch(() => {
                setReturnDetailsOpen(false);
            });
    }, []);

    const handleApproveRequestReturn = useCallback(
        async (returnId: string) => {
            try {
                const r = await approveReturnRequest(returnId);
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("Return request approved");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not update return", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleAddTrackingReturn = useCallback(
        async ({ returnId, trackingNumber, courier }: AddTrackingPayload) => {
            try {
                const r = await addReturnTracking(returnId, { tracking_number: trackingNumber, courier });
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("Tracking saved");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not save tracking", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleConfirmDefectiveReturn = useCallback(
        async ({ returnId, isDefective }: ConfirmDefectivePayload) => {
            try {
                const r = await confirmDefectiveReturn(returnId, { is_defective: isDefective });
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success(isDefective ? "Confirmed defective" : "Confirmed not defective — restocked");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not confirm defect status", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleReceiveReturn = useCallback(
        async (returnId: string) => {
            try {
                const r = await receiveReturn(returnId);
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("Marked received at warehouse");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not update return", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleQcPassReturn = useCallback(
        async ({ returnId, note, refundAmount }: QcPassPayload) => {
            try {
                const r = await qcPassReturn(returnId, {
                    note,
                    refund_amount: refundAmount,
                });
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("QC passed — refund triggered");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not pass QC", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleQcFailReturn = useCallback(
        async ({ returnId, qcFailureReason }: QcFailPayload) => {
            try {
                const r = await qcFailReturn(returnId, { qc_failure_reason: qcFailureReason });
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("QC failed — item is being sent back to the customer");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not fail QC", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleRejectReturn = useCallback(
        async ({ returnId, note }: RejectPayload) => {
            try {
                const r = await rejectReturn(returnId, { note });
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("Return rejected");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not reject return", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    const handleShipBackReturn = useCallback(
        async ({ returnId, courier, contactPerson, contactPhone }: ShipBackPayload) => {
            try {
                const r = await shipBackReturn(returnId, {
                    courier,
                    contact_person: contactPerson,
                    contact_phone: contactPhone,
                });
                setReturnDetailsData(mapReturnDetailToData(r));
                toast.success("Ship back confirmed");
                onReturnChanged?.();
            } catch (err) {
                toast.error("Could not confirm ship back", {
                    description: err instanceof Error ? err.message : "Please try again.",
                });
            }
        },
        [onReturnChanged]
    );

    return {
        returnDetailsOpen,
        setReturnDetailsOpen,
        returnDetailsData,
        setReturnDetailsData,
        customOrderDetailsOpen,
        setCustomOrderDetailsOpen,
        customOrderDetailsData,
        isCustomOrderDetailsLoading,
        openCustomOrderDetails,
        openReturnDetails,
        handleApproveCustomOrderRequest,
        handleRejectCustomOrderRequest,
        handleBuyerConfirmCustomOrderRequest,
        handleAddCustomOrderNote,
        handleEditCustomOrderNote,
        handleDeleteCustomOrderNote,
        handleApproveRequestReturn,
        handleAddTrackingReturn,
        handleReceiveReturn,
        handleQcPassReturn,
        handleQcFailReturn,
        handleConfirmDefectiveReturn,
        handleRejectReturn,
        handleShipBackReturn,
    };
}
