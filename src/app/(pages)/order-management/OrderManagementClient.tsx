"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { AppSelect } from "@/components/shared/AppSelect";
import {
  OrderManagementFilter,
  DEFAULT_ORDER_FILTER_VALUES,
  type FilterValues,
} from "./_components";
import { Pagination, ExportDropdown } from "@/components/shared";
import { usePagination } from "@/hooks";
import { FileText, Eye, Search } from "lucide-react";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { AllOrder, OrderStatus, PaymentStatus } from "@/lib/tableTypes";
import {
  KpiOrdersBagIcon,
  KpiPendingClipboardIcon,
  KpiRupeeFlowIcon,
  KpiReturnUndoIcon,
} from "@/assets/icons";


const PAGE_SIZE = 10;

export interface OrderManagementClientProps {
  initialOrders: AllOrder[];
}

export function OrderManagementClient({ initialOrders }: OrderManagementClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedRows, setSelectedRows] = useState<Set<AllOrder>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_ORDER_FILTER_VALUES);

  const filteredOrders = useMemo(() => {
    let filtered = [...initialOrders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.vendor.toLowerCase().includes(q)
      );
    }
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((order) => order.type === typeFilter);
    }
    if (filters.orderStatus.length > 0) {
      filtered = filtered.filter((order) => filters.orderStatus.includes(order.status));
    }
    if (filters.paymentMethod.length > 0) {
      const paymentMap: Record<string, PaymentStatus> = {
        card: "Paid",
        upi: "Paid",
        bank_transfer: "Paid",
        cash: "Pending",
      };
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
  }, [initialOrders, searchQuery, statusFilter, typeFilter, filters]);

  const totalPagesComputed = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pageFromUrl = Math.min(
    totalPagesComputed,
    Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)
  );
  const pagination = usePagination({
    totalCount: filteredOrders.length,
    pageSize: PAGE_SIZE,
    initialPage: pageFromUrl,
  });
  const { currentPage, totalPages, setPage } = pagination;

  const syncPageToUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, searchParams, router]
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setPage(1);
      syncPageToUrl(1);
    }
  }, [filteredOrders.length, totalPages, currentPage, setPage, syncPageToUrl]);

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
      syncPageToUrl(page);
    },
    [setPage, syncPageToUrl]
  );

  const paginatedOrders = useMemo(() => {
    const start = pagination.startIndex;
    const end = Math.min(pagination.endIndex, start + PAGE_SIZE);
    return filteredOrders.slice(start, end);
  }, [filteredOrders, pagination.startIndex, pagination.endIndex]);

  const activeFilterLabels = useMemo(() => {
    const d = DEFAULT_ORDER_FILTER_VALUES;
    const labels: string[] = [];
    if (filters.paymentMethod.length > 0) {
      labels.push("Payment method");
    }
    if (filters.dateFrom?.trim() || filters.dateTo?.trim()) {
      labels.push("Date range");
    }
    if (filters.priceMin !== d.priceMin || filters.priceMax !== d.priceMax) {
      labels.push("Price range");
    }
    return labels;
  }, [filters]);

  const hasActiveFilters = activeFilterLabels.length > 0;

  const handleExportPDF = () => {
    // TODO: implement PDF export for current view/filtered orders
  };
  const handleExportCSV = () => {
    // TODO: implement CSV export for current view/filtered orders
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) setSelectedRows(new Set(filteredOrders));
    else setSelectedRows(new Set());
  };

  const handleSelectRow = (row: AllOrder, selected: boolean) => {
    const next = new Set(selectedRows);
    if (selected) next.add(row);
    else next.delete(row);
    setSelectedRows(next);
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/order-management/${orderId}`);
  };

  const columns: TableColumn<AllOrder>[] = [
    { key: "checkbox", header: "", checkbox: true, align: "center", className: "w-12" },
    {
      key: "id",
      header: "Order ID",
      cell: (row) => (
        <button
          onClick={() => handleOrderClick(row.id)}
          className="text-black hover:underline font-medium cursor-pointer"
        >
          {row.id}
        </button>
      ),
    },
    { key: "vendor", header: "Vendor Name" },
    { key: "date", header: "Order Date", sortable: true },
    { key: "amount", header: "Total Amount", sortable: true },
    {
      key: "status",
      header: "Order Status",
      cell: (row) => (
        <StatusBadge variant={row.status as OrderStatus}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      cell: (row) => (
        <PaymentStatusBadge variant={row.paymentStatus as PaymentStatus}>
          {row.paymentStatus}
        </PaymentStatusBadge>
      ),
    },
    { key: "type", header: "Type" },
    {
      key: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View order">
          <Eye className="h-4 w-4" aria-hidden />
        </Button>
      ),
      align: "center",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin Dashboard", href: "/" },
          { label: "Order Management" },
        ]}
      />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-foreground" aria-hidden />
          <h1 className="text-xl font-semibold text-foreground">All Orders</h1>
        </div>
        <p className="text-gray-700">Manage all B2B and B2C orders across the platform </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Orders"
          value={initialOrders.length.toString()}
          change="2 B2B, 7 B2C"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiOrdersBagIcon />}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="Pending Orders"
          value={initialOrders.filter((o) => o.status === "pending").length.toString()}
          change="Awaiting processing"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiPendingClipboardIcon />}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Total Revenue"
          value="₹50,000"
          change="All Time"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiRupeeFlowIcon />}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="Return & Exchanges"
          value={initialOrders.filter((o) => o.status === "returned").length.toString()}
          change="Needs Attention"
          changeDisplay="text"
          changeType="negative"
          icon={<KpiReturnUndoIcon />}
          background="linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)"
          image="/kpi/kpi4.png"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-foreground" aria-hidden />
              <h1 className="text-xl font-semibold text-foreground">All Orders</h1>
            </div>
            <p className="text-gray-500 text-sm p-4">Manage all B2B and B2C orders from a centralized location </p>
          </div>
          <div className="mb-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  placeholder="Search by order ID, or vendor name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#E8E9E8] rounded-md border border-input px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Search orders"
                />
              </div>
              <AppSelect
                placeholder="All Status"
                value={statusFilter}
                onChange={(value: string) => setStatusFilter(value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Processing", value: "processing" },
                  { label: "Shipped", value: "shipped" },
                  { label: "Delivered", value: "delivered" },
                  { label: "Canceled", value: "canceled" },
                  { label: "Returned", value: "returned" },
                ]}
                className="w-[140px]"
              />
              <AppSelect
                placeholder="All Types"
                value={typeFilter}
                onChange={(value: string) => setTypeFilter(value)}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "B2B", value: "B2B" },
                  { label: "B2C", value: "B2C" },
                ]}
                className="w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <OrderManagementFilter.Trigger
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  showCloseWhenOpen
                  variant="outline"
                  size="lg"
                  className="gap-2"
                />
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
            <DataTable
              columns={columns}
              data={paginatedOrders}
              selectedRows={selectedRows}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
            />
            <OrderManagementFilter.Panel
              key={isFilterOpen ? "open" : "closed"}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              appliedFilters={filters}
              onApply={(newFilters) => setFilters(newFilters)}
            />
          </div>

          {filteredOrders.length >= PAGE_SIZE && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
