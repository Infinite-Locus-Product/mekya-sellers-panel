"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AppSelect } from "@/components/shared/AppSelect";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type {
    AllOrder,
    OrderStatus,
    PaymentStatus,
    ProductInventoryType,
    ReturnStatus,
} from "@/lib/tableTypes";
import {
    PRODUCT_INVENTORY_TYPE_LABELS,
    TABLE_BADGE_PILL_COLUMN_CLASS,
    TABLE_PAYMENT_STATUS_COLUMN_CLASS,
} from "@/lib/tableTypes";
import { orderStatusToBadgeVariant } from "@/lib/orderStatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkActionModal } from "@/app/(pages)/order-management/_components/BulkActionModal";
import { toast } from "sonner";
import {
    KpiOrdersBagIcon,
    KpiReturnUndoIcon,
    KpiTotalRevenueIcon,
    KpiPendingOrdersIcon,
    KpiDeliveredOrdersIcon,
    OrderViewIcon,
    OrderInvoiceIcon,
} from "@/assets/icons";
import { OrderBulkActionToolbarIcon, OrderManagementTableCardIcon } from "@/assets/icons/order-management";
import { InventoryTypeBadge } from "@/components/shared/InventoryTypeBadge";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import {
    ReturnDetailsModal,
    type ReturnDetailsData,
    type ReturnItemLine,
} from "@/app/(pages)/order-management/returns/_components/modals/ReturnDetailsModal";

/** Full column width so Paid / Pending / Refunded pills share the same width (column sized in `TABLE_PAYMENT_STATUS_COLUMN_CLASS`). */
const ORDER_PAYMENT_PILL_BASE =
    "inline-flex h-[22px] w-full min-w-0 max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full px-1.5 py-0.5 text-center text-[9px] font-medium leading-none sm:h-7 sm:px-2 sm:text-[11px] min-[1920px]:h-8 min-[1920px]:text-sm";

const ORDER_FILTER_SELECT_TRIGGER_CLASS =
    "h-7 min-w-0 shrink px-1.5 text-left text-[10px] sm:h-8 sm:text-xs min-[1920px]:h-10 min-[1920px]:px-3 min-[1920px]:text-sm max-lg:flex-1 max-lg:basis-0 max-lg:!w-full max-lg:max-w-full max-lg:overflow-hidden lg:flex-none lg:w-max lg:!w-max lg:max-w-[min(100%,22rem)] lg:overflow-hidden max-[480px]:grow-0 max-[480px]:basis-full max-[480px]:!w-full max-[480px]:flex-none [&_[data-slot=select-value]]:min-w-0 max-lg:[&_[data-slot=select-value]]:flex-1 max-lg:[&_[data-slot=select-value]]:truncate lg:[&_[data-slot=select-value]]:max-w-full lg:[&_[data-slot=select-value]]:overflow-visible lg:[&_[data-slot=select-value]]:text-clip lg:[&_[data-slot=select-value]]:whitespace-nowrap";

const RETURN_ITEMS_DEMO_FILL: ReturnItemLine[] = [
    { product: "Premium Kurta", sku: "PW-001", quantity: 1, price: "₹2,499", total: "₹2,499" },
    { product: "Cotton T-Shirt", sku: "PW-002", quantity: 2, price: "₹899", total: "₹1,798" },
    { product: "Linen Shirt", sku: "PW-003", quantity: 1, price: "₹1,299", total: "₹1,299" },
    { product: "Slim Fit Jeans", sku: "PW-004", quantity: 1, price: "₹2,199", total: "₹2,199" },
    { product: "Sports Shoes", sku: "PW-005", quantity: 1, price: "₹3,499", total: "₹3,499" },
];

function padReturnItemsToFive(mapped: ReturnItemLine[]): ReturnItemLine[] {
    const capped = mapped.slice(0, 5);
    if (capped.length >= 5) return capped;
    const merged = [...capped];
    let i = 0;
    while (merged.length < 5 && i < RETURN_ITEMS_DEMO_FILL.length) {
        merged.push(RETURN_ITEMS_DEMO_FILL[i]);
        i += 1;
    }
    return merged;
}

