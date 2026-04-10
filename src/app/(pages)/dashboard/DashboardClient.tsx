"use client";

import { useState, useMemo } from "react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Clock } from "lucide-react";
import {
  KpiSaleTrendIcon,
  KpiRupeeFlowIcon,
  KpiOrdersBagIcon,
  KpiReturnUndoIcon,
} from "@/assets/icons";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { AllOrder, PaymentStatus } from "@/lib/tableTypes";
import { orderStatusToBadgeVariant } from "@/lib/orderStatusBadge";
import { DEFAULT_FILTER_VALUES } from "@/components/shared/Filter";
import type { FilterValues } from "@/components/shared/FilterPanel";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks";
import { SalesAnalyticsModal } from "@/components/modals/sales/SalesAnalyticsModal";
import { AverageOrderValueModal } from "@/components/modals/average-order-value/AverageOrderValueModal";
import { TotalOrdersAnalyticsModal } from "@/components/modals/total-orders/TotalOrdersAnalyticsModal";
import { ReturnOrdersAnalyticsModal } from "@/components/modals";
import { AppSelect } from "@/components/shared/AppSelect";

const PAGE_SIZE = 10;

export interface DashboardClientProps {
  initialOrders: AllOrder[];
}

export function DashboardClient({ initialOrders }: DashboardClientProps) {
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isAverageOrderValueModalOpen, setIsAverageOrderValueModalOpen] = useState(false);
  const [isTotalOrdersModalOpen, setIsTotalOrdersModalOpen] = useState(false);
  const [isReturnOrdersModalOpen, setIsReturnOrdersModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_VALUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("last_30_days");

  const filteredOrders = useMemo(() => {
    let filtered = [...initialOrders];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.vendor.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    if (filters.orderStatus.length > 0) {
      filtered = filtered.filter((order) => filters.orderStatus.includes(order.status));
    }
    if (filters.paymentMethod.length > 0) {
      const paymentMap: Record<string, PaymentStatus> = { card: "Paid", bank_transfer: "Paid", upi: "Paid", cash: "Pending" };
      filtered = filtered.filter((order) =>
        filters.paymentMethod.some((method) => order.paymentStatus === paymentMap[method])
      );
    }
    const minPrice = parseFloat(filters.priceMin) || 0;
    const maxPrice = parseFloat(filters.priceMax) || Infinity;
    filtered = filtered.filter((order) => {
      const amount = parseFloat(order.amount.replace(/[₹,]/g, "")) || 0;
      return amount >= minPrice && amount <= maxPrice;
    });
    return filtered;
  }, [initialOrders, searchQuery, statusFilter, filters]);

  const pagination = usePagination({ totalCount: filteredOrders.length, pageSize: PAGE_SIZE });
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
        key: "actions", header: "Actions", cell: () => (
          <Button variant="ghost" size="icon" aria-label="View order">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </Button>
        ),
        align: "center",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Sales"
          value="₹50,000"
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiSaleTrendIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="Average Order Value"
          value="1,546"
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiRupeeFlowIcon />}
          onClick={() => setIsAverageOrderValueModalOpen(true)}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Total Orders"
          value="580"
          change="+102% From Last Month"
          changeType="positive"
          icon={<KpiOrdersBagIcon />}
          onClick={() => setIsTotalOrdersModalOpen(true)}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="Return Orders"
          value="248"
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiReturnUndoIcon />}
          onClick={() => setIsReturnOrdersModalOpen(true)}
          background="linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)"
          image="/kpi/kpi4.png"
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
              <p className="text-sm text-muted-foreground mt-1">View and manage your recent orders with sorting and filtering options</p>
            </div>
          </div>
          <div className="flex items-center gap-2 my-4">
            Filter by Status  <AppSelect
              placeholder="All Status"
              value={statusFilter}
              onChange={(value: string) => setStatusFilter(value)}
              options={[
                { label: "All Status", value: "all" },
                { label: "Completed", value: "Completed" },
                { label: "Pending", value: "Pending" },
                { label: "Canceled", value: "Canceled" },
              ]}
            />
          </div>
        </div>
        <CardContent className="relative pt-4 bg-[#F9FAF9]">
          <div className="relative">
            <DataTable columns={columns} data={paginatedOrders} bodyRowClassName="bg-white" />
          </div>
          <div className="mt-4">
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={pagination.setPage} />
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
