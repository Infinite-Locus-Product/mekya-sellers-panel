"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AppSelect } from "@/components/shared/AppSelect";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { AllOrder, OrderStatus, PaymentStatus, ReturnStatus } from "@/lib/tableTypes";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks";
import { Search } from "lucide-react";
import {
    KpiOrdersBagIcon,
    KpiReturnUndoIcon,
    KpiTotalRevenueIcon,
    KpiPendingOrdersIcon,
    KpiDeliveredOrdersIcon,
    OrderViewIcon,
    OrderInvoiceIcon,
} from "@/assets/icons";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import {
    ReturnDetailsModal,
    type ReturnDetailsData,
    type ReturnItemLine,
} from "@/app/(pages)/order-management/_components/ReturnDetailsModal";

/** Pads the return modal table to five rows when the order has fewer line items (demo / UX). */
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

export interface OrderManagementClientProps {
    initialOrders: AllOrder[];
}

export function OrderManagementClient({ initialOrders }: Readonly<OrderManagementClientProps>) {
    const router = useRouter();

    const getProductNames = useCallback(
        (order: AllOrder): string[] => (order.productList ?? []).map((item) => item.name),
        []
    );

    const handleOrderClick = useCallback(
        (orderId: string) => {
            router.push(`/order-management/${orderId}`);
        },
        [router]
    );

    const [orderView, setOrderView] = useState<"all" | "returns">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [returnStatusFilter, setReturnStatusFilter] = useState<"all" | ReturnStatus>("all");
    const [dateFilter, setDateFilter] = useState("all_dates");
    const [paymentFilter] = useState<"all" | PaymentStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
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

    const totalOrders = initialOrders.length;
    const totalRevenue = initialOrders.reduce((sum, order) => {
        const numeric = Number(order.amount.replaceAll(/[^\d.]/g, ""));
        return sum + (Number.isNaN(numeric) ? 0 : numeric);
    }, 0);
    const pendingOrders = initialOrders.filter((o) => String(o.status) === "Pending").length;
    const deliveredOrders = initialOrders.filter(
        (o) => o.status === "Delivered" || o.status === "Completed"
    ).length;
    const returnOrders = initialOrders.filter((o) => o.returnStatus != null).length;

    const filteredOrders = useMemo(() => {
        return initialOrders.filter((order) => {
            if (orderView === "returns") {
                if (!order.returnStatus) return false;
                if (returnStatusFilter !== "all" && order.returnStatus !== returnStatusFilter) {
                    return false;
                }
            } else {
                if (statusFilter !== "all" && order.status !== statusFilter) return false;
                if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesSearch =
                    order.id.toLowerCase().includes(q) ||
                    order.vendor.toLowerCase().includes(q) ||
                    getProductNames(order).some((name) => name.toLowerCase().includes(q));
                if (!matchesSearch) return false;
            }
            // dateFilter hook – placeholder for real date parsing later
            return true;
        });
    }, [
        getProductNames,
        initialOrders,
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

    useEffect(() => {
        pagination.setPage(1);
    }, [orderView, statusFilter, returnStatusFilter, dateFilter]);

    const returnStatusVariant = useCallback((status: ReturnStatus): StatusVariant => {
        if (status === "Return Requested") return "pending";
        if (status === "Approved") return "shipped";
        return "delivered";
    }, []);

    const allOrdersColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Order ID",
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
                    return text ? <span className="text-sm">{text}</span> : <span className="text-sm text-muted-foreground">-</span>;
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
                cell: (row) => {
                    const value = String(row.status);
                    const variant =
                        value === "Completed"
                            ? "delivered"
                            : value === "Delivered"
                              ? "delivered"
                              : value === "Shipped"
                                ? "shipped"
                                : value === "Processing"
                                  ? "processing"
                                  : value === "Returned"
                                    ? "returned"
                                    : value === "Canceled"
                                      ? "canceled"
                                      : "pending";

                    const label = value;

                    return <StatusBadge variant={variant}>{label}</StatusBadge>;
                },
            },
            {
                key: "paymentStatus",
                header: "Payment Status",
                cell: (row) => {
                    const value = row.paymentStatus;
                    const baseClasses =
                        "inline-flex w-18 h-7 items-center justify-center rounded-full px-3  text-md font-medium";

                    if (value === "Paid") {
                        return (
                            <span className={`${baseClasses} bg-black text-white`}>
                                Paid
                            </span>
                        );
                    }

                    if (value === "Pending") {
                        return (
                            <span
                                className={`${baseClasses} border border-[#979797]`}
                            >
                                Pending
                            </span>
                        );
                    }

                    // Refunded
                    return (
                        <span className={`${baseClasses} bg-gray-200 text-gray-800`}>
                            Refunded
                        </span>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                align: "center",
                cell: (row) => (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center"
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
                                className="inline-flex h-8 w-8 items-center justify-center"
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

    const returnRequestsColumns: TableColumn<AllOrder>[] = useMemo(
        () => [
            {
                key: "id",
                header: "Order ID",
                cell: (row) => (
                    <button
                        type="button"
                        onClick={() => handleOrderClick(row.id)}
                        className="font-medium text-black hover:underline"
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
                    const text = getProductNames(row).join(", ");
                    return text ? <span className="text-sm">{text}</span> : <span className="text-sm text-muted-foreground">-</span>;
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
                    if (!status) return <span className="text-sm text-muted-foreground">—</span>;
                    return (
                        <StatusBadge className="w-34" variant={returnStatusVariant(status)}>
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
                    <div className="flex items-center justify-center text-muted-foreground">
                        <div className="group relative inline-flex">
                            <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center"
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
        [getProductNames, handleOrderClick, openReturnDetails, returnStatusVariant]
    );

    const columns = orderView === "all" ? allOrdersColumns : returnRequestsColumns;

    const viewCopy =
        orderView === "all"
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
                  cardDescription: "Manage all B2C Return Requests orders from a centralized location",
                  searchPlaceholder: "Search by order ID, customer name, or product",
                  emptyMessage: "No results found. Try resetting your filters or adjusting your search.",
              };

    return (
        <div className="space-y-6">
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

            <div>
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">Order Management System</h1>
                    <p className="text-sm text-muted-foreground">{viewCopy.pageSubtitle}</p>
                </div>
                <div className="mt-3 flex justify-end">
                    <div className="flex h-[39px] w-[238px] items-center rounded-full bg-[#E5E5E5] p-1">
                        <button
                            type="button"
                            onClick={() => setOrderView("all")}
                            className={
                                orderView === "all"
                                    ? "flex-1 rounded-full bg-white p-2 text-center text-xs font-medium text-foreground shadow-sm"
                                    : "flex-1 rounded-full p-1 text-center text-xs font-medium text-muted-foreground"
                            }
                        >
                            All Orders
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderView("returns")}
                            className={
                                orderView === "returns"
                                    ? "flex-1 rounded-full bg-white p-2 text-center text-xs font-medium text-foreground shadow-sm"
                                    : "flex-1 rounded-full p-1 text-center text-xs font-medium text-muted-foreground"
                            }
                        >
                            Return Requests
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                <KPICard
                    title="Total Orders"
                    value={String(totalOrders)}
                    icon={<KpiOrdersBagIcon />}
                />
                <KPICard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                    icon={<KpiTotalRevenueIcon />}
                    variant="success"
                />
                <KPICard
                    title="Pending Orders"
                    value={String(pendingOrders)}
                    icon={<KpiPendingOrdersIcon />}
                    variant="warning"
                />
                <KPICard
                    title="Delivered"
                    value={String(deliveredOrders)}
                    icon={<KpiDeliveredOrdersIcon />}
                    variant="accent"
                />
                <KPICard
                    title="Return & Exchanges"
                    value={String(returnOrders)}
                    icon={<KpiReturnUndoIcon />}
                />
            </div>

            <Card className="overflow-hidden">
                <div className="bg-[#F9FAF9] px-6 pt-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-1">
                            <div className="mt-0.5">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.168 3.33203H5.83464C4.91416 3.33203 4.16797 4.07822 4.16797 4.9987V15.832C4.16797 16.7525 4.91416 17.4987 5.83464 17.4987H14.168C15.0884 17.4987 15.8346 16.7525 15.8346 15.832V4.9987C15.8346 4.07822 15.0884 3.33203 14.168 3.33203Z" stroke="black" />
                                    <path d="M7.5 7.5H12.5M7.5 10.8333H12.5M7.5 14.1667H10.8333" stroke="black" strokeLinecap="round" />
                                </svg>

                            </div>
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-base">{viewCopy.cardTitle}</CardTitle>
                                <p className="text-sm text-muted-foreground">{viewCopy.cardDescription}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative w-full lg:max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={viewCopy.searchPlaceholder}
                                className="w-full rounded-md border border-input bg-[#E8E9E8] px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Search orders"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {orderView === "all" ? (
                                <AppSelect
                                    placeholder="All Status"
                                    value={statusFilter}
                                    onChange={(value: string) =>
                                        setStatusFilter(value === "all" ? "all" : (value as OrderStatus))
                                    }
                                    options={[
                                        { label: "All Status", value: "all" },
                                        { label: "Pending", value: "Pending" },
                                        { label: "Processing", value: "Processing" },
                                        { label: "Shipped", value: "Shipped" },
                                        { label: "Delivered", value: "Delivered" },
                                        { label: "Returned", value: "Returned" },
                                        { label: "Canceled", value: "Canceled" },
                                    ]}
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
                            />
                        </div>
                    </div>
                </div>

                <CardContent className="bg-[#F9FAF9] pt-4">
                    <DataTable
                        columns={columns}
                        data={paginatedOrders}
                        striped
                        emptyMessage={viewCopy.emptyMessage}
                    />
                    <div className="mt-4">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.setPage}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

