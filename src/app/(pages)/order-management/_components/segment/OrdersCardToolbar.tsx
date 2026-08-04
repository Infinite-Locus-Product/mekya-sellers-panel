"use client";

import { Search } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { AppSelect } from "@/components/shared/AppSelect";
import { MultiSelectFilter } from "@/components/shared/MultiSelectFilter";
import { Button } from "@/components/ui/button";
import { OrderBulkActionToolbarIcon, OrderManagementTableCardIcon } from "@/assets/icons/order-management";
import type { ProductInventoryType } from "@/lib/tableTypes";
import type { SegmentViewCopy } from "./viewCopy";
import type { OrderManagementTabId } from "./constants";
import {
    B2B_INVENTORY_TYPE_FILTER_OPTIONS,
    DATE_FILTER_OPTIONS,
    ORDER_FILTER_SELECT_TRIGGER_CLASS,
    PAYMENT_STATUS_FILTER_OPTIONS,
    type PaymentStatusFilterValue,
} from "./constants";

export interface OrdersCardToolbarProps {
    readonly segment: "b2c" | "b2b";
    readonly activeTab: OrderManagementTabId;
    readonly viewCopy: SegmentViewCopy;
    readonly searchQuery: string;
    readonly onSearchQueryChange: (value: string) => void;
    readonly dateFilter: string;
    readonly onDateFilterChange: (value: string) => void;
    readonly inventoryTypeFilter: "all" | ProductInventoryType;
    readonly onInventoryTypeFilterChange: (value: "all" | ProductInventoryType) => void;
    readonly selectedRowCount: number;
    readonly onBulkActionClick: () => void;
    /** Scoped Status multi-select — the parent computes the option list per active tab/sub-tab
     * (pipeline stages for Orders/Exchange, ReturnStatus for Returns, custom-order status for
     * Custom Orders). Omit to hide the control entirely (e.g. Cancellation has no Status filter). */
    readonly statusFilterOptions?: ReadonlyArray<{ label: string; value: string }>;
    readonly statusFilter?: string[];
    readonly onStatusFilterChange?: (value: string[]) => void;
    /** Type multi-select — Return/Exchange on the Returns tab, Cancelled/RTO on Cancellation.
     * Omit to hide (e.g. Orders/Exchange/Custom Orders have no Type filter). */
    readonly typeFilterOptions?: ReadonlyArray<{ label: string; value: string }>;
    readonly typeFilter?: string[];
    readonly onTypeFilterChange?: (value: string[]) => void;
    /** Payment Status single-select (All Payments/Pending/Completed) — hidden when false, e.g. on
     * Returns sub-tabs where no request has reached a payment outcome yet. */
    readonly showPaymentStatusFilter?: boolean;
    readonly paymentStatusFilter?: PaymentStatusFilterValue;
    readonly onPaymentStatusFilterChange?: (value: PaymentStatusFilterValue) => void;
}

export function OrdersCardToolbar({
    segment,
    activeTab,
    viewCopy,
    searchQuery,
    onSearchQueryChange,
    dateFilter,
    onDateFilterChange,
    inventoryTypeFilter,
    onInventoryTypeFilterChange,
    selectedRowCount,
    onBulkActionClick,
    statusFilterOptions,
    statusFilter,
    onStatusFilterChange,
    typeFilterOptions,
    typeFilter,
    onTypeFilterChange,
    showPaymentStatusFilter,
    paymentStatusFilter,
    onPaymentStatusFilterChange,
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
                        {statusFilterOptions && onStatusFilterChange ? (
                            <MultiSelectFilter
                                placeholder="Status"
                                options={statusFilterOptions as { label: string; value: string }[]}
                                selected={statusFilter ?? []}
                                onChange={onStatusFilterChange}
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        ) : null}
                        {typeFilterOptions && onTypeFilterChange ? (
                            <MultiSelectFilter
                                placeholder="Type"
                                options={typeFilterOptions as { label: string; value: string }[]}
                                selected={typeFilter ?? []}
                                onChange={onTypeFilterChange}
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        ) : null}
                        <AppSelect
                            placeholder="All Dates"
                            value={dateFilter}
                            onChange={(value: string) => onDateFilterChange(value)}
                            options={[...DATE_FILTER_OPTIONS]}
                            className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                        />
                        {showPaymentStatusFilter && onPaymentStatusFilterChange ? (
                            <AppSelect
                                placeholder="All Payments"
                                value={paymentStatusFilter ?? "all"}
                                onChange={(value: string) =>
                                    onPaymentStatusFilterChange(value as PaymentStatusFilterValue)
                                }
                                options={Array.from(PAYMENT_STATUS_FILTER_OPTIONS)}
                                className={ORDER_FILTER_SELECT_TRIGGER_CLASS}
                            />
                        ) : null}
                        {activeTab === "orders" && segment === "b2b" ? (
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
                {activeTab === "orders" && segment === "b2b" ? (
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
