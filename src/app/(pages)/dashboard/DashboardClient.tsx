"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { Clock, Eye, Search } from "lucide-react";
import {
  ArrowExternalIcon,
  KpiSaleTrendIcon,
  KpiOrdersBagIcon,
  KpiReturnUndoIcon,
  KpiAverageOrderValueIcon,
} from "@/assets/icons";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { CursorPager } from "@/components/shared/CursorPager";
import type { AllOrder } from "@/lib/tableTypes";
import { PIPELINE_STATUS_LABELS } from "@/lib/tableTypes";
import { useServerTableSort, type SortColumnBinding } from "@/hooks";
import { SalesAnalyticsModal } from "@/components/modals/sales/SalesAnalyticsModal";
import { AverageOrderValueModal } from "@/components/modals/average-order-value/AverageOrderValueModal";
import { TotalOrdersAnalyticsModal } from "@/components/modals/total-orders/TotalOrdersAnalyticsModal";
import { ReturnOrdersAnalyticsModal } from "@/components/modals";
import { AppSelect } from "@/components/shared/AppSelect";
import { MultiSelectFilter } from "@/components/shared/MultiSelectFilter";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  CustomDateRangeSelector,
  getDefaultDateRange,
  toDateRangePayload,
  type DateRangeApiPayload,
  type DateRangeValue,
} from "@/components/shared/custom-date-range";
import { getSellerAnalytics, type SellerAnalytics } from "@/lib/api/analytics";
import {
  formatTrend,
  percentChange,
  periodKey,
  previousPeriod,
  trendChangeType,
} from "@/lib/kpiTrend";
import { listOrders, getReturnsKpis, type ListOrdersParams, type ReturnsKpis } from "@/lib/api/orders";
import { formatMoney, formatNumber } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 400;

type OrderSortField = "created" | "total";

const ORDER_SORT_BINDINGS: SortColumnBinding[] = [
  { columnKey: "date", sortField: "created", initialOrder: "DESC" },
  { columnKey: "amount", sortField: "total", initialOrder: "DESC" },
];

