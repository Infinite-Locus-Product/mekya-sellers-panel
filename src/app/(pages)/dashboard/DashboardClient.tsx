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
  KpiOrdersBagIcon,
  KpiReturnUndoIcon,
} from "@/assets/icons";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { AllOrder } from "@/lib/tableTypes";
import { orderStatusToBadgeVariant } from "@/lib/orderStatusBadge";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("last_30_days");

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return initialOrders;
    return initialOrders.filter((order) => order.status === statusFilter);
  }, [initialOrders, statusFilter]);

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
          change="+12.5% From Previous Period"
          changeType="positive"
          icon={<KpiSaleTrendIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="Average Order Value"
          value="1,546"
          change="+12.5% From Previous Period"
          changeType="positive"
          icon={<svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.3715 28.0516C11.8183 28.0516 12.1805 27.6894 12.1805 27.2426C12.1805 26.7958 11.8183 26.4336 11.3715 26.4336C10.9247 26.4336 10.5625 26.7958 10.5625 27.2426C10.5625 27.6894 10.9247 28.0516 11.3715 28.0516Z" stroke="black" strokeWidth="1.2768" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22.6996 28.0516C23.1464 28.0516 23.5086 27.6894 23.5086 27.2426C23.5086 26.7958 23.1464 26.4336 22.6996 26.4336C22.2528 26.4336 21.8906 26.7958 21.8906 27.2426C21.8906 27.6894 22.2528 28.0516 22.6996 28.0516Z" stroke="black" strokeWidth="1.2768" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.89844 10.2539H8.13436L10.5613 24.0066H23.505" stroke="black" strokeWidth="1.2768" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.5633 20.7695H23.1753C23.2688 20.7696 23.3595 20.7372 23.4319 20.6779C23.5042 20.6186 23.5538 20.5361 23.5722 20.4444L25.0284 13.1636C25.0401 13.1049 25.0387 13.0443 25.0242 12.9862C25.0097 12.9281 24.9824 12.8739 24.9445 12.8276C24.9065 12.7814 24.8587 12.7441 24.8046 12.7185C24.7505 12.6929 24.6913 12.6796 24.6314 12.6797H8.94531" stroke="black" strokeWidth="1.2768" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.0234 10.4492C19.6469 10.4492 21.7734 8.32264 21.7734 5.69922C21.7734 3.07579 19.6469 0.949219 17.0234 0.949219C14.4 0.949219 12.2734 3.07579 12.2734 5.69922C12.2734 8.32264 14.4 10.4492 17.0234 10.4492Z" stroke="black" strokeWidth="0.57" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.1264 3.32422H16.5514M16.5514 3.32422H18.9264M16.5514 3.32422C17.0264 3.32422 17.9764 3.60922 17.9764 4.74922M18.9264 4.74922H17.9764M17.9764 4.74922H15.125M17.9764 4.74922C17.9764 5.88922 17.0264 6.17422 16.5514 6.17422H15.125L17.5014 8.07422" stroke="black" strokeWidth="0.57" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          }
          onClick={() => setIsAverageOrderValueModalOpen(true)}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Total Orders"
          value="580"
          change="+102% From Previous Period"
          changeType="positive"
          icon={<KpiOrdersBagIcon />}
          onClick={() => setIsTotalOrdersModalOpen(true)}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="Return Orders"
          value="248"
          change="+12.5% From Previous Period"
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
