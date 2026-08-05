"use client";

import { useState, useMemo, useEffect } from "react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Clock, PackageCheck, XCircle } from "lucide-react";
import { KpiSaleTrendIcon, KpiOrdersBagIcon, KpiReturnUndoIcon, KpiAverageOrderValueIcon } from "@/assets/icons";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { AllOrder } from "@/lib/tableTypes";
import { orderStatusToBadgeVariant } from "@/lib/orderStatusBadge";
import { usePagination } from "@/hooks";
import { SalesAnalyticsModal } from "@/components/modals/sales/SalesAnalyticsModal";
import { AverageOrderValueModal } from "@/components/modals/average-order-value/AverageOrderValueModal";
import { TotalOrdersAnalyticsModal } from "@/components/modals/total-orders/TotalOrdersAnalyticsModal";
import { ReturnOrdersAnalyticsModal } from "@/components/modals";
import { AppSelect } from "@/components/shared/AppSelect";
import { PieChart, type ChartDataPoint } from "@/components/analytics/PieChart";
import { getSellerAnalytics, type SellerAnalytics } from "@/lib/api/analytics";
import { formatMoney, formatNumber } from "@/lib/utils";
import { presetToDateRange } from "@/lib/dateRangePreset";

const INITIAL_PAGE_SIZE = 10;

/** Pie-slice colors keyed by the exact status strings /seller/analytics returns. */
const ORDER_STATUS_COLORS: Record<string, string> = {
  Fulfilled: "#16A34A",
  Unfulfilled: "#CA8A04",
  "Partially Fulfilled": "#0F766E",
  Unconfirmed: "#2C4FBF",
  Cancelled: "#DC2626",
  Returned: "#C2650C",
};
const FALLBACK_STATUS_COLOR = "#71717A";

export interface DashboardClientProps {
  initialOrders: AllOrder[];
}

