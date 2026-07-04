"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import type {
    AllOrder,
    CustomOrderStatus,
    OrderStatus,
    PaymentStatus,
    ProductInventoryType,
    ReturnStatus,
} from "@/lib/tableTypes";
import { usePagination } from "@/hooks";
import { BulkActionModal } from "@/app/(pages)/order-management/_components/BulkActionModal";
import {
    OrderManagementKpiGrid,
    OrderViewToggle,
    OrdersCardToolbar,
    PAGE_TITLE_ORDER_MANAGEMENT,
    SegmentOrderModals,
    computeKpiStats,
    filterSegmentOrders,
    getOrderViewToggleLabels,
    getSegmentViewCopy,
    selectSegmentTableColumns,
    sliceOrdersForKpis,
    useBulkActionExecuteHandler,
    useOrderManagementSegmentColumns,
    useOrderManagementSegmentModals,
} from "@/app/(pages)/order-management/_components/segment";
import { listOrders } from "@/lib/api/orders";

export interface OrderManagementSegmentClientProps {
    initialOrders: AllOrder[];
    segment: "b2c" | "b2b";
}

export function OrderManagementSegmentClient({
    initialOrders,
    segment,
}: Readonly<OrderManagementSegmentClientProps>) {
    const router = useRouter();
    const [orders, setOrders] = useState<AllOrder[]>(initialOrders);

    useEffect(() => {
        listOrders({ limit: 50 })
            .then(({ orders: fetched }) => setOrders(fetched))
            .catch(() => {});
    }, []);

    const handleOrderClick = useCallback(
        (orderId: string) => {
            router.push(`/order-management/${orderId}?segment=${segment}`);
        },
        [router, segment]
    );

    const {
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
    } = useOrderManagementSegmentModals();

    const { customOrdersColumns, allOrdersColumns, b2bAllOrdersColumns, returnRequestsColumns } =
        useOrderManagementSegmentColumns({
            openCustomOrderDetails,
            handleOrderClick,
            openReturnDetails,
        });

    const [orderView, setOrderView] = useState<"all" | "returns">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [returnStatusFilter, setReturnStatusFilter] = useState<"all" | ReturnStatus>("all");
    const [customOrderStatusFilter, setCustomOrderStatusFilter] = useState<"all" | CustomOrderStatus>(
        "all"
    );
    const [dateFilter, setDateFilter] = useState("all_dates");
    const [inventoryTypeFilter, setInventoryTypeFilter] = useState<"all" | ProductInventoryType>("all");
    const [paymentFilter] = useState<"all" | PaymentStatus>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState<Set<AllOrder>>(() => new Set());
    const [bulkActionOpen, setBulkActionOpen] = useState(false);

    const segmentOrders = useMemo(
        () => orders.filter((o) => (segment === "b2b" ? o.type === "B2B" : o.type === "B2C")),
        [orders, segment]
    );

    const segmentOrdersForKpis = useMemo(
        () => sliceOrdersForKpis(segmentOrders, segment),
        [segment, segmentOrders]
    );

    const kpiStats = useMemo(() => computeKpiStats(segmentOrdersForKpis), [segmentOrdersForKpis]);

    const filteredOrders = useMemo(
        () =>
            filterSegmentOrders({
                segmentOrders,
                segment,
                orderView,
                customOrderStatusFilter,
                returnStatusFilter,
                statusFilter,
                paymentFilter,
                inventoryTypeFilter,
                searchQuery,
            }),
        [
            segmentOrders,
            segment,
            orderView,
            customOrderStatusFilter,
            returnStatusFilter,
            statusFilter,
            paymentFilter,
            inventoryTypeFilter,
            searchQuery,
        ]
    );

    const pagination = usePagination({ totalCount: filteredOrders.length, pageSize: 10 });
    const setPageRef = useRef(pagination.setPage);

    useEffect(() => {
        setPageRef.current = pagination.setPage;
    }, [pagination.setPage]);

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
        setPageRef.current(1);
    }, [
        orderView,
        statusFilter,
        returnStatusFilter,
        customOrderStatusFilter,
        dateFilter,
        inventoryTypeFilter,
        segment,
    ]);

    const columnSets = useMemo(
        () => ({
            customOrdersColumns,
            allOrdersColumns,
            b2bAllOrdersColumns,
            returnRequestsColumns,
        }),
        [customOrdersColumns, allOrdersColumns, b2bAllOrdersColumns, returnRequestsColumns]
    );

    const columns = useMemo(
        () => selectSegmentTableColumns(orderView, segment, columnSets),
        [orderView, segment, columnSets]
    );

    const viewCopy = useMemo(() => getSegmentViewCopy(segment, orderView), [segment, orderView]);
    const orderViewToggleLabels = useMemo(() => getOrderViewToggleLabels(segment), [segment]);

    const clearBulkSelection = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    const handleBulkExecute = useBulkActionExecuteHandler(clearBulkSelection);

    const handleSelectAllOrderView = useCallback(() => {
        setSelectedRows(new Set());
        setReturnStatusFilter("all");
        setCustomOrderStatusFilter("all");
        setOrderView("all");
    }, []);

    const handleSelectReturnsOrderView = useCallback(() => {
        setSelectedRows(new Set());
        setReturnStatusFilter("all");
        setCustomOrderStatusFilter("all");
        setOrderView("returns");
    }, []);

    return (
        <div className="min-w-0 max-w-full space-y-3 min-[1920px]:space-y-4">
            {segment === "b2b" ? (
                <BulkActionModal
                    open={bulkActionOpen}
                    onOpenChange={setBulkActionOpen}
                    selectedOrderIds={Array.from(selectedRows).map((o) => o.id)}
                    onExecute={handleBulkExecute}
                />
            ) : null}
            <SegmentOrderModals
                returnDetailsOpen={returnDetailsOpen}
                onReturnDetailsOpenChange={(open) => {
                    setReturnDetailsOpen(open);
                    if (!open) setReturnDetailsData(null);
                }}
                returnDetailsData={returnDetailsData}
                customOrderDetailsOpen={customOrderDetailsOpen}
                onCustomOrderDetailsOpenChange={(open) => {
                    setCustomOrderDetailsOpen(open);
                    if (!open) setCustomOrderDetailsData(null);
                }}
                customOrderDetailsData={customOrderDetailsData}
            />
            <Breadcrumb
                items={[
                    { label: "Seller Dashboard", href: "/" },
                    { label: "Order Management" },
                ]}
            />

            <div className="flex min-w-0 flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                    <h1 className="text-base font-semibold text-foreground xl:text-lg min-[1920px]:text-2xl">
                        {PAGE_TITLE_ORDER_MANAGEMENT}
                    </h1>
                    <p className="text-[11px] text-muted-foreground min-[1920px]:text-sm">{viewCopy.pageSubtitle}</p>
                </div>
                <OrderViewToggle
                    orderView={orderView}
                    labels={orderViewToggleLabels}
                    onSelectAllView={handleSelectAllOrderView}
                    onSelectReturnsView={handleSelectReturnsOrderView}
                />
            </div>

            <OrderManagementKpiGrid stats={kpiStats} />

            <Card className="min-w-0 overflow-hidden">
                <OrdersCardToolbar
                    segment={segment}
                    orderView={orderView}
                    viewCopy={viewCopy}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    returnStatusFilter={returnStatusFilter}
                    onReturnStatusFilterChange={setReturnStatusFilter}
                    customOrderStatusFilter={customOrderStatusFilter}
                    onCustomOrderStatusFilterChange={setCustomOrderStatusFilter}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    inventoryTypeFilter={inventoryTypeFilter}
                    onInventoryTypeFilterChange={setInventoryTypeFilter}
                    selectedRowCount={selectedRows.size}
                    onBulkActionClick={() => setBulkActionOpen(true)}
                />

                <CardContent className="min-w-0 bg-[#F9FAF9] px-1.5 pt-2 sm:px-3 sm:pt-3 lg:px-4 min-[1920px]:px-6">
                    <DataTable
                        columns={columns}
                        data={paginatedOrders}
                        striped
                        emptyMessage={viewCopy.emptyMessage}
                        selectedRows={orderView === "all" && segment === "b2b" ? selectedRows : undefined}
                        onSelectAll={orderView === "all" && segment === "b2b" ? handleSelectAll : undefined}
                        onSelectRow={orderView === "all" && segment === "b2b" ? handleSelectRow : undefined}
                        pagination={{
                            currentPage: pagination.currentPage,
                            totalPages: pagination.totalPages,
                            onPageChange: pagination.setPage,
                            pageSize: pagination.pageSize,
                            onPageSizeChange: pagination.setPageSize,
                            totalRowCount: filteredOrders.length,
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
