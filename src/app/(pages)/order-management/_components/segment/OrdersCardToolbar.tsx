"use client";

import { Search } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { AppSelect } from "@/components/shared/AppSelect";
import { Button } from "@/components/ui/button";
import { OrderBulkActionToolbarIcon, OrderManagementTableCardIcon } from "@/assets/icons/order-management";
import type {
    CustomOrderStatus,
    OrderStatus,
    ProductInventoryType,
    ReturnStatus,
} from "@/lib/tableTypes";
import type { SegmentViewCopy } from "./viewCopy";
import {
    B2B_CUSTOM_ORDER_STATUS_FILTER_OPTIONS,
    B2B_INVENTORY_TYPE_FILTER_OPTIONS,
    B2B_ORDER_STATUS_FILTER_OPTIONS,
    B2C_ORDER_STATUS_FILTER_OPTIONS,
    B2C_RETURN_STATUS_FILTER_OPTIONS,
    DATE_FILTER_OPTIONS,
    ORDER_FILTER_SELECT_TRIGGER_CLASS,
} from "./constants";

export interface OrdersCardToolbarProps {
    readonly segment: "b2c" | "b2b";
    readonly orderView: "all" | "returns";
    readonly viewCopy: SegmentViewCopy;
    readonly searchQuery: string;
    readonly onSearchQueryChange: (value: string) => void;
    readonly statusFilter: "all" | OrderStatus;
    readonly onStatusFilterChange: (value: "all" | OrderStatus) => void;
    readonly returnStatusFilter: "all" | ReturnStatus;
    readonly onReturnStatusFilterChange: (value: "all" | ReturnStatus) => void;
    readonly customOrderStatusFilter: "all" | CustomOrderStatus;
    readonly onCustomOrderStatusFilterChange: (value: "all" | CustomOrderStatus) => void;
    readonly dateFilter: string;
    readonly onDateFilterChange: (value: string) => void;
    readonly inventoryTypeFilter: "all" | ProductInventoryType;
    readonly onInventoryTypeFilterChange: (value: "all" | ProductInventoryType) => void;
    readonly selectedRowCount: number;
    readonly onBulkActionClick: () => void;
}

export function OrdersCardToolbar({
    segment,
    orderView,
    viewCopy,
    searchQuery,
    onSearchQueryChange,
    statusFilter,
    onStatusFilterChange,
    returnStatusFilter,
    onReturnStatusFilterChange,
    customOrderStatusFilter,
    onCustomOrderStatusFilterChange,
    dateFilter,
    onDateFilterChange,
    inventoryTypeFilter,
    onInventoryTypeFilterChange,
    selectedRowCount,
    onBulkActionClick,
}: Readonly<OrdersCardToolbarProps>) {
    return (
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

            <div className="mt-3 flex min-w-0 flex-col gap-2.5 lg:mt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
                    <div className="relative h-8 min-w-0 w-full min-[1920px]:h-10 lg:max-w-md">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground min-[1920px]:left-3 min-[1920px]:size-4" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            placeholder={viewCopy.searchPlaceholder}
                            className="box-border h-full w-full min-w-0 rounded-[4px] border border-input bg-[#E8E9E8] py-0 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[1920px]:pl-10 min-[1920px]:pr-2 min-[1920px]:text-sm"
                            aria-label="Search orders"
                        />
                    </div>
                    <div className="flex min-w-0 flex-nowrap items-center gap-1 max-[480px]:flex-wrap max-[480px]:gap-x-2 max-[480px]:gap-y-2 sm:gap-1.5 md:gap-2 min-[1920px]:gap-3">
                        {orderView === "all" ? (
                            <AppSelect
                                placeholder="All Status"
                                value={statusFilter}
                                onChange={(value: string) =>
                                    onStatusFilterChange((value as OrderStatus) || "all")
                                }
                                options={
                                    segment === "b2b"
                                        ? Array.from(B2B_ORDER_STATUS_FILTER_OPTIONS)
                                        : Array.from(B2C_ORDER_STATUS_FILTER_OPTIONS)
                                }
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        ) : segment === "b2b" ? (
                            <AppSelect
                                placeholder="All status"
                                value={customOrderStatusFilter}
                                onChange={(value: string) =>
                                    onCustomOrderStatusFilterChange(
                                        value === "all" ? "all" : (value as CustomOrderStatus)
                                    )
                                }
                                options={Array.from(B2B_CUSTOM_ORDER_STATUS_FILTER_OPTIONS)}
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        ) : (
                            <AppSelect
                                placeholder="All status"
                                value={returnStatusFilter}
                                onChange={(value: string) =>
                                    onReturnStatusFilterChange(
                                        value === "all" ? "all" : (value as ReturnStatus)
                                    )
                                }
                                options={Array.from(B2C_RETURN_STATUS_FILTER_OPTIONS)}
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        )}
                        <AppSelect
                            placeholder="All Dates"
                            value={dateFilter}
                            onChange={(value: string) => onDateFilterChange(value)}
                            options={[...DATE_FILTER_OPTIONS]}
                            className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                        />
                        {orderView === "all" && segment === "b2b" ? (
                            <AppSelect
                                placeholder="Inventory Type"
                                value={inventoryTypeFilter}
                                onChange={(value: string) =>
                                    onInventoryTypeFilterChange(
                                        value === "all" ? "all" : (value as ProductInventoryType)
                                    )
                                }
                                options={Array.from(B2B_INVENTORY_TYPE_FILTER_OPTIONS)}
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        ) : null}
                    </div>
                </div>
                {orderView === "all" && segment === "b2b" ? (
                    <div className="flex shrink-0 justify-end lg:pt-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={selectedRowCount === 0}
                            onClick={onBulkActionClick}
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
    );
}