export function DashboardClient({ initialOrders }: DashboardClientProps) {
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isAverageOrderValueModalOpen, setIsAverageOrderValueModalOpen] = useState(false);
  const [isTotalOrdersModalOpen, setIsTotalOrdersModalOpen] = useState(false);
  const [isReturnOrdersModalOpen, setIsReturnOrdersModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [channelFilter, setChannelFilter] = useState("all");
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);

  useEffect(() => {
    const { date_from, date_to } = presetToDateRange(dateRange);
    getSellerAnalytics({
      ...(channelFilter === "b2b" || channelFilter === "b2c" ? { channel: channelFilter } : {}),
      ...(date_from ? { date_from } : {}),
      ...(date_to ? { date_to } : {}),
    })
      .then(setAnalytics)
      .catch(() => {});
  }, [dateRange, channelFilter]);

  const kpis = analytics?.kpis;
  const orderStatusBreakdown = analytics?.order_status_breakdown ?? [];
  const returnedOrders = orderStatusBreakdown.find((s) => s.status === "Returned")?.count ?? 0;
  const averageOrderValue =
    kpis && kpis.total_orders > 0
      ? { amount: kpis.total_revenue.amount / kpis.total_orders, currency: kpis.total_revenue.currency }
      : null;
  const orderStatusChartData: ChartDataPoint[] = orderStatusBreakdown.map((s) => ({
    label: s.status,
    value: s.count,
  }));
  const orderStatusChartColors = orderStatusBreakdown.map(
    (s) => ORDER_STATUS_COLORS[s.status] ?? FALLBACK_STATUS_COLOR
  );

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return initialOrders;
    return initialOrders.filter((order) => order.status === statusFilter);
  }, [initialOrders, statusFilter]);

  const pagination = usePagination({
    totalCount: filteredOrders.length,
    pageSize: INITIAL_PAGE_SIZE,
  });
  const paginatedOrders = useMemo(
    () => filteredOrders.slice(pagination.startIndex, pagination.endIndex),
    [filteredOrders, pagination.startIndex, pagination.endIndex]
  );


  const columns: TableColumn<AllOrder>[] = useMemo(
    () => [
      { key: "id", header: "Order ID" },
      { key: "vendor", header: "Vendor Name" },
      { key: "date", header: "Order Date", sortable: true },
      { key: "amount", header: "Total Amount", sortable: true },
      {
        key: "status",
        header: "Order Status",
        cell: (row) => (
          <StatusBadge variant={orderStatusToBadgeVariant(row.status)}>{row.status}</StatusBadge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (row, { isRowMuted, toggleRowMute }) => (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            aria-label={isRowMuted ? `Restore row for order ${row.id}` : `Dim row for order ${row.id}`}
            aria-pressed={isRowMuted}
            onClick={(e) => {
              e.stopPropagation()
              toggleRowMute()
            }}
          >
            <span className="relative inline-flex h-6 w-6 items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
                aria-hidden
              >
                <path
                  d="M12.001 5C5.69398 5 2.63398 10.683 2.09098 11.808C2.06195 11.8678 2.04688 11.9335 2.04688 12C2.04688 12.0665 2.06195 12.1322 2.09098 12.192C2.63298 13.317 5.69298 19 12.001 19C18.309 19 21.368 13.317 21.911 12.192C21.94 12.1322 21.9551 12.0665 21.9551 12C21.9551 11.9335 21.94 11.8678 21.911 11.808C21.369 10.683 18.309 5 12.001 5Z"
                  stroke="#004C5E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="#004C5E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isRowMuted ? (
                <svg
                  className="pointer-events-none absolute inset-0 text-[#004C5E]"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <line
                    x1="4"
                    y1="4"
                    x2="20"
                    y2="20"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </span>
          </Button>
        ),
      },
    ],
    []
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
        <div className="flex items-center gap-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            Channel : <AppSelect
              placeholder="All Channels"
              value={channelFilter}
              onChange={(value: string) => setChannelFilter(value)}
              options={[
                { label: "All Channels", value: "all" },
                { label: "B2B", value: "b2b" },
                { label: "B2C", value: "b2c" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            Date range : <AppSelect
              placeholder="Last 30 days"
              value={dateRange}
              onChange={(value: string) => setDateRange(value)}
              options={[
                { label: "Today", value: "today" },
                { label: "Yesterday", value: "yesterday" },
                { label: "Last 7 days", value: "last_7_days" },
                { label: "Last 30 days", value: "last_30_days" },
                { label: "This Week", value: "this_week" },
                { label: "Last Week", value: "last_week" },
                { label: "This Month", value: "this_month" },
                { label: "Last Month", value: "last_month" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Sales"
          value={kpis ? formatMoney(kpis.total_revenue) : "—"}
          icon={<KpiSaleTrendIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          kpiType={1}
        />
        <KPICard
          title="Average Order Value"
          value={averageOrderValue ? formatMoney(averageOrderValue) : "—"}
          icon={<KpiAverageOrderValueIcon />}
          onClick={() => setIsAverageOrderValueModalOpen(true)}
          kpiType={2}
        />
        <KPICard
          title="Total Orders"
          value={kpis ? formatNumber(kpis.total_orders) : "—"}
          icon={<KpiOrdersBagIcon />}
          onClick={() => setIsTotalOrdersModalOpen(true)}
          kpiType={3}
        />
        <KPICard
          title="Return Orders"
          value={analytics ? formatNumber(returnedOrders) : "—"}
          icon={<KpiReturnUndoIcon />}
          onClick={() => setIsReturnOrdersModalOpen(true)}
          kpiType={4}
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4">
            <CardTitle className="text-base">Order Status Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of orders by fulfillment status for the selected period
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KPICard
                title="Pending Orders"
                value={kpis ? formatNumber(kpis.pending_orders) : "—"}
                icon={<Clock className="text-[#854D0E]" />}
                variant="warning"
              />
              <KPICard
                title="Delivered Orders"
                value={kpis ? formatNumber(kpis.delivered_orders) : "—"}
                icon={<PackageCheck className="text-[#016630]" />}
                variant="success"
              />
              <KPICard
                title="Cancelled Orders"
                value={kpis ? formatNumber(kpis.cancelled_orders) : "—"}
                icon={<XCircle className="text-[#660101]" />}
                variant="error"
              />
            </div>
            {orderStatusChartData.length > 0 ? (
              <PieChart
                data={orderStatusChartData}
                colors={orderStatusChartColors}
                layout="chart-left"
                labelPosition="right"
                showFooter={false}
                showTitle={false}
                compact
                fluid
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No orders in the selected period.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="bg-[#F9FAF9] px-6 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-1">
              <div className="mt-0.5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.2526 6.66667H10.0026V10.8333L13.5693 12.95L14.1693 11.9417L11.2526 10.2083V6.66667ZM10.8359 2.5C8.84681 2.5 6.93916 3.29018 5.53264 4.6967C4.12611 6.10322 3.33594 8.01088 3.33594 10H0.835938L4.13594 13.3583L7.5026 10H5.0026C5.0026 8.4529 5.61719 6.96917 6.71115 5.87521C7.80511 4.78125 9.28884 4.16667 10.8359 4.16667C12.383 4.16667 13.8668 4.78125 14.9607 5.87521C16.0547 6.96917 16.6693 8.4529 16.6693 10C16.6693 11.5471 16.0547 13.0308 14.9607 14.1248C13.8668 15.2188 12.383 15.8333 10.8359 15.8333C9.2276 15.8333 7.76927 15.175 6.71927 14.1167L5.53594 15.3C6.22894 16.0004 7.05455 16.5556 7.96454 16.9334C8.87453 17.3111 9.85067 17.5037 10.8359 17.5C12.8251 17.5 14.7327 16.7098 16.1392 15.3033C17.5458 13.8968 18.3359 11.9891 18.3359 10C18.3359 8.01088 17.5458 6.10322 16.1392 4.6967C14.7327 3.29018 12.8251 2.5 10.8359 2.5Z" fill="#2A2A2A" />
                </svg>
              </div>
              <div className="flex flex-col gap-1"><CardTitle className="text-base">
                Recent Orders
              </CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and manage your recent orders with sorting and filtering options
                </p></div>
            </div>
          </div>
          <div className="flex items-center gap-2 my-4">
            Filter by Status  <AppSelect
              placeholder="All Status"
              value={statusFilter}
              onChange={(value: string) => setStatusFilter(value)}
              options={[
                { label: "All Status", value: "all" },
                { label: "Delivered", value: "Delivered" },
                { label: "Pending", value: "Pending" },
                { label: "Canceled", value: "Canceled" },
              ]}
            />
          </div>
        </div>
        <CardContent className="relative pt-4 bg-[#F9FAF9]">
          <div className="relative">
            <DataTable
              columns={columns}
              data={paginatedOrders}
              bodyRowClassName="bg-white"
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                onPageChange: pagination.setPage,
                pageSize: pagination.pageSize,
                onPageSizeChange: pagination.setPageSize,
                totalRowCount: filteredOrders.length,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <SalesAnalyticsModal open={isSalesModalOpen} onOpenChange={setIsSalesModalOpen} />
      <AverageOrderValueModal
        open={isAverageOrderValueModalOpen}
        onOpenChange={setIsAverageOrderValueModalOpen}
      />
      <TotalOrdersAnalyticsModal open={isTotalOrdersModalOpen} onOpenChange={setIsTotalOrdersModalOpen} />
      <ReturnOrdersAnalyticsModal open={isReturnOrdersModalOpen} onOpenChange={setIsReturnOrdersModalOpen} />
    </div>
  );
}