export function DashboardClient() {
  const router = useRouter();
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isAverageOrderValueModalOpen, setIsAverageOrderValueModalOpen] = useState(false);
  const [isTotalOrdersModalOpen, setIsTotalOrdersModalOpen] = useState(false);
  const [isReturnOrdersModalOpen, setIsReturnOrdersModalOpen] = useState(false);
  /** Empty = no status filter. Sent as repeated ?statuses= params, which the backend ORs. */
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultDateRange);
  const [dateRangePayload, setDateRangePayload] = useState<DateRangeApiPayload>(() =>
    toDateRangePayload(getDefaultDateRange())
  );
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [returnsKpis, setReturnsKpis] = useState<ReturnsKpis | null>(null);
  // Same two endpoints, fetched for the preceding equal-length window, so the KPI cards can
  // show a period-over-period trend. Both are already date-range scoped, so this needs no new
  // API surface — see lib/kpiTrend.ts.
  // Each baseline is stored with the period key it was fetched for. A trend is only derived when
  // that key matches the current previous-period — so a range change can't briefly pair the new
  // value against the old baseline, and no state has to be cleared inside the effect.
  const [prevAnalytics, setPrevAnalytics] =
    useState<{ key: string; data: SellerAnalytics } | null>(null);
  const [prevReturnsKpis, setPrevReturnsKpis] =
    useState<{ key: string; data: ReturnsKpis } | null>(null);
  const [orders, setOrders] = useState<AllOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const ordersGenerationRef = useRef(0);

  // Cursor-based pagination for GET /seller/orders — mirrors the pattern in
  // OrderManagementSegmentClient.tsx. `cursorHistory[i]` is the cursor used to fetch page i.
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([undefined]);

  const {
    sortBy,
    sortOrder,
    serverSortKey,
    serverSortDirection,
    handleServerSortColumn,
  } = useServerTableSort(ORDER_SORT_BINDINGS, { sortBy: "created", sortOrder: "DESC" });

  useEffect(() => {
    let cancelled = false;
    // Annotated: without it the extracted object widens `channel` to plain `string`, which the
    // endpoint params reject.
    const channelParam: { channel?: "b2b" | "b2c" } =
      channelFilter === "b2b" || channelFilter === "b2c" ? { channel: channelFilter } : {};
    getSellerAnalytics({
      ...channelParam,
      date_from: dateRangePayload.start_date,
      date_to: dateRangePayload.end_date,
    })
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch(() => {});
    const prev = previousPeriod(dateRangePayload);
    if (prev) {
      const key = periodKey(prev, channelFilter);
      getSellerAnalytics({ ...channelParam, date_from: prev.start_date, date_to: prev.end_date })
        .then((data) => {
          if (!cancelled) setPrevAnalytics({ key, data });
        })
        // A missing baseline just means no trend pill — never block the card's own value.
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [channelFilter, dateRangePayload]);

  // Real return-request count (not orders whose overall status happens to be "Returned" —
  // a return can be filed and in progress well before the parent order's own status ever
  // reflects it), so this matches the same number the expanded Returns modal shows.
  useEffect(() => {
    let cancelled = false;
    // Annotated: without it the extracted object widens `channel` to plain `string`, which the
    // endpoint params reject.
    const channelParam: { channel?: "b2b" | "b2c" } =
      channelFilter === "b2b" || channelFilter === "b2c" ? { channel: channelFilter } : {};
    getReturnsKpis({
      ...channelParam,
      date_from: dateRangePayload.start_date,
      date_to: dateRangePayload.end_date,
    })
      .then((data) => {
        if (!cancelled) setReturnsKpis(data);
      })
      .catch(() => {});
    const prev = previousPeriod(dateRangePayload);
    if (prev) {
      const key = periodKey(prev, channelFilter);
      getReturnsKpis({ ...channelParam, date_from: prev.start_date, date_to: prev.end_date })
        .then((data) => {
          if (!cancelled) setPrevReturnsKpis({ key, data });
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [channelFilter, dateRangePayload]);

  const kpis = analytics?.kpis;
  const expectedPrevKey = (() => {
    const prev = previousPeriod(dateRangePayload);
    return prev ? periodKey(prev, channelFilter) : null;
  })();
  const prevKpis =
    expectedPrevKey && prevAnalytics?.key === expectedPrevKey ? prevAnalytics.data.kpis : undefined;
  const matchedPrevReturns =
    expectedPrevKey && prevReturnsKpis?.key === expectedPrevKey ? prevReturnsKpis.data : undefined;
  /** Average order value for a period, or null when it had no orders to divide by. */
  const aovAmount = (k: typeof kpis) =>
    k && k.total_orders > 0 ? k.total_revenue.amount / k.total_orders : null;
  const salesTrend = kpis && prevKpis
    ? percentChange(kpis.total_revenue.amount, prevKpis.total_revenue.amount)
    : null;
  const ordersTrend = kpis && prevKpis
    ? percentChange(kpis.total_orders, prevKpis.total_orders)
    : null;
  const currentAov = aovAmount(kpis);
  const previousAov = aovAmount(prevKpis);
  const aovTrend =
    currentAov !== null && previousAov !== null ? percentChange(currentAov, previousAov) : null;
  const returnsTrend = returnsKpis && matchedPrevReturns
    ? percentChange(returnsKpis.total_returns, matchedPrevReturns.total_returns)
    : null;
  const averageOrderValue =
    kpis && kpis.total_orders > 0
      ? { amount: kpis.total_revenue.amount / kpis.total_orders, currency: kpis.total_revenue.currency }
      : null;

  const handleDateRangeChange = (range: DateRangeValue, payload: DateRangeApiPayload) => {
    setDateRange(range);
    setDateRangePayload(payload);
  };

  // Debounce search input
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      queueMicrotask(() => setDebouncedSearch(""));
      return;
    }
    const t = window.setTimeout(() => setDebouncedSearch(trimmed), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // Any filter/sort/date change invalidates the cursor chain — reset pagination during render
  // (not in an effect), same pattern as OrderManagementSegmentClient.tsx.
  const filterKey = JSON.stringify({
    channelFilter,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
    date_from: dateRangePayload.start_date,
    date_to: dateRangePayload.end_date,
  });
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPageIndex(0);
    setCursorHistory([undefined]);
    setNextCursor(null);
  }

  const listQuery = useMemo((): ListOrdersParams => {
    const q: ListOrdersParams = {
      limit: pageSize,
      cursor: cursorHistory[pageIndex],
      sort_by: sortBy as OrderSortField,
      sort_dir: sortOrder.toLowerCase() as "asc" | "desc",
      date_from: dateRangePayload.start_date,
      date_to: dateRangePayload.end_date,
    };
    if (channelFilter === "b2b" || channelFilter === "b2c") q.channel = channelFilter;
    if (statusFilter.length > 0) q.statuses = statusFilter;
    if (debouncedSearch) q.search = debouncedSearch;
    return q;
  }, [
    channelFilter,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
    dateRangePayload,
    pageSize,
    cursorHistory,
    pageIndex,
  ]);

  useEffect(() => {
    ordersGenerationRef.current += 1;
    const generation = ordersGenerationRef.current;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setOrdersLoading(true);
    });
    listOrders(listQuery)
      .then((res) => {
        if (cancelled || generation !== ordersGenerationRef.current) return;
        setOrders(res.orders);
        setHasNext(res.has_next);
        setNextCursor(res.next_cursor);
        setOrdersLoading(false);
      })
      .catch(() => {
        if (cancelled || generation !== ordersGenerationRef.current) return;
        setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listQuery]);

  const handleOrderClick = useCallback(
    (row: AllOrder) => {
      router.push(`/order-management/${encodeURIComponent(row.id)}`);
    },
    [router]
  );

  // No `align` on most columns: DataTable centres headers and cells by default, so setting it
  // here too would just be a second copy of the same decision.
  const columns: TableColumn<AllOrder>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Order ID",
        cell: (row) => (
          <button
            type="button"
            onClick={() => handleOrderClick(row)}
            className="text-black hover:underline font-medium cursor-pointer"
          >
            {row.id}
          </button>
        ),
      },
      { key: "vendor", header: "Customer Name" },
      { key: "date", header: "Order Date", sortable: true },
      { key: "amount", header: "Total Amount", sortable: true },
      {
        key: "status",
        header: "Order Status",
        // Same badge as the Orders page. This used to key off the raw `status` label via a
        // map of the 9 Saleor-native strings, so pipeline-derived labels it didn't list —
        // "Partially Cancelled", "Ready for Pickup", "Processing" — silently fell back to
        // the "unfulfilled" colour and disagreed with the Orders table for the same order.
        cell: (row) => <OrderStatusBadge order={row} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (row) => (
          <Button variant="ghost" size="icon" aria-label="View order" onClick={() => handleOrderClick(row)}>
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [handleOrderClick]
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Seller Dashboard", href: "/" },
          { label: "Dashboard" },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-foreground mb-2">Key Performance Summary</h1>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <AppSelect
            placeholder="All Channels"
            value={channelFilter}
            onChange={(value: string) => setChannelFilter(value)}
            options={[
              { label: "All Channels", value: "all" },
              { label: "B2B", value: "b2b" },
              { label: "B2C", value: "b2c" },
            ]}
          />
          <CustomDateRangeSelector value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Sales"
          value={kpis ? formatMoney(kpis.total_revenue) : "—"}
          icon={<KpiSaleTrendIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          kpiType={1}
          {...(formatTrend(salesTrend) ? {
            change: formatTrend(salesTrend) as string,
            changeType: trendChangeType(salesTrend),
          } : {})}
        />
        <KPICard
          title="Average Order Value"
          value={averageOrderValue ? formatMoney(averageOrderValue) : "—"}
          icon={<KpiAverageOrderValueIcon />}
          onClick={() => setIsAverageOrderValueModalOpen(true)}
          kpiType={2}
          {...(formatTrend(aovTrend) ? {
            change: formatTrend(aovTrend) as string,
            changeType: trendChangeType(aovTrend),
          } : {})}
        />
        <KPICard
          title="Total Orders"
          value={kpis ? formatNumber(kpis.total_orders) : "—"}
          icon={<KpiOrdersBagIcon />}
          onClick={() => setIsTotalOrdersModalOpen(true)}
          kpiType={3}
          {...(formatTrend(ordersTrend) ? {
            change: formatTrend(ordersTrend) as string,
            changeType: trendChangeType(ordersTrend),
          } : {})}
        />
        <KPICard
          title="Returns"
          value={returnsKpis ? formatNumber(returnsKpis.total_returns) : "—"}
          icon={<KpiReturnUndoIcon />}
          onClick={() => setIsReturnOrdersModalOpen(true)}
          kpiType={4}
          {...(formatTrend(returnsTrend) ? {
            change: formatTrend(returnsTrend) as string,
            changeType: trendChangeType(returnsTrend),
          } : {})}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="bg-[#F9FAF9] px-6 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor your incoming orders in real-time
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 mt-4 pb-4">
            <div className="relative min-w-[220px] flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <input
                type="search"
                placeholder="Search by order ID or customer name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                // Explicit `h-10` rather than vertical padding, so the status filter beside it
                // can match this height exactly instead of having to re-derive it from
                // padding + line-height.
                className="h-10 w-full rounded-md border border-input bg-[#E8E9E8] px-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search orders"
              />
            </div>
            {/* Built from the shared pipeline vocabulary rather than a hand-written subset:
                the original list offered only 3 of the 13 real statuses, and spelled one of
                them "Canceled" — the backend label is "Cancelled", so that option matched
                nothing and always returned an empty table.

                Multi-select, matching the Orders page. There's no explicit "All Status"
                option because an empty selection already means "no status filter" — having
                both would let you select "All Status" *and* "Pending" and have to invent a
                meaning for it.

                Sits directly beside the search box with no "Filter by Status" caption — the
                "All Status" placeholder already says what it filters. `sm:h-10` is needed as
                well as `h-10`: the trigger sets its own `sm:h-8`, and a bare `h-10` would
                only win at the base breakpoint, leaving it shorter than the search box on
                every real viewport. */}
            <MultiSelectFilter
              placeholder="All Status"
              className="h-10 w-44 flex-none sm:h-10"
              options={PIPELINE_STATUS_LABELS.map((label) => ({ label, value: label }))}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
            <Button
              variant="default"
              size="default"
              className="ml-auto shrink-0 bg-primary"
              onClick={() => router.push("/order-management")}
            >
              View All Orders
              <ArrowExternalIcon className="ml-2 h-[11px] w-[11px] shrink-0 text-white" aria-hidden />
            </Button>
          </div>
        </div>
        <CardContent className="relative pt-4 bg-[#F9FAF9]">
          <div className="relative">
            {ordersLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded">
                <LoadingSpinner size="sm" />
              </div>
            )}
            <DataTable
              columns={columns}
              data={orders}
              bodyRowClassName="bg-white"
              onServerSortColumn={handleServerSortColumn}
              serverSortKey={serverSortKey}
              serverSortDirection={serverSortDirection}
            />
          </div>
          {!ordersLoading && (
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
              rowCount={orders.length}
            />
          )}
        </CardContent>
      </Card>

      <SalesAnalyticsModal
        open={isSalesModalOpen}
        onOpenChange={setIsSalesModalOpen}
        dateRangePayload={dateRangePayload}
        channel={channelFilter === "b2b" || channelFilter === "b2c" ? channelFilter : undefined}
      />
      <AverageOrderValueModal
        open={isAverageOrderValueModalOpen}
        onOpenChange={setIsAverageOrderValueModalOpen}
        dateRangePayload={dateRangePayload}
        channel={channelFilter === "b2b" || channelFilter === "b2c" ? channelFilter : undefined}
      />
      <TotalOrdersAnalyticsModal
        open={isTotalOrdersModalOpen}
        onOpenChange={setIsTotalOrdersModalOpen}
        dateRangePayload={dateRangePayload}
      />
      <ReturnOrdersAnalyticsModal
        open={isReturnOrdersModalOpen}
        onOpenChange={setIsReturnOrdersModalOpen}
        dateRangePayload={dateRangePayload}
        channel={channelFilter === "b2b" || channelFilter === "b2c" ? channelFilter : undefined}
      />
    </div>
  );
}