const B2C_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: string; value: "all" | OrderStatus }> =
    [
        { label: "All Status", value: "all" },
        { label: "Pending", value: "Pending" },
        { label: "Processing", value: "Processing" },
        { label: "Shipped", value: "Shipped" },
        { label: "Partial Fulfillment", value: "Partial Fulfillment" },
        { label: "Delivered", value: "Delivered" },
        { label: "Completed", value: "Completed" },
        { label: "Returned", value: "Returned" },
        { label: "Canceled", value: "Canceled" },
    ];

const B2B_ORDER_STATUS_FILTER_OPTIONS: ReadonlyArray<{ label: string; value: "all" | OrderStatus }> =
    [
        { label: "All Status", value: "all" },
        { label: "Pending", value: "Pending" },
        { label: "Processing", value: "Processing" },
        { label: "Shipped", value: "Shipped" },
        { label: "Delivered", value: "Delivered" },
        { label: "Returned", value: "Returned" },
        { label: "Canceled", value: "Canceled" },
    ];

export interface OrderManagementSegmentClientProps {
    initialOrders: AllOrder[];
    segment: "b2c" | "b2b";
}

export function OrderManagementSegmentClient({
    initialOrders,
    segment,
}: Readonly<OrderManagementSegmentClientProps>) {
    const router = useRouter();

    const getProductNames = useCallback(
        (order: AllOrder): string[] => (order.productList ?? []).map((item) => item.name),
        []
    );

    const handleOrderClick = useCallback(
        (orderId: string) => {
            router.push(`/order-management/${orderId}?segment=${segment}`);
        },
        [router, segment]
    );

    const [orderView, setOrderView] = useState<"all" | "returns">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [returnStatusFilter, setReturnStatusFilter] = useState<"all" | ReturnStatus>("all");
    const [dateFilter, setDateFilter] = useState("all_dates");
    const [inventoryTypeFilter, setInventoryTypeFilter] = useState<"all" | ProductInventoryType>("all");
    const [paymentFilter] = useState<"all" | PaymentStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState<Set<AllOrder>>(() => new Set());
    const [bulkActionOpen, setBulkActionOpen] = useState(false);
    const [returnDetailsOpen, setReturnDetailsOpen] = useState(false);
    const [returnDetailsData, setReturnDetailsData] = useState<ReturnDetailsData | null>(null);

    const openReturnDetails = useCallback((order: AllOrder) => {
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

    const segmentOrders = useMemo(
        () => initialOrders.filter((o) => (segment === "b2b" ? o.type === "B2B" : o.type === "B2C")),
        [initialOrders, segment]
    );

    const totalOrders = segmentOrders.length;
    const totalRevenue = segmentOrders.reduce((sum, order) => {
        const numeric = Number(order.amount.replaceAll(/[^\d.]/g, ""));
        return sum + (Number.isNaN(numeric) ? 0 : numeric);
    }, 0);
    const pendingOrders = segmentOrders.filter((o) => String(o.status) === "Pending").length;
    const deliveredOrders = segmentOrders.filter((o) => String(o.status) === "Delivered").length;
    const returnOrders = segmentOrders.filter(
        (o) => (o.paymentStatus as string) === "Refunded"
    ).length;

    const filteredOrders = useMemo(() => {
        return segmentOrders.filter((order) => {
            if (orderView === "returns") {
                if (!order.returnStatus) return false;
                if (returnStatusFilter !== "all" && order.returnStatus !== returnStatusFilter) {
                    return false;
                }
            } else {
                if (statusFilter !== "all" && order.status !== statusFilter) return false;
                if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) return false;
                if (
                    segment === "b2b" &&
                    inventoryTypeFilter !== "all" &&
                    order.inventoryType !== inventoryTypeFilter
                ) {
                    return false;
                }
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesSearch =
                    order.id.toLowerCase().includes(q) ||
                    order.vendor.toLowerCase().includes(q) ||
                    getProductNames(order).some((name) => name.toLowerCase().includes(q));
                if (!matchesSearch) return false;
            }
            return true;
        });
    }, [
        getProductNames,
        segment,
        inventoryTypeFilter,
        segmentOrders,
        orderView,
        returnStatusFilter,
        statusFilter,
        paymentFilter,
        searchQuery,
    ]);

    const pagination = usePagination({ totalCount: filteredOrders.length, pageSize: 10 });
    const paginatedOrders = useMemo(
        () => filteredOrders.slice(pagination.startIndex, pagination.endIndex),
        [filteredOrders, pagination.startIndex, pagination.endIndex]
    );

    const handleSelectAll = useCallback(
        (selected: boolean) => {
            if (selected) {
                setSelectedRows(new Set(paginatedOrders));
            } else {
                setSelectedRows(new Set());
            }
        },
        [paginatedOrders]
    );

    const handleSelectRow = useCallback((row: AllOrder, selected: boolean) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            if (selected) {
                next.add(row);
            } else {
                next.delete(row);
            }
            return next;
        });
    }, []);

    useEffect(() => {
        pagination.setPage(1);
    }, [orderView, statusFilter, returnStatusFilter, dateFilter, inventoryTypeFilter, segment]);

    const returnStatusVariant = useCallback((status: ReturnStatus): StatusVariant => {
        if (status === "Return Requested") return "pending";
        if (status === "Approved") return "shipped";
        return "completed";
    }, []);

    const allOrdersColumns: TableColumn<AllOrder>[] = useMemo(
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
                    const text = getProductNames(row).join(", ");
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
        [getProductNames, handleOrderClick]
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
            { key: "vendor", header: segment === "b2b" ? "Vendor Name" : "Customer Name" },
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
                    const text = getProductNames(row).join(", ");
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
                                aria-label="View order"
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
        [getProductNames, handleOrderClick, openReturnDetails, returnStatusVariant, segment]
    );

    const columns =
        orderView === "returns"
            ? returnRequestsColumns
            : segment === "b2b"
                ? b2bAllOrdersColumns
                : allOrdersColumns;

    const viewCopy =
        segment === "b2c"
            ? orderView === "all"
                ? {
                    pageSubtitle: "Manage all B2C orders across the platform",
                    cardTitle: "All Orders",
                    cardDescription: "Manage all B2C orders from a centralized location",
                    searchPlaceholder: "Search by order ID, customer name, or product",
                    emptyMessage: "No orders match your filters",
                }
                : {
                    pageSubtitle: "Review and manage customer return requests",
                    cardTitle: "Return Requests",
                    cardDescription:
                        "Manage all B2C Return Requests orders from a centralized location",
                    searchPlaceholder: "Search by order ID, customer name, or product",
                    emptyMessage:
                        "No results found. Try resetting your filters or adjusting your search.",
                }
            : orderView === "all"
                ? {
                    pageSubtitle: "Manage all B2B wholesale orders across the platform",
                    cardTitle: "All Orders",
                    cardDescription: "Manage all B2B orders from a centralized location",
                    searchPlaceholder: "Search by order ID, or vendor name",
                    emptyMessage: "No orders match your filters",
                }
                : {
                    pageSubtitle: "Review and manage B2B return requests",
                    cardTitle: "Custom Orders",
                    cardDescription: "Manage all B2B return requests from a centralized location",
                    searchPlaceholder: "Search by order ID, or vendor name",
                    emptyMessage:
                        "No results found. Try resetting your filters or adjusting your search.",
                };

    const orderViewToggleLabels =
        segment === "b2c"
            ? { all: "All Orders", returns: "Return Requests" }
            : { all: "Bulk Orders", returns: "Custom Orders" };

    const pageTitle = segment === "b2b" ? "B2B Order Management" : "Order Management System";

    return (
        <div className="min-w-0 max-w-full space-y-3 min-[1920px]:space-y-4">
            <BulkActionModal
                open={bulkActionOpen}
                onOpenChange={setBulkActionOpen}
                selectedOrderIds={Array.from(selectedRows).map((o) => o.id)}
                onExecute={(action, orderIds, meta) => {
                    const count = orderIds.length;
                    const orderWord = count === 1 ? "order" : "orders";

                    try {
                        if (action === "update_status" && meta?.newOrderStatus) {
                            const status = meta.newOrderStatus;
                            toast.success(
                                `🎉 Updated ${count} ${orderWord} to “${status}”`
                            );
                            return;
                        }

                        if (action === "generate_invoice") {
                            const invoiceWord = count === 1 ? "invoice" : "invoices";
                            toast.success(
                                `🎉 Successfully generated ${count} ${invoiceWord} for ${count} ${orderWord}`
                            );
                            return;
                        }

                        toast.success(`🎉 Bulk action completed for ${count} ${orderWord}`);
                    } finally {
                        setSelectedRows(new Set());
                    }
                }}
            />
            <ReturnDetailsModal
                open={returnDetailsOpen}
                onOpenChange={(open) => {
                    setReturnDetailsOpen(open);
                    if (!open) setReturnDetailsData(null);
                }}
                data={returnDetailsData}
            />
            <Breadcrumb
                items={[
                    { label: "Seller Dashboard", href: "/" },
                    { label: "Order Management" },
                ]}
            />

            <div className="min-w-0">
                <div className="space-y-1.5">
                    <h1 className="text-base font-semibold text-foreground xl:text-lg min-[1920px]:text-2xl">
                        {pageTitle}
                    </h1>
                    <p className="text-[11px] text-muted-foreground min-[1920px]:text-sm">{viewCopy.pageSubtitle}</p>
                </div>
                <div className="mt-2 flex justify-end sm:mt-3">
                    <div className="flex h-8 w-full min-w-0 max-w-[min(100%,260px)] items-center rounded-full bg-[#E5E5E5] p-0.5 sm:max-w-[280px] min-[1920px]:h-[39px] min-[1920px]:max-w-[320px] min-[1920px]:p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRows(new Set());
                                setOrderView("all");
                            }}
                            className={
                                orderView === "all"
                                    ? "flex-1 rounded-full bg-white p-1.5 text-center text-[10px] font-medium text-foreground shadow-sm min-[1920px]:p-2 min-[1920px]:text-xs"
                                    : "flex-1 rounded-full p-1 text-center text-[10px] font-medium text-muted-foreground min-[1920px]:text-xs"
                            }
                        >
                            {orderViewToggleLabels.all}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedRows(new Set());
                                setOrderView("returns");
                            }}
                            className={
                                orderView === "returns"
                                    ? "flex-1 rounded-full bg-white p-1.5 text-center text-[10px] font-medium text-foreground shadow-sm min-[1920px]:p-2 min-[1920px]:text-xs"
                                    : "flex-1 rounded-full p-1 text-center text-[10px] font-medium text-muted-foreground min-[1920px]:text-xs"
                            }
                        >
                            {orderViewToggleLabels.returns}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3 xl:grid-cols-5 min-[1920px]:gap-3">
                <KPICard
                    title="Total Orders"
                    value={String(totalOrders)}
                    icon={<KpiOrdersBagIcon />}
                    kpiType={1}
                />
                <KPICard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                    icon={<KpiTotalRevenueIcon />}
                    kpiType={2}
                />
                <KPICard
                    title="Pending Orders"
                    value={String(pendingOrders)}
                    icon={<KpiPendingOrdersIcon />}
                    kpiType={3}
                />
                <KPICard
                    title="Delivered"
                    value={String(deliveredOrders)}
                    icon={<KpiDeliveredOrdersIcon />}
                    kpiType={4}
                />
                <KPICard
                    title="Return & Exchanges"
                    value={String(returnOrders)}
                    icon={<KpiReturnUndoIcon />}
                    kpiType={5}
                />
            </div>

            <Card className="min-w-0 overflow-hidden">
                <div className="bg-[#F9FAF9] px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 min-[1920px]:px-6 min-[1920px]:pt-6">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-1">
                            <div className="mt-0.5">
                                <OrderManagementTableCardIcon />
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                                <CardTitle className="text-xs xl:text-sm min-[1920px]:text-base">
                                    {viewCopy.cardTitle}
                                </CardTitle>
                                <p className="text-[11px] text-muted-foreground min-[1920px]:text-sm">
                                    {viewCopy.cardDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex min-w-0 flex-col gap-2.5 lg:mt-4 lg:flex-row lg:items-start lg:justify-between lg:gap-2">
                        <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
                            <div className="relative min-w-0 w-full lg:max-w-md">
                                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground min-[1920px]:left-3 min-[1920px]:size-4" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={viewCopy.searchPlaceholder}
                                    className="w-full min-w-0 rounded-xs border border-input bg-[#E8E9E8] py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[1920px]:px-10 min-[1920px]:py-2 min-[1920px]:pl-10 min-[1920px]:text-sm"
                                    aria-label="Search orders"
                                />
                            </div>
                            <div className="flex min-w-0 flex-nowrap items-center gap-1 max-[480px]:flex-wrap max-[480px]:gap-x-2 max-[480px]:gap-y-2 sm:gap-1.5 md:gap-2 min-[1920px]:gap-3">
                                {orderView === "all" ? (
                                    <AppSelect
                                        placeholder="All Status"
                                        value={statusFilter}
                                        onChange={(value: string) => setStatusFilter((value as OrderStatus) || "all")}
                                        options={
                                            segment === "b2b"
                                                ? Array.from(B2B_ORDER_STATUS_FILTER_OPTIONS)
                                                : Array.from(B2C_ORDER_STATUS_FILTER_OPTIONS)
                                        }
                                        className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                                    />
                                ) : (
                                    <AppSelect
                                        placeholder="All return status"
                                        value={returnStatusFilter}
                                        onChange={(value: string) =>
                                            setReturnStatusFilter(value === "all" ? "all" : (value as ReturnStatus))
                                        }
                                        options={[
                                            { label: "All return status", value: "all" },
                                            { label: "Return Requested", value: "Return Requested" },
                                            { label: "Approved", value: "Approved" },
                                            { label: "Completed", value: "Completed" },
                                        ]}
                                        className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                                    />
                                )}
                                <AppSelect
                                    placeholder="All Dates"
                                    value={dateFilter}
                                    onChange={(value: string) => setDateFilter(value)}
                                    options={[
                                        { label: "All Dates", value: "all_dates" },
                                        { label: "Today", value: "today" },
                                        { label: "This Week", value: "this_week" },
                                        { label: "This Month", value: "this_month" },
                                    ]}
                                    className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                                />
                                {orderView === "all" && segment === "b2b" ? (
                                    <AppSelect
                                        placeholder="Inventory Type"
                                        value={inventoryTypeFilter}
                                        onChange={(value: string) =>
                                            setInventoryTypeFilter(
                                                value === "all" ? "all" : (value as ProductInventoryType)
                                            )
                                        }
                                        options={[
                                            { label: "All Inventory Types", value: "all" },
                                            {
                                                label: PRODUCT_INVENTORY_TYPE_LABELS.ready_to_ship,
                                                value: "ready_to_ship",
                                            },
                                            {
                                                label: PRODUCT_INVENTORY_TYPE_LABELS.sale_or_return,
                                                value: "sale_or_return",
                                            },
                                            {
                                                label: PRODUCT_INVENTORY_TYPE_LABELS.stock_clearance,
                                                value: "stock_clearance",
                                            },
                                            {
                                                label: PRODUCT_INVENTORY_TYPE_LABELS.pre_booking,
                                                value: "pre_booking",
                                            },
                                        ]}
                                        className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                                    />
                                ) : null}
                            </div>
                        </div>
                        {orderView === "all" ? (
                            <div className="flex shrink-0 justify-end lg:pt-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={selectedRows.size === 0}
                                    onClick={() => setBulkActionOpen(true)}
                                    className="gap-1.5 border-border bg-black text-xs text-white hover:text-white min-[1920px]:gap-2 min-[1920px]:text-sm disabled:bg-white disabled:text-black disabled:opacity-100"
                                    aria-label="Bulk action"
                                >
                                    <OrderBulkActionToolbarIcon className="size-3 shrink-0 text-current min-[1920px]:size-4" />
                                    Bulk Action
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </div>

                <CardContent className="min-w-0 bg-[#F9FAF9] px-1.5 pt-2 sm:px-3 sm:pt-3 lg:px-4 min-[1920px]:px-6">
                    <DataTable
                        columns={columns}
                        data={paginatedOrders}
                        striped
                        emptyMessage={viewCopy.emptyMessage}
                        selectedRows={orderView === "all" ? selectedRows : undefined}
                        onSelectAll={orderView === "all" ? handleSelectAll : undefined}
                        onSelectRow={orderView === "all" ? handleSelectRow : undefined}
                    />
                    <div className="mt-4">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.setPage}
                            pageSize={pagination.pageSize}
                            onPageSizeChange={pagination.setPageSize}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

