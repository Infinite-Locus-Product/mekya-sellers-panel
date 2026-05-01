"use client";

import { useMemo, useCallback } from "react";
import type { TableColumn } from "@/components/shared/DataTable";
import type { AllOrder, ReturnStatus } from "@/lib/tableTypes";
import {
    TABLE_BADGE_PILL_COLUMN_CLASS,
    TABLE_CUSTOM_ORDER_STATUS_COLUMN_CLASS,
    TABLE_PAYMENT_STATUS_COLUMN_CLASS,
    TABLE_RETURN_STATUS_COLUMN_CLASS,
} from "@/lib/tableTypes";
import { customOrderStatusToBadgeVariant, orderStatusToBadgeVariant } from "@/lib/orderStatusBadge";
import { OrderViewIcon, OrderInvoiceIcon } from "@/assets/icons";
import { InventoryTypeBadge } from "@/components/shared/InventoryTypeBadge";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import { ORDER_PAYMENT_PILL_BASE } from "./constants";
import { getOrderProductNames } from "./helpers";

export interface UseOrderManagementSegmentColumnsParams {
    readonly openCustomOrderDetails: (order: AllOrder) => void;
    readonly handleOrderClick: (orderId: string) => void;
    readonly openReturnDetails: (order: AllOrder) => void;
}

