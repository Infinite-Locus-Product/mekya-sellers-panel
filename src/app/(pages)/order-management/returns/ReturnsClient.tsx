"use client";

import { useState, useMemo } from "react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import { AppSelect } from "@/components/shared/AppSelect";
import {
  FilterPanel,
  FilterIcon,
  ExportDropdown,
  Pagination,
} from "@/components/shared";
import type { FilterValues, FilterConfig } from "@/components/shared/FilterPanel";
import { usePagination } from "@/hooks";
import {
  SalesAnalyticsModal,
  ActiveUsersAnalyticsModal,
  ReturnDetailsModal,
  ReturnTypeIcon,
  ExchangeTypeIcon,
} from "./_components/modals";
import type { ReturnDetailsData } from "./_components/modals";
import type { ReturnItem } from "@/lib/data";
import { Search, RefreshCw, Edit, X } from "lucide-react";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import { getReturnDetails } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  KpiReturnUndoIcon,
  KpiEyeReviewIcon,
  KpiCircleCheckIcon,
  KpiRupeeFlowIcon,
} from "@/assets/icons";

const PAGE_SIZE = 10;

const DEFAULT_RETURNS_FILTER_VALUES: FilterValues = {
  type: [],
  orderStatus: [],
  paymentMethod: [],
  timeRange: "custom_range",
  dateFrom: "",
  dateTo: "",
  priceMin: "0",
  priceMax: "100000",
};

