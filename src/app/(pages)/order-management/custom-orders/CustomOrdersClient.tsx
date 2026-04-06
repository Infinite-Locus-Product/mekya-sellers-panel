"use client";

import { useState, useMemo } from "react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge";
import { AppSelect } from "@/components/shared/AppSelect";
import {
  OrderManagementFilter,
  DEFAULT_ORDER_FILTER_VALUES,
  type FilterValues,
} from "../_components";
import { Pagination, ExportDropdown } from "@/components/shared";
import { usePagination } from "@/hooks";
import {
  SalesAnalyticsModal,
  ActiveUsersAnalyticsModal,
  CustomizationRequestDetailModal,
} from "./_components/modals";
import { Search, Edit } from "lucide-react";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import {
  CustomizationRequestsIcon,
  KpiCustomOrderCardIcon,
  KpiInProcessLayersIcon,
  KpiFulfilledDeliveryIcon,
  KpiPendingDocumentIcon,
} from "@/assets/icons";
import type { CustomOrder } from "@/lib/data";

const PAGE_SIZE = 10;

export interface CustomOrdersClientProps {
  initialOrders: CustomOrder[];
}

const statusToCustomization: Record<string, string> = {
  "In Process": "In Process",
  Fulfilled: "Fulfilled",
  "Pending Further information": "Pending Further information",
  Completed: "Completed",
};

export function CustomOrdersClient({ initialOrders }: CustomOrdersClientProps) {
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_ORDER_FILTER_VALUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<Set<CustomOrder>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);

  const filteredOrders = useMemo(() => {
    let result = [...initialOrders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.vendor.toLowerCase().includes(q) ||
          order.requirements.toLowerCase().includes(q)
      );
    }
    if (statusFilter && statusFilter !== "all") {
      const status = statusToCustomization[statusFilter] ?? statusFilter;
      result = result.filter((order) => order.customizationStatus === status);
    }
    if (filters.orderStatus.length > 0) {
      const statuses = filters.orderStatus.map((s) => statusToCustomization[s] ?? s);
      result = result.filter((order) => statuses.includes(order.customizationStatus));
    }
    const minPrice = parseFloat(filters.priceMin) || 0;
    const maxPrice = parseFloat(filters.priceMax) || Infinity;
    result = result.filter((order) => {
      const value = parseFloat(order.orderValue.replace(/[^0-9.]/g, "")) || 0;
      return value >= minPrice && value <= maxPrice;
    });
    return result;
  }, [initialOrders, searchQuery, statusFilter, filters]);

  const activeFilterLabels = useMemo(() => {
    const d = DEFAULT_ORDER_FILTER_VALUES;
    const labels: string[] = [];
    if (filters.orderStatus.length > 0) {
      labels.push("Status");
    }
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

  const pagination = usePagination({ totalCount: filteredOrders.length, pageSize: PAGE_SIZE });
  const paginatedOrders = useMemo(
    () => filteredOrders.slice(pagination.startIndex, pagination.endIndex),
    [filteredOrders, pagination.startIndex, pagination.endIndex]
  );

  const handleSelectAll = (selected: boolean) => {
    if (selected) setSelectedRows(new Set(filteredOrders));
    else setSelectedRows(new Set());
  };

  const handleSelectRow = (row: CustomOrder, selected: boolean) => {
    const next = new Set(selectedRows);
    if (selected) next.add(row);
    else next.delete(row);
    setSelectedRows(next);
  };

  const columns: TableColumn<CustomOrder>[] = [
    { key: "checkbox", header: "", checkbox: true, align: "center" },
    {
      key: "id",
      header: "Order ID",
      cell: (row) => (
        <button
          type="button"
          className="text-primary hover:underline font-medium text-left"
          onClick={() => setSelectedOrder(row)}
        >
          {row.id}
        </button>
      ),
    },
    { key: "vendor", header: "Vendor Name" },
    { key: "date", header: "Order Date", sortable: true },
    { key: "orderValue", header: "Order Value", sortable: true },
    {
      key: "customizationStatus",
      header: "Customization Status",
      cell: (row) => {
        const statusMap: Record<string, StatusVariant> = {
          "In Process": "processing",
          Fulfilled: "delivered",
          "Pending Further information": "pending",
          Completed: "delivered",
        };
        const statusClassMap: Record<string, string> = {
          "In Process": "!bg-[#DBEAFE] !text-[#2C4FBF]",
          "Pending Further information": "!bg-[#FEF9C2] !text-[#686000]",
          Fulfilled: "!bg-[#DBFCE7] !text-[#016630]",
        };
        const variant = statusMap[row.customizationStatus] ?? "pending";
        const statusClassName = statusClassMap[row.customizationStatus];
        return (
          <StatusBadge
            variant={variant}
            className={statusClassName}
          >
            {row.customizationStatus}
          </StatusBadge>
        );
      },
    },
    { key: "requirements", header: "Requirements" },
    {
      key: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="icon" aria-label="Edit request">
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
          { label: "Custom Orders" },
        ]}
      />
      <div>
        <div className="flex flex-col mb-2">
          <h1 className="text-xl font-semibold text-foreground">Custom Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage all B2B orders across the platform
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Custom Orders"
          value="29"
          change="B2B orders only"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiCustomOrderCardIcon />}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="In Process Order"
          value="5"
          change="Being worked on"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiInProcessLayersIcon />}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Fulfilled Orders"
          value="14"
          change="Completed"
          changeType="positive"
          changeDisplay="text"
          icon={<KpiFulfilledDeliveryIcon />}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="Pending Info"
          value="10"
          change="Awaiting details"
          changeType="negative"
          changeDisplay="text"
          icon={<KpiPendingDocumentIcon />}
          background="linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)"
          image="/kpi/kpi4.png"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div>
            <div className="flex items-center gap-2">
              <CustomizationRequestsIcon className="h-5 w-5" aria-hidden />
              <h1 className="text-xl font-semibold text-foreground">Customization Requests</h1>
            </div>
            <p className="text-gray-500 text-sm p-4">
              Manage custom orders and personalization requests for B2B client
            </p>
          </div>
          <div className="mb-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  placeholder="Search by order ID, vendor name or requirements"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#E8E9E8] rounded-md border border-input px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Search custom orders"
                />
              </div>
              <AppSelect
                placeholder="All Status"
                value={statusFilter}
                onChange={(value: string) => setStatusFilter(value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "In Progress", value: "in-progress" },
                  { label: "Fulfilled", value: "fulfilled" },
                  { label: "Pending Info", value: "pending-info" },
                  { label: "Completed", value: "completed" },
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
                onPageChange={pagination.setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <SalesAnalyticsModal open={isSalesModalOpen} onOpenChange={setIsSalesModalOpen} />
      <ActiveUsersAnalyticsModal open={isActiveUsersModalOpen} onOpenChange={setIsActiveUsersModalOpen} />
      <CustomizationRequestDetailModal
        open={selectedOrder !== null}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
