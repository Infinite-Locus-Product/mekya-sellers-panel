"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { TabList } from "@/components/shared/TabList";
import type {
    AllOrder,
    OrderSubtabId,
    ReturnStatus,
    ReturnSubtabId,
} from "@/lib/tableTypes";
import { ORDER_SUBTABS, ORDERS_TAB_SUBTABS, RETURN_SUBTABS } from "@/lib/tableTypes";
import { usePagination } from "@/hooks";
import { presetToDateRange } from "@/lib/dateRangePreset";
import {
    ExchangeDetailsModal,
    type ExchangeDetailsData,
} from "@/app/(pages)/order-management/_components/ExchangeDetailsModal";
import { CustomOrderDetailsModal } from "@/app/(pages)/order-management/_components/CustomOrderDetailsModal";
import {
    CursorPager,
    CustomOrdersKpiGrid,
    OrderManagementKpiGrid,
    OrderShipmentsExpandedRow,
    OrdersCardToolbar,
    ORDER_SUBTAB_LIST_CLASS,
    ORDER_TAB_ITEM_CLASS,
    ORDER_TAB_LIST_CLASS,
    PAGE_TITLE_ORDER_MANAGEMENT,
    SegmentOrderModals,
    getOrderManagementTabs,
    getSegmentViewCopy,
    mapApiCustomOrderRequest,
    mapApiExchangeOrder,
    mapApiCancellation,
    selectSegmentTableColumns,
    useOrderManagementSegmentColumns,
    useOrderManagementSegmentModals,
    getOrderStatusFilterOptions,
    getExchangeStatusFilterOptions,
    getReturnStatusFilterOptions,
    RETURN_TYPE_FILTER_OPTIONS,
    CANCELLATION_TYPE_FILTER_OPTIONS,
    getCustomOrderStatusFilterOptions,
    CUSTOM_ORDER_REQUEST_STATUS_LABEL,
    RETURN_SUBTABS_WITH_PAYMENT_FILTER,
    type CustomOrderRequestKpis,
    type CustomOrderRequestRow,
    type ExchangeOrderRow,
    type CancellationRow,
    type CancellationSubtabId,
    CANCELLATION_SUBTABS,
    type OrderManagementTabId,
    type PaymentStatusFilterValue,
} from "@/app/(pages)/order-management/_components/segment";
import {
    getCustomOrderKPIs,
    getExchangeOrder,
    getOrderInvoice,
    getOrderKpis,
    listCancellations,
    listCancelledItems,
    mapApiCancelledItem,
    type CancelledItemRow,
    listCustomOrderRequests,
    listExchangeOrders,
    listOrders,
    listReturns,
    type CancellationType,
    type CustomOrderRequestStatus,
    type ExchangeOrderStatus,
    type ListOrdersParams,
    type OrderKpis,
    type PipelineStatusFilter,
    type ReturnRequestType,
} from "@/lib/api/orders";

export interface OrderManagementSegmentClientProps {
    initialOrders: AllOrder[];
    segment: "b2c" | "b2b";
}

/** Maps a sortable column's `key` to the /seller/orders `sort_by` value it drives. */
const COLUMN_KEY_TO_SORT_BY: Record<string, NonNullable<ListOrdersParams["sort_by"]>> = {
    date: "created",
    amount: "total",
};
const SORT_BY_TO_COLUMN_KEY: Record<NonNullable<ListOrdersParams["sort_by"]>, string> = {
    created: "date",
    number: "date",
    total: "amount",
};

/** Custom Orders subtabs — sent as-is to GET /seller/orders/custom's `custom_status` param ("all"
 * omits it). "Buyer Declined" and "Rejected" are kept as separate subtabs for clarity even though
 * the backend's `custom_statuses` (plural) param could combine them into one bucket if desired. */
const CUSTOM_ORDER_SUBTABS = [
    // Labels come from CUSTOM_ORDER_REQUEST_STATUS_LABEL, the one source shared with the Status
    // filter and the table badge — the ids stay literal so CustomOrderSubtabId keeps its type.
    { id: "all", label: "All" },
    { id: "pending_review", label: CUSTOM_ORDER_REQUEST_STATUS_LABEL.pending_review },
    {
        id: "awaiting_buyer_confirmation",
        label: CUSTOM_ORDER_REQUEST_STATUS_LABEL.awaiting_buyer_confirmation,
    },
    { id: "buyer_confirmed", label: CUSTOM_ORDER_REQUEST_STATUS_LABEL.buyer_confirmed },
    { id: "buyer_declined", label: CUSTOM_ORDER_REQUEST_STATUS_LABEL.buyer_declined },
    { id: "rejected", label: CUSTOM_ORDER_REQUEST_STATUS_LABEL.rejected },
] as const;
type CustomOrderSubtabId = (typeof CUSTOM_ORDER_SUBTABS)[number]["id"];

/** Maps the Orders subtab to the server-side `pipeline_status` filter (GET /seller/orders). "ready"
 * (labeled "Ready for pickup") maps to the `ready_for_dispatch` code — the backend's own naming —
 * not to the later, seller-set "ready" code, which has no dedicated subtab. "all" sends no filter.
 * "delivered" (labeled "Completed") used to scope via a `statuses` post-filter matching the
 * order's dominant-bucket label (e.g. "Partially Cancelled") — but that label doesn't say whether
 * anything is still outstanding: an order with 3 units cancelled and 2 still being packed reads
 * the exact same "Partially Cancelled" as one that's fully finished. "completed" is a dedicated
 * pipeline_status the backend computes from the full per-shipment breakdown instead. */
const ORDER_SUBTAB_TO_PIPELINE_STATUS: Partial<Record<OrderSubtabId, PipelineStatusFilter>> = {
    pending: "pending",
    processing: "processing",
    ready: "ready_for_dispatch",
    shipped: "shipped",
    delivered: "completed",
};