export function useOrderManagementSegmentColumns({
    openCustomOrderDetails,
    handleOrderClick,
    openReturnDetails,
}: UseOrderManagementSegmentColumnsParams): {
    customOrdersColumns: TableColumn<AllOrder>[];
    allOrdersColumns: TableColumn<AllOrder>[];
    b2bAllOrdersColumns: TableColumn<AllOrder>[];
    returnRequestsColumns: TableColumn<AllOrder>[];
} {
    const returnStatusVariant = useCallback((status: ReturnStatus): StatusVariant => {
        if (status === "Return Requested") return "pending";
        if (status === "Approved") return "shipped";
        return "completed";
    }, []);

    const customOrdersColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">
                        {row.id}
                    </span>
                ),
            },
            { key: "vendor", header: "Vendor Name" },
            {
                key: "date",
                header: "Order Date",
                sortable: true,
            },
            {
                key: "amount",
                header: "Order Total",
                sortable: true,
                cell: (row) => {
                    const numeric = Number(String(row.amount).replaceAll(/[^\d.]/g, ""));
                    if (Number.isNaN(numeric)) return row.amount;
                    return `₹${numeric.toLocaleString("en-IN")}`;
                },
            },
            {
                key: "customOrderStatus",
                header: "Order Status",
                className: TABLE_CUSTOM_ORDER_STATUS_COLUMN_CLASS,
                cell: (row) => {
                    const status = row.customOrderStatus;
                    if (!status) {
                        return (
                            <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">—</span>
                        );
                    }
                    return (
                        <StatusBadge
                            variant={customOrderStatusToBadgeVariant(status)}
                            allowWrap={status === "Pending Further information"}
                        >
                            {status}
                        </StatusBadge>
                    );
                },
            },
            {
                key: "deadline",
                header: "Deadline",
                cell: (row) => (
                    <span className="text-[11px] text-foreground min-[1920px]:text-sm">
                        {row.deadline ?? "—"}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View custom order"
                                onClick={() => openCustomOrderDetails(row)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [openCustomOrderDetails]
    );

    const allOrdersColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">{row.id}</span>
                ),
            },
            { key: "vendor", header: "Customer Name" },
            {
                key: "date",
                header: "Order Date",
                sortable: true,
            },
            {
                key: "productList",
                header: "Product List",
                className: "w-[25%]",
                cell: (row) => {
                    const text = getOrderProductNames(row).join(", ");
                    return text ? (
                        <span className="text-[11px] leading-snug min-[1920px]:text-sm">{text}</span>
                    ) : (
                        <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">-</span>
                    );
                },
            },
            {
                key: "amount",
                header: "Total Amount",
                sortable: true,
                cell: (row) => {
                    const numeric = Number(String(row.amount).replaceAll(/[^\d.]/g, ""));
                    if (Number.isNaN(numeric)) return row.amount;
                    return `₹${numeric.toLocaleString("en-IN")}`;
                },
            },
            {
                key: "status",
                header: "Order Status",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => (
                    <StatusBadge variant={orderStatusToBadgeVariant(row.status)}>{row.status}</StatusBadge>
                ),
            },
            {
                key: "paymentStatus",
                header: "Payment Status",
                className: TABLE_PAYMENT_STATUS_COLUMN_CLASS,
                cell: (row) => {
                    const value = row.paymentStatus;

                    if (value === "Paid") {
                        return <span className={`${ORDER_PAYMENT_PILL_BASE} bg-black text-white`}>Paid</span>;
                    }

                    if (value === "Pending") {
                        return (
                            <span
                                className={`${ORDER_PAYMENT_PILL_BASE} border border-[#979797] bg-white text-gray-800`}
                            >
                                Pending
                            </span>
                        );
                    }

                    return (
                        <span className={`${ORDER_PAYMENT_PILL_BASE} bg-gray-200 text-gray-800`}>Refunded</span>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground sm:gap-2">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View order"
                                onClick={() => handleOrderClick(row.id)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="Generate invoice"
                            >
                                <OrderInvoiceIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Generate Invoice</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [handleOrderClick]
    );

    const b2bAllOrdersColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "select",
                header: "",
                checkbox: true,
                className: "w-11",
            },
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <span className="text-[11px] font-medium text-foreground min-[1920px]:text-sm">{row.id}</span>
                ),
            },
            { key: "vendor", header: "Vendor Name" },
            {
                key: "date",
                header: "Order Date",
                sortable: true,
            },
            {
                key: "amount",
                header: "Order Total",
                sortable: true,
                cell: (row) => {
                    const numeric = Number(String(row.amount).replaceAll(/[^\d.]/g, ""));
                    if (Number.isNaN(numeric)) return row.amount;
                    return `₹${numeric.toLocaleString("en-IN")}`;
                },
            },
            {
                key: "inventoryType",
                header: "Inventory Type",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => <InventoryTypeBadge type={row.inventoryType} />,
            },
            {
                key: "status",
                header: "Order Status",
                className: TABLE_BADGE_PILL_COLUMN_CLASS,
                cell: (row) => (
                    <StatusBadge variant={orderStatusToBadgeVariant(row.status)}>{row.status}</StatusBadge>
                ),
            },
            {
                key: "paymentStatus",
                header: "Payment Status",
                className: TABLE_PAYMENT_STATUS_COLUMN_CLASS,
                cell: (row) => {
                    const value = row.paymentStatus;

                    if (value === "Paid") {
                        return <span className={`${ORDER_PAYMENT_PILL_BASE} bg-black text-white`}>Paid</span>;
                    }

                    if (value === "Pending") {
                        return (
                            <span
                                className={`${ORDER_PAYMENT_PILL_BASE} border border-[#979797] bg-white text-gray-800`}
                            >
                                Pending
                            </span>
                        );
                    }

                    return (
                        <span className={`${ORDER_PAYMENT_PILL_BASE} bg-gray-200 text-gray-800`}>Refunded</span>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground sm:gap-2">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View order"
                                onClick={() => handleOrderClick(row.id)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="Generate invoice"
                            >
                                <OrderInvoiceIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Generate Invoice</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [handleOrderClick]
    );

    const returnRequestsColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <button
                        type="button"
                        onClick={() => handleOrderClick(row.id)}
                        className="text-[11px] font-medium text-black hover:underline min-[1920px]:text-sm"
                    >
                        {row.id}
                    </button>
                ),
            },
            { key: "vendor", header: "Customer Name" },
            {
                key: "date",
                header: "Order Date",
                sortable: true,
            },
            {
                key: "productList",
                header: "Product List",
                className: "w-[25%]",
                cell: (row) => {
                    const text = getOrderProductNames(row).join(", ");
                    return text ? (
                        <span className="text-[11px] leading-snug min-[1920px]:text-sm">{text}</span>
                    ) : (
                        <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">-</span>
                    );
                },
            },
            {
                key: "amount",
                header: "Total Amount",
                sortable: true,
                cell: (row) => {
                    const numeric = Number(String(row.amount).replaceAll(/[^\d.]/g, ""));
                    if (Number.isNaN(numeric)) return row.amount;
                    return `₹${numeric.toLocaleString("en-IN")}`;
                },
            },
            {
                key: "returnStatus",
                header: "Return Status",
                className: TABLE_RETURN_STATUS_COLUMN_CLASS,
                cell: (row) => {
                    const status = row.returnStatus;
                    if (!status)
                        return <span className="text-[11px] text-muted-foreground min-[1920px]:text-sm">—</span>;
                    return (
                        <StatusBadge variant={returnStatusVariant(status)}>
                            {status}
                        </StatusBadge>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center min-[1920px]:size-8"
                                aria-label="View return request"
                                onClick={() => openReturnDetails(row)}
                            >
                                <OrderViewIcon />
                            </button>
                            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-[68%] flex h-[36px] w-[145px] items-center justify-center rounded-[5px] bg-black text-md font-medium text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                                <span>Detailed View</span>
                                <span className="absolute -bottom-1 left-[68%] h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        [handleOrderClick, openReturnDetails, returnStatusVariant]
    );

    return { customOrdersColumns, allOrdersColumns, b2bAllOrdersColumns, returnRequestsColumns };
}
