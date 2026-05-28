"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import type { AllOrder } from "@/lib/tableTypes";
import type { ReturnDetailsData } from "@/app/(pages)/order-management/_components/ReturnDetailsModal";
import type {
    CustomOrderDetailsData,
    CustomOrderLine,
} from "@/app/(pages)/order-management/_components/CustomOrderDetailsModal";
import {
    customizationStatusLabel,
    demoContactPersonForOrder,
    getOrderProductNames,
    padReturnItemsToFive,
} from "./helpers";

export interface UseOrderManagementSegmentModalsReturn {
    returnDetailsOpen: boolean;
    setReturnDetailsOpen: (open: boolean) => void;
    returnDetailsData: ReturnDetailsData | null;
    setReturnDetailsData: Dispatch<SetStateAction<ReturnDetailsData | null>>;
    customOrderDetailsOpen: boolean;
    setCustomOrderDetailsOpen: (open: boolean) => void;
    customOrderDetailsData: CustomOrderDetailsData | null;
    setCustomOrderDetailsData: Dispatch<SetStateAction<CustomOrderDetailsData | null>>;
    openCustomOrderDetails: (order: AllOrder) => void;
    openReturnDetails: (order: AllOrder) => void;
}

export function useOrderManagementSegmentModals(): UseOrderManagementSegmentModalsReturn {
    const [returnDetailsOpen, setReturnDetailsOpen] = useState(false);
    const [returnDetailsData, setReturnDetailsData] = useState<ReturnDetailsData | null>(null);
    const [customOrderDetailsOpen, setCustomOrderDetailsOpen] = useState(false);
    const [customOrderDetailsData, setCustomOrderDetailsData] = useState<CustomOrderDetailsData | null>(null);

    const openCustomOrderDetails = useCallback((order: AllOrder) => {
        setReturnDetailsOpen(false);
        setReturnDetailsData(null);

        const amountNumeric = Number(String(order.amount).replaceAll(/[^\d.]/g, ""));
        const orderValue = Number.isNaN(amountNumeric)
            ? order.amount
            : `₹${amountNumeric.toLocaleString("en-IN")}`;

        const mapped: CustomOrderLine[] =
            order.productList?.map((item, index) => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);
                const safePrice = Number.isFinite(price) ? price : 0;
                const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
                const lineTotal = safePrice * safeQuantity;
                return {
                    product: item.name,
                    sku: `PW-${String(index + 1).padStart(3, "0")}`,
                    quantity: safeQuantity.toLocaleString("en-IN"),
                    price: `₹${safePrice.toLocaleString("en-IN")}`,
                    total: `₹${lineTotal.toLocaleString("en-IN")}`,
                };
            }) ?? [];

        const lines: CustomOrderLine[] =
            mapped.length > 0
                ? mapped
                : [
                    {
                        product: "Polo T-shirts",
                        sku: "PW-001",
                        quantity: "1,500",
                        price: "₹372",
                        total: orderValue,
                    },
                ];

        const productSummary = getOrderProductNames(order).join(", ");
        const customizationRequirements =
            productSummary.length > 0
                ? `Custom run: ${productSummary}. Add logo placement and sizing per buyer spec.`
                : "1,500 navy-blue polos with logo on chest and '#TogetherWeGrow' on sleeve.";

        setCustomOrderDetailsData({
            orderId: order.id,
            vendorName: order.vendor,
            orderDate: order.date,
            contactPerson: demoContactPersonForOrder(order.id),
            deadline: order.deadline ?? order.delivery ?? "21 Oct 2025",
            orderValue,
            currentStatusLabel:
                order.customOrderStatus ?? customizationStatusLabel(order.status),
            customizationRequirements,
            uploadedFiles: [{ name: "RelianceLogo.png" }, { name: "Specifications.pdf" }],
            packagingPreferences: "Individual packaging with company branding",
            lines,
        });
        setCustomOrderDetailsOpen(true);
    }, []);

    const openReturnDetails = useCallback((order: AllOrder) => {
        setCustomOrderDetailsOpen(false);
        setCustomOrderDetailsData(null);

        const mapped =
            order.productList?.map((item) => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);
                const safePrice = Number.isFinite(price) ? price : 0;
                const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
                const lineTotal = safePrice * safeQuantity;
                return {
                    product: item.name,
                    sku: undefined,
                    quantity: item.quantity,
                    price: `₹${safePrice.toLocaleString("en-IN")}`,
                    total: `₹${lineTotal.toLocaleString("en-IN")}`,
                };
            }) ?? [];
        const items = padReturnItemsToFive(mapped);

        setReturnDetailsData({
            orderId: order.id,
            vendor: order.vendor,
            requestDate: order.date,
            refundAmount: order.amount,
            requestType: "return",
            customerFeedback:
                "Product defective - Clothes are torn and the fabric has been ripped",
            reasonForReturn: "Defective product",
            items,
        });
        setReturnDetailsOpen(true);
    }, []);

    return {
        returnDetailsOpen,
        setReturnDetailsOpen,
        returnDetailsData,
        setReturnDetailsData,
        customOrderDetailsOpen,
        setCustomOrderDetailsOpen,
        customOrderDetailsData,
        setCustomOrderDetailsData,
        openCustomOrderDetails,
        openReturnDetails,
    };
}