export function OrderManagementSegmentClient({
    initialOrders,
    segment,
}: Readonly<OrderManagementSegmentClientProps>) {
    const router = useRouter();
    const [orders, setOrders] = useState<AllOrder[]>(initialOrders);
    const [returnOrders, setReturnOrders] = useState<AllOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Returns/Exchanges (B2C "Returns" tab) — server-driven page-based pagination + filters.
    const [returnsPage, setReturnsPage] = useState(1);
    const [returnsPageSize, setReturnsPageSize] = useState(10);
    const [returnsTotal, setReturnsTotal] = useState(0);
    const [returnsTotalPages, setReturnsTotalPages] = useState(1);
    const [returnsRefreshToken, setReturnsRefreshToken] = useState(0);
    const [loadingReturns, setLoadingReturns] = useState(false);

    const [activeTab, setActiveTab] = useState<OrderManagementTabId>("orders");
    const [orderSubtab, setOrderSubtab] = useState<OrderSubtabId>("all");
    // Status filter — shared across Orders/Exchange/Returns/Custom Orders (only one tab's
    // toolbar renders it at a time, with tab/sub-tab-scoped options); Type filter — shared
    // across Returns (Return/Exchange) and Cancellation (Cancelled/RTO); Payment Status —
    // shared across every tab that has one, same "All Payments/Pending/Completed" vocabulary
    // everywhere, persists across tab switches like `dateFilter` already does.
    const [genericStatusFilter, setGenericStatusFilter] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusFilterValue>("all");
    const [returnSubtab, setReturnSubtab] = useState<ReturnSubtabId>("all");
    const [dateFilter, setDateFilter] = useState("all_dates");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<NonNullable<ListOrdersParams["sort_by"]>>("created");
    const [sortDir, setSortDir] = useState<NonNullable<ListOrdersParams["sort_dir"]>>("desc");
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(() => new Set());
    // Exchange rows expand in place too, so assigning a warehouse happens on the listing
    // exactly as it does for an ordinary order — keyed by exchange id, not order id.
    const [expandedExchangeIds, setExpandedExchangeIds] = useState<Set<string>>(() => new Set());
    const [orderKpis, setOrderKpis] = useState<OrderKpis | null>(null);
    // Bumped when a shipment action inside a row's expanded panel (OrderShipmentsExpandedRow)
    // changes an order's status — that panel only refreshes its own local shipment data, so
    // without this the outer row's Order Status/Payment Status columns stay stale until the
    // whole page is reloaded.
    const [ordersRefreshToken, setOrdersRefreshToken] = useState(0);

    // Custom Orders (B2B "Custom Orders" tab) — a distinct API-backed resource (pre-order buyer
    // requests), not AllOrder rows. No search/date query params on this endpoint, so those stay
    // filtered client-side on the fetched page, same as Exchange/Cancellation below.
    const [customOrderRequests, setCustomOrderRequests] = useState<CustomOrderRequestRow[]>([]);
    const [customOrdersTotal, setCustomOrdersTotal] = useState(0);
    const [customOrderKpis, setCustomOrderKpis] = useState<CustomOrderRequestKpis | null>(null);
    const [loadingCustomOrders, setLoadingCustomOrders] = useState(false);
    const [customOrdersRefreshToken, setCustomOrdersRefreshToken] = useState(0);
    const [customOrderSubtab, setCustomOrderSubtab] = useState<CustomOrderSubtabId>("all");

    // Exchange ("Exchange" tab) — a distinct API-backed resource (its own EXC-... id), not a
    // filtered Returns view. The All/Processing/Ready/Shipped/Delivered subtabs are sent as the
    // `status` query param (server-side); search/date have no query params on this endpoint, so
    // those stay filtered client-side on the fetched page.
    const [exchangeOrders, setExchangeOrders] = useState<ExchangeOrderRow[]>([]);
    const [exchangeTotal, setExchangeTotal] = useState(0);
    const [loadingExchange, setLoadingExchange] = useState(false);
    const [exchangeRefreshToken, setExchangeRefreshToken] = useState(0);
    const [exchangeSubtab, setExchangeSubtab] = useState<OrderSubtabId>("all");
    const [exchangeDetailsOpen, setExchangeDetailsOpen] = useState(false);
    const [exchangeDetailsData, setExchangeDetailsData] = useState<ExchangeDetailsData | null>(null);

    // Cancellation ("Cancellation" tab) — a distinct API-backed resource, not the order list filtered
    // by status=Cancelled. No channel/search/date query params either — filtered client-side below.
    const [cancellations, setCancellations] = useState<CancellationRow[]>([]);
    const [cancellationsTotal, setCancellationsTotal] = useState(0);
    const [loadingCancellations, setLoadingCancellations] = useState(false);
    const [cancellationsRefreshToken, setCancellationsRefreshToken] = useState(0);
    /** Which resource the Cancellation tab is showing: whole cancelled orders/RTOs, or
     *  individual cancelled line items. */
    const [cancellationSubtab, setCancellationSubtab] = useState<CancellationSubtabId>("orders");

    // Cancelled Items ("Cancellation" → "Cancelled Items" subtab) — one row per cancelled line
    // item. Unlike /cancellations, this endpoint DOES take search + date query params, so those
    // are sent server-side rather than filtered on the fetched page.
    const [cancelledItems, setCancelledItems] = useState<CancelledItemRow[]>([]);
    const [cancelledItemsTotal, setCancelledItemsTotal] = useState(0);
    const [loadingCancelledItems, setLoadingCancelledItems] = useState(false);
    const [cancelledItemsRefreshToken, setCancelledItemsRefreshToken] = useState(0);

    // Debounce search so the "all" view doesn't refetch on every keystroke.
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Cursor-based pagination for the "all" view (GET /seller/orders). `cursorHistory[i]` is the
    // cursor used to fetch page i; `nextCursor` is the cursor the *next* page would use, from the
    // last response. Both are plain state — appended only from event handlers, never from an effect
    // body or during render, so they can't trigger the cascading-render/ref-during-render lint rules.
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [hasNext, setHasNext] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);

    const handleSortChange = useCallback((key: string, direction: "asc" | "desc") => {
        const nextSortBy = COLUMN_KEY_TO_SORT_BY[key];
        if (!nextSortBy) return;
        setSortBy(nextSortBy);
        setSortDir(direction);
    }, []);

    const showsOrdersList = activeTab === "orders";
    // Memoized (not recomputed as a fresh array every render) so it's a stable useEffect dependency.
    // Real pipeline-label strings (e.g. "Ready for Pickup", "Partially Delivered") straight from
    // getOrderStatusFilterOptions — sent as-is to /seller/orders' `statuses` param, only when the
    // seller has narrowed further via the status filter dropdown. Every subtab (including
    // "Completed") now has its own pipeline_status prefilter — see ORDER_SUBTAB_TO_PIPELINE_STATUS.
    const effectiveStatuses: string[] | undefined = useMemo(() => {
        if (!showsOrdersList) return undefined;
        return genericStatusFilter.length > 0 ? genericStatusFilter : undefined;
    }, [showsOrdersList, genericStatusFilter]);
    // Server-side pipeline-stage filter for the Orders subtab — each distinct value pages
    // independently, so switching subtabs must reset pagination (see allViewFilterKey below).
    const pipelineStatus: PipelineStatusFilter | undefined =
        activeTab === "orders" ? ORDER_SUBTAB_TO_PIPELINE_STATUS[orderSubtab] : undefined;
    // Bucketed Payment Status filter — shared state, reinterpreted per active tab's own
    // payment/settlement vocabulary below.
    const paymentStatusParam: "pending" | "completed" | undefined =
        paymentStatusFilter === "all" ? undefined : paymentStatusFilter;

    // When any filter changes, reset pagination during render (not in an effect) — the
    // React-endorsed way to adjust state in response to other state changing; see
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    const { date_from: allViewDateFrom, date_to: allViewDateTo } = presetToDateRange(dateFilter);
    const allViewFilterKey = JSON.stringify({
        segment,
        activeTab,
        effectiveStatuses,
        pipelineStatus,
        paymentStatusParam,
        debouncedSearch,
        sortBy,
        sortDir,
        date_from: allViewDateFrom,
        date_to: allViewDateTo,
    });
    const [prevAllViewFilterKey, setPrevAllViewFilterKey] = useState(allViewFilterKey);
    if (allViewFilterKey !== prevAllViewFilterKey) {
        setPrevAllViewFilterKey(allViewFilterKey);
        setPageIndex(0);
        setCursorHistory([undefined]);
        setNextCursor(null);
    }

    useEffect(() => {
        if (!showsOrdersList) return;
        // Deferred to a microtask (not a synchronous effect-body call) and guarded by `cancelled`
        // so a slower superseded request can't clobber a faster, newer one's result.
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoading(true);
        });
        listOrders({
            channel: segment,
            cursor: cursorHistory[pageIndex],
            limit: pageSize,
            statuses: effectiveStatuses,
            pipeline_status: pipelineStatus,
            payment_status: paymentStatusParam,
            search: debouncedSearch.trim() || undefined,
            sort_by: sortBy,
            sort_dir: sortDir,
            date_from: allViewDateFrom,
            date_to: allViewDateTo,
        })
            .then(({ orders: fetched, has_next, next_cursor }) => {
                if (cancelled) return;
                setOrders(fetched);
                setHasNext(has_next);
                setNextCursor(next_cursor);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [
        showsOrdersList,
        segment,
        pageIndex,
        pageSize,
        effectiveStatuses,
        pipelineStatus,
        paymentStatusParam,
        debouncedSearch,
        sortBy,
        sortDir,
        allViewDateFrom,
        allViewDateTo,
        cursorHistory,
        ordersRefreshToken,
    ]);

    const showsReturnsList = activeTab === "returns";

    // Real ReturnStatus display labels (e.g. "Defect Check") map 1:1 to backend codes via
    // RETURN_STATUS_TO_API inside listReturns() — no translation needed here.
    const returnStatusesParam: ReturnStatus[] | undefined =
        showsReturnsList && genericStatusFilter.length > 0 ? (genericStatusFilter as ReturnStatus[]) : undefined;
    const returnTypesParam: ReturnRequestType[] | undefined =
        showsReturnsList && typeFilter.length > 0 ? (typeFilter as ReturnRequestType[]) : undefined;
    // Payment Status is only offered (and only sent) on the sub-tabs where a payment outcome can
    // actually exist — see RETURN_SUBTABS_WITH_PAYMENT_FILTER.
    const returnsPaymentStatusParam =
        showsReturnsList && RETURN_SUBTABS_WITH_PAYMENT_FILTER.has(returnSubtab) ? paymentStatusParam : undefined;

    // Reset to page 1 whenever a returns filter changes, during render (not in an effect) —
    // mirrors the "all" view's filter-key reset above.
    const returnsFilterKey = JSON.stringify({
        activeTab,
        returnSubtab,
        returnStatusesParam,
        returnTypesParam,
        returnsPaymentStatusParam,
        debouncedSearch,
        date_from: allViewDateFrom,
        date_to: allViewDateTo,
        segment,
    });
    const [prevReturnsFilterKey, setPrevReturnsFilterKey] = useState(returnsFilterKey);
    if (returnsFilterKey !== prevReturnsFilterKey) {
        setPrevReturnsFilterKey(returnsFilterKey);
        setReturnsPage(1);
    }

    useEffect(() => {
        if (!showsReturnsList) return;
        // Deferred to a microtask (not a synchronous effect-body call) and guarded by `cancelled`
        // so a slower superseded request can't clobber a faster, newer one's result.
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoadingReturns(true);
        });

        listReturns({
            channel: segment,
            tab: returnSubtab === "all" ? undefined : returnSubtab,
            statuses: returnStatusesParam,
            request_types: returnTypesParam,
            payment_status: returnsPaymentStatusParam,
            search: debouncedSearch.trim() || undefined,
            date_from: allViewDateFrom,
            date_to: allViewDateTo,
            page: returnsPage,
            limit: returnsPageSize,
        })
            .then(({ items, total, total_pages }) => {
                if (cancelled) return;
                setReturnOrders(items);
                setReturnsTotal(total);
                setReturnsTotalPages(total_pages);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingReturns(false);
            });
        return () => {
            cancelled = true;
        };
    }, [
        showsReturnsList,
        segment,
        activeTab,
        returnSubtab,
        returnStatusesParam,
        returnTypesParam,
        returnsPaymentStatusParam,
        debouncedSearch,
        allViewDateFrom,
        allViewDateTo,
        returnsPage,
        returnsPageSize,
        returnsRefreshToken,
    ]);

    const isExchangeView = activeTab === "exchange";
    const isCancellationView = activeTab === "cancellation";

    // Real ExchangeOrderStatus codes (lowercase: "ready", "delivered", ...) straight from
    // getExchangeStatusFilterOptions — sent as-is to /seller/orders/exchange's `statuses` param.
    const exchangeStatusesParam: ExchangeOrderStatus[] | undefined =
        isExchangeView && genericStatusFilter.length > 0
            ? (genericStatusFilter as ExchangeOrderStatus[])
            : undefined;
    const exchangePaymentStatusParam = isExchangeView ? paymentStatusParam : undefined;

    // Offset pagination for the Exchange tab (GET /seller/orders/exchange).
    const exchangePagination = usePagination({ totalCount: exchangeTotal, pageSize: 20 });
    const setExchangePageRef = useRef(exchangePagination.setPage);
    useEffect(() => {
        setExchangePageRef.current = exchangePagination.setPage;
    }, [exchangePagination.setPage]);
    useEffect(() => {
        setExchangePageRef.current(1);
    }, [
        debouncedSearch,
        allViewDateFrom,
        allViewDateTo,
        exchangeSubtab,
        exchangeStatusesParam,
        exchangePaymentStatusParam,
    ]);

    useEffect(() => {
        if (!isExchangeView) return;
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoadingExchange(true);
        });
        listExchangeOrders({
            // "pending" is a real bucket now — a QC-passed exchange sits there until its
            // shipment is created — so it must filter rather than fall through to "all".
            status: exchangeStatusesParam
                ? undefined
                : exchangeSubtab === "all"
                  ? undefined
                  : exchangeSubtab,
            statuses: exchangeStatusesParam,
            payment_status: exchangePaymentStatusParam,
            limit: exchangePagination.pageSize,
            offset: exchangePagination.startIndex,
        })
            .then(({ items, total }) => {
                if (cancelled) return;
                setExchangeOrders(items.map(mapApiExchangeOrder));
                setExchangeTotal(total);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingExchange(false);
            });
        return () => {
            cancelled = true;
        };
    }, [
        isExchangeView,
        exchangeSubtab,
        exchangeStatusesParam,
        exchangePaymentStatusParam,
        exchangePagination.pageSize,
        exchangePagination.startIndex,
        exchangeRefreshToken,
    ]);

    // Status is filtered server-side (see the effect above); the endpoint has no channel/search/date
    // query params, so those stay filtered client-side on the fetched page.
    const displayedExchangeOrders = useMemo(() => {
        let result = exchangeOrders;
        const q = debouncedSearch.trim().toLowerCase();
        if (q) {
            result = result.filter(
                (r) =>
                    r.id.toLowerCase().includes(q) ||
                    r.originalOrderId.toLowerCase().includes(q) ||
                    r.customerName.toLowerCase().includes(q)
            );
        }
        if (allViewDateFrom || allViewDateTo) {
            result = result.filter((r) => {
                const d = r.createdAt.slice(0, 10);
                if (allViewDateFrom && d < allViewDateFrom) return false;
                if (allViewDateTo && d > allViewDateTo) return false;
                return true;
            });
        }
        return result;
    }, [exchangeOrders, debouncedSearch, allViewDateFrom, allViewDateTo]);

    // Type/Payment Status only apply to the "orders" sub-resource (whole cancelled orders/RTOs)
    // — "items" (individual cancelled lines) has no Cancelled/RTO distinction and no payment
    // concept of its own, so these stay undefined (and the toolbar hides both controls) there.
    const showsCancellationFilters = isCancellationView && cancellationSubtab === "orders";
    const cancellationTypeParam: CancellationType | undefined =
        showsCancellationFilters && typeFilter.length === 1 ? (typeFilter[0] as CancellationType) : undefined;
    const cancellationPaymentStatusParam = showsCancellationFilters ? paymentStatusParam : undefined;

    // Offset pagination for the Cancellation tab (GET /seller/orders/cancellations).
    const cancellationsPagination = usePagination({ totalCount: cancellationsTotal, pageSize: 20 });
    const setCancellationsPageRef = useRef(cancellationsPagination.setPage);
    useEffect(() => {
        setCancellationsPageRef.current = cancellationsPagination.setPage;
    }, [cancellationsPagination.setPage]);
    useEffect(() => {
        setCancellationsPageRef.current(1);
    }, [debouncedSearch, allViewDateFrom, allViewDateTo, cancellationTypeParam, cancellationPaymentStatusParam]);

    useEffect(() => {
        // Guard the subtab too, not just the tab — without it this fired while the
        // Cancelled Items subtab was showing, issuing a wasted /cancellations request.
        if (!isCancellationView || cancellationSubtab !== "orders") return;
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoadingCancellations(true);
        });
        listCancellations({
            type: cancellationTypeParam,
            payment_status: cancellationPaymentStatusParam,
            order_type: segment === "b2b" ? "B2B" : "B2C",
            search: debouncedSearch.trim() || undefined,
            date_from: allViewDateFrom || undefined,
            date_to: allViewDateTo || undefined,
            limit: cancellationsPagination.pageSize,
            offset: cancellationsPagination.startIndex,
        })
            .then(({ items, total }) => {
                if (cancelled) return;
                setCancellations(items.map(mapApiCancellation));
                setCancellationsTotal(total);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingCancellations(false);
            });
        return () => {
            cancelled = true;
        };
    }, [
        isCancellationView,
        cancellationSubtab,
        segment,
        debouncedSearch,
        allViewDateFrom,
        allViewDateTo,
        cancellationTypeParam,
        cancellationPaymentStatusParam,
        cancellationsPagination.pageSize,
        cancellationsPagination.startIndex,
        cancellationsRefreshToken,
    ]);

    // Offset pagination for the Cancelled Items subtab (GET /seller/orders/cancelled-items).
    const cancelledItemsPagination = usePagination({ totalCount: cancelledItemsTotal, pageSize: 20 });
    const setCancelledItemsPageRef = useRef(cancelledItemsPagination.setPage);
    useEffect(() => {
        setCancelledItemsPageRef.current = cancelledItemsPagination.setPage;
    }, [cancelledItemsPagination.setPage]);
    useEffect(() => {
        setCancelledItemsPageRef.current(1);
    }, [debouncedSearch, allViewDateFrom, allViewDateTo]);

    useEffect(() => {
        if (!isCancellationView || cancellationSubtab !== "items") return;
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoadingCancelledItems(true);
        });
        listCancelledItems({
            search: debouncedSearch.trim() || undefined,
            dateFrom: allViewDateFrom || undefined,
            dateTo: allViewDateTo || undefined,
            orderType: segment === "b2b" ? "B2B" : "B2C",
            limit: cancelledItemsPagination.pageSize,
            offset: cancelledItemsPagination.startIndex,
        })
            .then(({ items, total }) => {
                if (cancelled) return;
                setCancelledItems(items.map(mapApiCancelledItem));
                setCancelledItemsTotal(total);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingCancelledItems(false);
            });
        return () => {
            cancelled = true;
        };
    }, [
        isCancellationView,
        cancellationSubtab,
        debouncedSearch,
        allViewDateFrom,
        allViewDateTo,
        segment,
        cancelledItemsPagination.pageSize,
        cancelledItemsPagination.startIndex,
        cancelledItemsRefreshToken,
    ]);

    // Both cancellation lists filter entirely server-side (channel, search, date), so the
    // rows are rendered as received. Filtering here instead would desync them from the
    // server's `total` and make the pager count a page it then hides.
    const displayedCancelledItems = cancelledItems;
    const displayedCancellations = cancellations;

    const isCustomOrdersView = activeTab === "custom";

    // Explicit multi-select takes full priority over the sub-tab's single custom_status — the
    // backend's custom_status/custom_statuses combine as a union, not an override, so sending
    // both at once would search "sub-tab's status OR multi-select's statuses" instead of
    // narrowing within the sub-tab as the filter UI implies.
    const customStatusesParam: CustomOrderRequestStatus[] | undefined =
        isCustomOrdersView && genericStatusFilter.length > 0
            ? (genericStatusFilter as CustomOrderRequestStatus[])
            : undefined;
    const customOrdersPaymentStatusParam = isCustomOrdersView ? paymentStatusParam : undefined;

    // Offset pagination for the Custom Orders tab (GET /seller/orders/custom).
    const customOrdersPagination = usePagination({ totalCount: customOrdersTotal, pageSize: 20 });
    const setCustomOrdersPageRef = useRef(customOrdersPagination.setPage);
    useEffect(() => {
        setCustomOrdersPageRef.current = customOrdersPagination.setPage;
    }, [customOrdersPagination.setPage]);
    useEffect(() => {
        setCustomOrdersPageRef.current(1);
    }, [customOrderSubtab, customStatusesParam, customOrdersPaymentStatusParam]);

    useEffect(() => {
        if (!isCustomOrdersView) return;
        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) setLoadingCustomOrders(true);
        });
        listCustomOrderRequests({
            custom_status: customStatusesParam
                ? undefined
                : customOrderSubtab === "all"
                  ? undefined
                  : (customOrderSubtab as CustomOrderRequestStatus),
            custom_statuses: customStatusesParam,
            payment_status: customOrdersPaymentStatusParam,
            limit: customOrdersPagination.pageSize,
            offset: customOrdersPagination.startIndex,
        })
            .then(({ items, total }) => {
                if (cancelled) return;
                setCustomOrderRequests(items.map(mapApiCustomOrderRequest));
                setCustomOrdersTotal(total);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoadingCustomOrders(false);
            });
        return () => {
            cancelled = true;
        };
    }, [
        isCustomOrdersView,
        customOrderSubtab,
        customStatusesParam,
        customOrdersPaymentStatusParam,
        customOrdersPagination.pageSize,
        customOrdersPagination.startIndex,
        customOrdersRefreshToken,
    ]);

    // Real KPI endpoint covers total/pending-review/awaiting-confirmation/buyer-confirmed (its
    // field names are stale from an older status enum, but the counts match current statuses).
    // It has no declined/rejected count, so that one tile still needs a single combined-status
    // list lookup — 2 calls total instead of the previous 5.
    useEffect(() => {
        if (!isCustomOrdersView) return;
        let cancelled = false;
        Promise.all([
            getCustomOrderKPIs(),
            listCustomOrderRequests({ custom_statuses: ["buyer_declined", "rejected"], limit: 1 }),
        ])
            .then(([kpis, declinedOrRejected]) => {
                if (cancelled) return;
                setCustomOrderKpis({
                    totalRequests: kpis.total_custom_orders,
                    pendingReview: kpis.active_orders,
                    awaitingConfirmation: kpis.pending_info,
                    buyerConfirmed: kpis.completed_orders,
                    declinedOrRejected: declinedOrRejected.total,
                });
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [isCustomOrdersView, customOrdersRefreshToken]);

    // The item KPIs are channel-scoped, so the B2C and B2B pages each report their own
    // figures. Refetched whenever a returns action could change the counts.
    useEffect(() => {
        if (isCustomOrdersView) return;
        let cancelled = false;
        getOrderKpis(segment)
            .then((kpis) => {
                if (!cancelled) setOrderKpis(kpis);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [isCustomOrdersView, segment, returnsRefreshToken]);

    const handleOrderClick = useCallback(
        (orderId: string) => {
            router.push(`/order-management/${orderId}?segment=${segment}`);
        },
        [router, segment]
    );

    const handleInvoice = useCallback((orderId: string) => {
        getOrderInvoice(orderId)
            .then((html) => {
                const win = window.open("", "_blank");
                if (!win) return;
                win.document.open();
                win.document.write(html);
                win.document.close();
            })
            .catch(() => {});
    }, []);

    const handleToggleExchangeExpand = useCallback((exchangeId: string) => {
        setExpandedExchangeIds((prev) => {
            const next = new Set(prev);
            if (next.has(exchangeId)) next.delete(exchangeId);
            else next.add(exchangeId);
            return next;
        });
    }, []);

    const handleToggleOrderExpand = useCallback((orderId: string) => {
        setExpandedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(orderId)) next.delete(orderId);
            else next.add(orderId);
            return next;
        });
    }, []);

    const openExchangeDetails = useCallback((exchangeId: string) => {
        setExchangeDetailsOpen(true);
        setExchangeDetailsData(null);

        getExchangeOrder(exchangeId)
            .then((r) =>
                setExchangeDetailsData({
                    exchangeId: r.exchange_id,
                    returnId: r.return_id,
                    originalOrderId: r.original_order_id,
                    customerName: r.customer_name ?? "—",
                    itemName: r.item_name,
                    sku: r.sku ?? null,
                    replacementItemName: r.replacement_item_name,
                    replacementSku: r.replacement_sku ?? null,
                    status: r.status,
                    trackingNumber: r.tracking_number,
                    courier: r.courier,
                    estimatedDeliveryAt: r.estimated_delivery_at,
                    dispatchedAt: r.dispatched_at,
                    deliveredAt: r.delivered_at,
                    extraPaymentDue: r.extra_payment_due,
                    refundDue: r.refund_due,
                    settlementStatus: r.settlement_status,
                    createdAt: r.created_at,
                })
            )
            .catch(() => {
                setExchangeDetailsOpen(false);
            });
    }, []);

    const {
        returnDetailsOpen,
        setReturnDetailsOpen,
        returnDetailsData,
        setReturnDetailsData,
        customOrderDetailsOpen,
        setCustomOrderDetailsOpen,
        customOrderDetailsData,
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
    } = useOrderManagementSegmentModals({
        onCustomOrderChanged: () => setCustomOrdersRefreshToken((t) => t + 1),
        onReturnChanged: () => setReturnsRefreshToken((t) => t + 1),
    });

    const {
        customOrdersColumns,
        allOrdersColumns,
        b2bAllOrdersColumns,
        returnRequestsColumns,
        exchangeColumns,
        cancellationColumns,
        cancelledItemsColumns,
    } = useOrderManagementSegmentColumns({
        segment,
        openCustomOrderDetails,
        handleOrderClick,
        openReturnDetails,
        openExchangeDetails,
        handleInvoice,
        expandedOrderIds,
        onToggleOrderExpand: handleToggleOrderExpand,
        onToggleExchangeExpand: handleToggleExchangeExpand,
        expandedExchangeIds,
        onExchangeChanged: () => setExchangeRefreshToken((t) => t + 1),
        onCancellationChanged: () => setCancellationsRefreshToken((t) => t + 1),
        onCancelledItemsChanged: () => setCancelledItemsRefreshToken((t) => t + 1),
        onCustomOrderChanged: () => setCustomOrdersRefreshToken((t) => t + 1),
    });

    // "Orders" is fully filtered/sorted/paginated server-side, including the Orders subtab (sent
    // as pipeline_status — see ORDER_SUBTAB_TO_PIPELINE_STATUS). Returns is likewise fully
    // server-driven: filters (status/search/date) and pagination (page/limit) are sent as query
    // params — see the listReturns effect above. Custom Orders/Exchange/Cancellation are distinct
    // API-backed resources, fetched/rendered via their own dedicated DataTable below, not routed
    // through this pipeline at all.
    const displayedOrders = showsReturnsList ? returnOrders : orders;

    const columnSets = useMemo(
        () => ({
            allOrdersColumns,
            b2bAllOrdersColumns,
            returnRequestsColumns,
        }),
        [allOrdersColumns, b2bAllOrdersColumns, returnRequestsColumns]
    );

    const columns = useMemo(
        () => selectSegmentTableColumns(activeTab, segment, columnSets),
        [activeTab, segment, columnSets]
    );

    const viewCopy = useMemo(() => getSegmentViewCopy(segment, activeTab), [segment, activeTab]);
    const tabs = useMemo(() => getOrderManagementTabs(segment), [segment]);

    // Scoped Status/Type filter options for the toolbar — computed per active tab (and, for
    // Status, per sub-tab too) so the toolbar itself stays generic/tab-agnostic.
    const toolbarStatusFilterOptions = useMemo(() => {
        if (showsOrdersList) return getOrderStatusFilterOptions(orderSubtab);
        if (isExchangeView) return getExchangeStatusFilterOptions(exchangeSubtab);
        if (showsReturnsList) return getReturnStatusFilterOptions(returnSubtab);
        if (isCustomOrdersView) return getCustomOrderStatusFilterOptions(customOrderSubtab);
        return undefined;
    }, [showsOrdersList, isExchangeView, showsReturnsList, isCustomOrdersView, orderSubtab, exchangeSubtab, returnSubtab, customOrderSubtab]);

    const toolbarTypeFilterOptions = useMemo(() => {
        if (showsReturnsList) return RETURN_TYPE_FILTER_OPTIONS;
        if (showsCancellationFilters) return CANCELLATION_TYPE_FILTER_OPTIONS;
        return undefined;
    }, [showsReturnsList, showsCancellationFilters]);

    const showsToolbarPaymentStatusFilter =
        showsOrdersList ||
        isExchangeView ||
        isCustomOrdersView ||
        showsCancellationFilters ||
        (showsReturnsList && RETURN_SUBTABS_WITH_PAYMENT_FILTER.has(returnSubtab));

    const handleTabChange = useCallback((tabId: string) => {
        setExpandedOrderIds(new Set());
        setReturnSubtab("all");
        setCustomOrderSubtab("all");
        setOrderSubtab("all");
        setExchangeSubtab("all");
        // Status/Type option lists are tab-specific — a selection made on one tab wouldn't be a
        // valid choice on another (Payment Status is left as-is; its 3-value vocabulary is the
        // same everywhere, matching how `dateFilter` already persists across tab switches).
        setGenericStatusFilter([]);
        setTypeFilter([]);
        setActiveTab(tabId as OrderManagementTabId);
    }, []);

    return (
        <div className="min-w-0 max-w-full space-y-3 min-[1920px]:space-y-4">
            <SegmentOrderModals
                returnDetailsOpen={returnDetailsOpen}
                onReturnDetailsOpenChange={(open) => {
                    setReturnDetailsOpen(open);
                    if (!open) setReturnDetailsData(null);
                }}
                returnDetailsData={returnDetailsData}
                onApproveRequestReturn={handleApproveRequestReturn}
                onAddTrackingReturn={handleAddTrackingReturn}
                onReceiveReturn={handleReceiveReturn}
                onQcPassReturn={handleQcPassReturn}
                onQcFailReturn={handleQcFailReturn}
                onConfirmDefectiveReturn={handleConfirmDefectiveReturn}
                onRejectReturn={handleRejectReturn}
                onShipBackReturn={handleShipBackReturn}
            />
            <ExchangeDetailsModal
                open={exchangeDetailsOpen}
                onOpenChange={(open) => {
                    setExchangeDetailsOpen(open);
                    if (!open) setExchangeDetailsData(null);
                }}
                data={exchangeDetailsData}
            />
            <CustomOrderDetailsModal
                open={customOrderDetailsOpen}
                onOpenChange={setCustomOrderDetailsOpen}
                data={customOrderDetailsData}
                onApprove={handleApproveCustomOrderRequest}
                onReject={handleRejectCustomOrderRequest}
                onBuyerConfirm={handleBuyerConfirmCustomOrderRequest}
                onAddNote={handleAddCustomOrderNote}
                onEditNote={handleEditCustomOrderNote}
                onDeleteNote={handleDeleteCustomOrderNote}
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
                <TabList
                    tabs={tabs}
                    value={activeTab}
                    onValueChange={handleTabChange}
                    variant="muted"
                    className={ORDER_TAB_LIST_CLASS}
                    tabClassName={ORDER_TAB_ITEM_CLASS}
                    aria-label="Order management tabs"
                />
            </div>

            {activeTab === "orders" ? (
                <TabList
                    tabs={[...ORDERS_TAB_SUBTABS]}
                    value={orderSubtab}
                    onValueChange={(id) => {
                        setOrderSubtab(id as OrderSubtabId);
                        setGenericStatusFilter([]);
                    }}
                    variant="segmented"
                    className={ORDER_SUBTAB_LIST_CLASS}
                    aria-label="Order subtabs"
                />
            ) : isExchangeView ? (
                <TabList
                    tabs={[...ORDER_SUBTABS]}
                    value={exchangeSubtab}
                    onValueChange={(id) => {
                        setExchangeSubtab(id as OrderSubtabId);
                        setGenericStatusFilter([]);
                    }}
                    variant="segmented"
                    className={ORDER_SUBTAB_LIST_CLASS}
                    aria-label="Exchange subtabs"
                />
            ) : showsReturnsList ? (
                <TabList
                    tabs={[...RETURN_SUBTABS]}
                    value={returnSubtab}
                    onValueChange={(id) => {
                        setReturnSubtab(id as ReturnSubtabId);
                        setGenericStatusFilter([]);
                    }}
                    variant="segmented"
                    className={ORDER_SUBTAB_LIST_CLASS}
                    aria-label="Return subtabs"
                />
            ) : isCancellationView ? (
                <TabList
                    tabs={[...CANCELLATION_SUBTABS]}
                    value={cancellationSubtab}
                    onValueChange={(id) => setCancellationSubtab(id as CancellationSubtabId)}
                    variant="segmented"
                    className={ORDER_SUBTAB_LIST_CLASS}
                    aria-label="Cancellation subtabs"
                />
            ) : isCustomOrdersView ? (
                <TabList
                    tabs={[...CUSTOM_ORDER_SUBTABS]}
                    value={customOrderSubtab}
                    onValueChange={(id) => {
                        setCustomOrderSubtab(id as CustomOrderSubtabId);
                        setGenericStatusFilter([]);
                    }}
                    variant="segmented"
                    className={ORDER_SUBTAB_LIST_CLASS}
                    aria-label="Custom order subtabs"
                />
            ) : null}

            {isCustomOrdersView ? (
                <CustomOrdersKpiGrid stats={customOrderKpis} />
            ) : (
                <OrderManagementKpiGrid stats={orderKpis} />
            )}

            <Card className="min-w-0 overflow-hidden">
                <OrdersCardToolbar
                    viewCopy={viewCopy}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    statusFilterOptions={toolbarStatusFilterOptions}
                    statusFilter={genericStatusFilter}
                    onStatusFilterChange={setGenericStatusFilter}
                    typeFilterOptions={toolbarTypeFilterOptions}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    showPaymentStatusFilter={showsToolbarPaymentStatusFilter}
                    paymentStatusFilter={paymentStatusFilter}
                    onPaymentStatusFilterChange={setPaymentStatusFilter}
                />

                <CardContent className="min-w-0 bg-[#F9FAF9] px-1.5 pt-2 sm:px-3 sm:pt-3 lg:px-4 min-[1920px]:px-6">
                    {isCustomOrdersView ? (
                        loadingCustomOrders ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DataTable
                                columns={customOrdersColumns}
                                data={customOrderRequests}
                                striped
                                emptyMessage={viewCopy.emptyMessage}
                                pagination={{
                                    currentPage: customOrdersPagination.currentPage,
                                    totalPages: customOrdersPagination.totalPages,
                                    onPageChange: customOrdersPagination.setPage,
                                    pageSize: customOrdersPagination.pageSize,
                                    onPageSizeChange: customOrdersPagination.setPageSize,
                                    totalRowCount: customOrdersTotal,
                                }}
                            />
                        )
                    ) : isExchangeView ? (
                        loadingExchange ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DataTable
                                columns={exchangeColumns}
                                data={displayedExchangeOrders}
                                striped
                                emptyMessage={viewCopy.emptyMessage}
                                getRowId={(row) => row.id}
                                expandedRowIds={expandedExchangeIds}
                                // The replacement is an ordinary order, so its shipments — and the
                                // warehouse/qty panel — render from its ORD- id using the very same
                                // component the orders list expands.
                                renderExpandedRow={(row) =>
                                    row.replacementOrderId ? (
                                        <OrderShipmentsExpandedRow
                                            orderId={row.replacementOrderId}
                                            onOrderChanged={() => setExchangeRefreshToken((t) => t + 1)}
                                        />
                                    ) : null
                                }
                                pagination={{
                                    currentPage: exchangePagination.currentPage,
                                    totalPages: exchangePagination.totalPages,
                                    onPageChange: exchangePagination.setPage,
                                    pageSize: exchangePagination.pageSize,
                                    onPageSizeChange: exchangePagination.setPageSize,
                                    totalRowCount: exchangeTotal,
                                }}
                            />
                        )
                    ) : isCancellationView ? (
                        cancellationSubtab === "items" ? (
                            loadingCancelledItems ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <DataTable
                                    columns={cancelledItemsColumns}
                                    data={displayedCancelledItems}
                                    striped
                                    emptyMessage="No cancelled items match your filters"
                                    pagination={{
                                        currentPage: cancelledItemsPagination.currentPage,
                                        totalPages: cancelledItemsPagination.totalPages,
                                        onPageChange: cancelledItemsPagination.setPage,
                                        pageSize: cancelledItemsPagination.pageSize,
                                        onPageSizeChange: cancelledItemsPagination.setPageSize,
                                        totalRowCount: cancelledItemsTotal,
                                    }}
                                />
                            )
                        ) : loadingCancellations ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DataTable
                                columns={cancellationColumns}
                                data={displayedCancellations}
                                striped
                                emptyMessage={viewCopy.emptyMessage}
                                pagination={{
                                    currentPage: cancellationsPagination.currentPage,
                                    totalPages: cancellationsPagination.totalPages,
                                    onPageChange: cancellationsPagination.setPage,
                                    pageSize: cancellationsPagination.pageSize,
                                    onPageSizeChange: cancellationsPagination.setPageSize,
                                    totalRowCount: cancellationsTotal,
                                }}
                            />
                        )
                    ) : (showsOrdersList ? loading : loadingReturns) ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={displayedOrders}
                            striped
                            emptyMessage={viewCopy.emptyMessage}
                            sortConfig={
                                showsOrdersList ? { key: SORT_BY_TO_COLUMN_KEY[sortBy], direction: sortDir } : undefined
                            }
                            onSortChange={showsOrdersList ? handleSortChange : undefined}
                            getRowId={showsOrdersList ? (row) => row.id : undefined}
                            expandedRowIds={showsOrdersList ? expandedOrderIds : undefined}
                            renderExpandedRow={
                                showsOrdersList
                                    ? (row) => (
                                          <OrderShipmentsExpandedRow
                                              orderId={row.id}
                                              onOrderChanged={() => setOrdersRefreshToken((t) => t + 1)}
                                          />
                                      )
                                    : undefined
                            }
                            pagination={
                                showsReturnsList
                                    ? {
                                          currentPage: returnsPage,
                                          totalPages: returnsTotalPages,
                                          onPageChange: setReturnsPage,
                                          pageSize: returnsPageSize,
                                          onPageSizeChange: (size) => {
                                              setReturnsPageSize(size);
                                              setReturnsPage(1);
                                          },
                                          totalRowCount: returnsTotal,
                                      }
                                    : undefined
                            }
                        />
                    )}
                    {showsOrdersList && !loading ? (
                        <CursorPager
                            pageNumber={pageIndex + 1}
                            hasPrev={pageIndex > 0}
                            hasNext={hasNext}
                            onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
                            onNext={() => {
                                setCursorHistory((prev) =>
                                    prev.length === pageIndex + 1 ? [...prev, nextCursor ?? undefined] : prev
                                );
                                setPageIndex((i) => i + 1);
                            }}
                            pageSize={pageSize}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPageIndex(0);
                                setCursorHistory([undefined]);
                                setNextCursor(null);
                            }}
                            rowCount={displayedOrders.length}
                        />
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