const RETURNS_FILTER_CONFIG: FilterConfig = {
  type: [
    { value: "return", label: "Return" },
    { value: "exchange", label: "Exchange" },
  ],
  orderStatus: [
    { value: "return initiated", label: "Return initiated" },
    { value: "in process", label: "In Process" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ],
  paymentMethod: [],
  showDateRange: true,
  showPriceRange: true,
};

export interface ReturnsClientProps {
  initialReturns: ReturnItem[];
}

function parseRequestDateToTime(dateStr: string): number {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function parseRefundAmount(amountStr: string): number {
  return Number.parseFloat(amountStr.replace(/[₹,]/g, "")) || 0;
}

export function ReturnsClient({ initialReturns }: ReturnsClientProps) {
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState<ReturnDetailsData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReturnItem["orderStatus"]>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ReturnItem["requestType"]>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_RETURNS_FILTER_VALUES);

  const filteredReturns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = initialReturns.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.returnId.toLowerCase().includes(query) ||
        row.orderId.toLowerCase().includes(query) ||
        row.vendor.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || row.orderStatus === statusFilter;
      const matchesType = typeFilter === "all" || row.requestType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    if (filters.orderStatus.length > 0) {
      result = result.filter((row) => filters.orderStatus.includes(row.orderStatus));
    }
    if (filters.type.length > 0) {
      result = result.filter((row) => filters.type.includes(row.requestType));
    }
    if (filters.dateFrom.trim() || filters.dateTo.trim()) {
      result = result.filter((row) => {
        const t = parseRequestDateToTime(row.requestDate);
        if (!t) return true;
        const from = filters.dateFrom.trim()
          ? new Date(filters.dateFrom.split("/").reverse().join("-")).getTime()
          : 0;
        const to = filters.dateTo.trim()
          ? new Date(filters.dateTo.split("/").reverse().join("-")).getTime() + 86400000
          : Number.POSITIVE_INFINITY;
        return t >= from && t <= to;
      });
    }
    const minRefund = parseRefundAmount(filters.priceMin) || 0;
    const maxRefund = Number.isFinite(Number(filters.priceMax)) ? Number(filters.priceMax) : 100000;
    result = result.filter((row) => {
      const amount = parseRefundAmount(row.refundAmount);
      return amount >= minRefund && amount <= maxRefund;
    });
    return result;
  }, [initialReturns, searchQuery, statusFilter, typeFilter, filters]);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.orderStatus.length > 0) labels.push("Order status");
    if (filters.type.length > 0) labels.push("Type");
    if (filters.dateFrom?.trim() || filters.dateTo?.trim()) labels.push("Date range");
    if (
      filters.priceMin !== DEFAULT_RETURNS_FILTER_VALUES.priceMin ||
      filters.priceMax !== DEFAULT_RETURNS_FILTER_VALUES.priceMax
    ) {
      labels.push("Refund range");
    }
    return labels;
  }, [filters]);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const pagination = usePagination({ totalCount: filteredReturns.length, pageSize: PAGE_SIZE });
  const paginatedReturns = useMemo(
    () => filteredReturns.slice(pagination.startIndex, pagination.endIndex),
    [filteredReturns, pagination.startIndex, pagination.endIndex]
  );

  const openDetailsModal = async (row: ReturnItem) => {
    const details = await getReturnDetails(row.returnId);
    setSelectedReturnDetails(details ?? null);
    setIsDetailsModalOpen(true);
  };

  const handleExportPDF = () => {
    // TODO: implement PDF export for current view/filtered returns
  };
  const handleExportCSV = () => {
    // TODO: implement CSV export for current view/filtered returns
  };

  const columns: TableColumn<ReturnItem>[] = [
    {
      key: "returnId",
      header: "Return ID",
      cell: (row) => (
        <button
          type="button"
          onClick={() => openDetailsModal(row)}
          className="text-primary underline-offset-4 hover:underline font-medium"
        >
          {row.returnId}
        </button>
      ),
    },
    { key: "orderId", header: "Order ID" },
    { key: "vendor", header: "Vendor Name" },
    { key: "requestDate", header: "Request Date", sortable: true },
    { key: "refundAmount", header: "Refund Amount", sortable: true },
    {
      key: "orderStatus",
      header: "Order Status",
      cell: (row) => {
        const statusMap: Record<string, StatusVariant> = {
          "in process": "processing",
          "return initiated": "pending",
          rejected: "canceled",
          completed: "delivered",
        };
        return (
          <StatusBadge variant={statusMap[row.orderStatus] ?? "pending"}>
            {row.orderStatus}
          </StatusBadge>
        );
      },
    },
    {
      key: "requestType",
      header: "Request Type",
      cell: (row) => (
        <span className="flex items-center gap-1.5 capitalize">
          {String(row.requestType).toLowerCase() === "return" ? (
            <ReturnTypeIcon />
          ) : (
            <ExchangeTypeIcon />
          )}
          {row.requestType}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="icon" aria-label="Edit return">
          <Edit className="h-4 w-4" aria-hidden />
        </Button>
      ),
      align: "center",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Seller Dashboard", href: "/" },
          { label: "Order Management", href: "/order-management" },
          { label: "Returns & Exchanges" },
        ]}
      />
      <div>
        <div className="flex items-start flex-col mb-2">
          <h1 className="text-xl font-semibold text-foreground">All Orders</h1>
          <p>Manage all B2B and B2C orders across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Returns"
          value="284"
          change="All Time"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiReturnUndoIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="Pending Review"
          value="52"
          change="Needs Attention"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiEyeReviewIcon />}
          onClick={() => setIsActiveUsersModalOpen(true)}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Completed"
          value="163"
          change="Resolved"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiCircleCheckIcon />}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="Total Refund"
          value="₹50,000"
          change="Needs Attention"
          changeType="negative"
          changeDisplay="text"
          icon={<KpiRupeeFlowIcon />}
          background="linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)"
          image="/kpi/kpi4.png"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" aria-hidden />
              Return & Exchanges
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage return requests and exchanges from customers
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  placeholder="Search by return ID, order ID or vendor name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#E8E9E8] rounded-md border border-input px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Search returns"
                />
              </div>
              <AppSelect
                placeholder="All Status"
                value={statusFilter}
                onChange={(value: string) => setStatusFilter(value as "all" | ReturnItem["orderStatus"])}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Return initiated", value: "return initiated" },
                  { label: "In Process", value: "in process" },
                  { label: "Completed", value: "completed" },
                  { label: "Rejected", value: "rejected" },
                ]}
                className="w-[180px] bg-[#E8E9E8]"
              />
              <AppSelect
                placeholder="All Type"
                value={typeFilter}
                onChange={(value: string) => setTypeFilter(value as "all" | ReturnItem["requestType"])}
                options={[
                  { label: "All Type", value: "all" },
                  { label: "Return", value: "return" },
                  { label: "Exchange", value: "exchange" },
                ]}
                className="w-[180px] bg-[#E8E9E8]"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    "gap-2 bg-[#E8E9E8] border-0 text-[#000000] shadow-none hover:bg-[#dfe1df] hover:border-0"
                  )}
                >
                  <FilterIcon className="h-4 w-4" aria-hidden />
                  Filters
                </Button>
                {isFilterOpen && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFilterOpen(false)}
                    aria-label="Close filter"
                    className="bg-[#E8E9E8] border-0 text-[#000000] shadow-none hover:bg-[#dfe1df]"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </Button>
                )}
                {hasActiveFilters && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap" aria-live="polite">
                    ({activeFilterLabels.join(", ")} applied)
                  </span>
                )}
              </div>
              <ExportDropdown
                onExportPDF={handleExportPDF}
                onExportCSV={handleExportCSV}
                variant="outline"
                size="lg"
                className="bg-white border-0 shadow-none hover:bg-gray-50 hover:border-0 gap-2"
              />
            </div>
          </div>

          <div className="relative">
            <DataTable columns={columns} data={paginatedReturns} />
            <FilterPanel
              key={isFilterOpen ? "open" : "closed"}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              onReset={() => setFilters(DEFAULT_RETURNS_FILTER_VALUES)}
              onApply={() => setIsFilterOpen(false)}
              filters={filters}
              onFilterChange={(partial) => setFilters((prev) => ({ ...prev, ...partial }))}
              config={RETURNS_FILTER_CONFIG}
              showCloseButton={false}
              resetAsLink
            />
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          </div>
        </CardContent>
      </Card>

      <SalesAnalyticsModal open={isSalesModalOpen} onOpenChange={setIsSalesModalOpen} />
      <ActiveUsersAnalyticsModal open={isActiveUsersModalOpen} onOpenChange={setIsActiveUsersModalOpen} />
      <ReturnDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        data={selectedReturnDetails}
      />
    </div>
  );
}
