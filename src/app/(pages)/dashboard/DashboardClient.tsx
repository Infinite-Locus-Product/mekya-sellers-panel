"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Clock,
  Eye,
  Download,
  Search,
} from "lucide-react";
import {
  ArrowExternalIcon,
  KpiSaleTrendIcon,
  KpiUsersGroupIcon,
  KpiBounceRateIcon,
  KpiStoreSellersIcon,
} from "@/assets/icons";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { AllOrder, PaymentStatus } from "@/lib/tableTypes";
import { Filter, DEFAULT_FILTER_VALUES } from "@/components/shared/Filter";
import type { FilterValues } from "@/components/shared/FilterPanel";
import { Pagination } from "@/components/shared/Pagination";
import { usePagination } from "@/hooks";

const SalesAnalyticsModal = dynamic(
  () => import("@/components/modals/SalesAnalyticsModal").then((m) => ({ default: m.SalesAnalyticsModal })),
  { ssr: false }
);
const ActiveUsersAnalyticsModal = dynamic(
  () => import("@/components/modals/ActiveUsersAnalyticsModal").then((m) => ({ default: m.ActiveUsersAnalyticsModal })),
  { ssr: false }
);
const BounceRateAnalyticsModal = dynamic(
  () => import("./_components/modals/BounceRateAnalyticsModal").then((m) => ({ default: m.BounceRateAnalyticsModal })),
  { ssr: false }
);
const ActiveSellersAnalyticsModal = dynamic(
  () => import("./_components/modals/ActiveSellersAnalyticsModal").then((m) => ({ default: m.ActiveSellersAnalyticsModal })),
  { ssr: false }
);

const PAGE_SIZE = 10;

export interface DashboardClientProps {
  initialOrders: AllOrder[];
}

export function DashboardClient({ initialOrders }: DashboardClientProps) {
  const router = useRouter();
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const [isBounceRateModalOpen, setIsBounceRateModalOpen] = useState(false);
  const [isActiveSellersModalOpen, setIsActiveSellersModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_VALUES);
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [initialOrders, searchQuery, filters]);

  const pagination = usePagination({ totalCount: filteredOrders.length, pageSize: PAGE_SIZE });
  const paginatedOrders = useMemo(
    () => filteredOrders.slice(pagination.startIndex, pagination.endIndex),
    [filteredOrders, pagination.startIndex, pagination.endIndex]
  );

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  const handleFilterReset = () => setFilters(DEFAULT_FILTER_VALUES);

  const columns: TableColumn<AllOrder>[] = useMemo(
    () => [
      { key: "id", header: "Order ID" },
      { key: "vendor", header: "Vendor Name" },
      { key: "date", header: "Order Date" },
      { key: "amount", header: "Total Amount" },
      { key: "status", header: "Order Status", cell: (row) => <StatusBadge variant={row.status}>{row.status}</StatusBadge> },
      { key: "payment", header: "Payment Method" },
      { key: "delivery", header: "Delivery Date" },
      { key: "actions", header: "Actions", cell: () => <Button variant="ghost" size="icon" aria-label="View order"><Eye className="h-4 w-4" /></Button>, align: "center" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Admin Dashboard", href: "/" },
          { label: "Dashboard" },
        ]}
      />
      <div>
        <h1 className="text-xl font-medium text-foreground mb-2">Key Performance Summary</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Sale Volume"
          value="₹50,000,"
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiSaleTrendIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="Active Users"
          value="1,546"
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiUsersGroupIcon />}
          onClick={() => setIsActiveUsersModalOpen(true)}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Bounce Rate"
          value="32.9%"
          change="-2.1% From Last Month"
          changeType="negative"
          icon={<KpiBounceRateIcon />}
          onClick={() => setIsBounceRateModalOpen(true)}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="Active Sellers"
          value="248"
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiStoreSellersIcon />}
          onClick={() => setIsActiveSellersModalOpen(true)}
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
              <p className="text-sm text-muted-foreground mt-1">Monitor incoming orders in real-time</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button variant="default" size="default" className="bg-primary" onClick={() => router.push("/order-management")}>
                View All Orders
                <ArrowExternalIcon className="ml-2 h-[11px] w-[11px] shrink-0 text-white" aria-hidden />
              </Button>
            </div>
          </div>
          <div className="relative flex items-center gap-3 mt-4 pb-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <input
                type="search"
                placeholder="Search by order ID, vendor name or product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-[#E8E9E8] px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search orders"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="default" className="bg-white border-0 shadow-none hover:bg-gray-50 hover:border-0">
                <Download className="h-4 w-4 mr-2" aria-hidden />
                Export
              </Button>
              <Filter filters={filters} onFilterChange={handleFilterChange} onReset={handleFilterReset} onApply={() => { }} />
            </div>
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
      <ActiveUsersAnalyticsModal open={isActiveUsersModalOpen} onOpenChange={setIsActiveUsersModalOpen} />
      <BounceRateAnalyticsModal open={isBounceRateModalOpen} onOpenChange={setIsBounceRateModalOpen} />
      <ActiveSellersAnalyticsModal open={isActiveSellersModalOpen} onOpenChange={setIsActiveSellersModalOpen} />
    </div>
  );
}
