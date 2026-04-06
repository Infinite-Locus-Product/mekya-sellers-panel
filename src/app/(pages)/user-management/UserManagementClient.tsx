"use client";

import { useState, useMemo } from "react";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SalesAnalyticsModal,
  ActiveUsersAnalyticsModal,
  DeactivateUserConfirmationModal,
  OnboardUserModal,
  type OnboardUserFormData,
} from "./_components/modals";
import {
  History,
  Plus,
  Download,
  Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";
import type { UserRole, UserRow } from "@/lib/tableTypes";
import {
  KpiUsersGroupIcon,
  KpiUserSparkleCardIcon,
  KpiBrandGemIcon,
  KpiOnboardingCalendarIcon,
} from "@/assets/icons";

const ROLE_BADGE_STYLES: Record<UserRole, { backgroundColor: string; color: string }> = {
  Brand: { backgroundColor: "#DBEAFE", color: "#193CB8" },
  Agent: { backgroundColor: "#FFEDD4", color: "#C76400" },
  Retailer: { backgroundColor: "#DBFCE7", color: "#016630" },
  "Institutional Buyer": { backgroundColor: "#F3E8FF", color: "#6E11C2" },
};
import { AppSelect } from "@/components/shared/AppSelect";
import { StatusToggle } from "@/components/shared/StatusToggle";
import { Pagination } from "@/components/shared";
import { usePagination } from "@/hooks";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export interface UserManagementClientProps {
  initialUsers: UserRow[];
}

export function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<{ id: string; vendor: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<UserRow>>(new Set());

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(
      (user) =>
        (!role || role === "all" || user.role.toLowerCase() === role.toLowerCase()) &&
        (!status || status === "all" || user.status.toLowerCase() === status.toLowerCase())
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.id.toLowerCase().includes(q) ||
          u.vendor.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [users, role, status, searchQuery]);

  const pagination = usePagination({ totalCount: filteredUsers.length, pageSize: PAGE_SIZE });
  const paginatedUsers = useMemo(
    () => filteredUsers.slice(pagination.startIndex, pagination.endIndex),
    [filteredUsers, pagination.startIndex, pagination.endIndex]
  );

  const handleSelectAll = (selected: boolean) => {
    if (selected) setSelectedRows(new Set(filteredUsers));
    else setSelectedRows(new Set());
  };

  const handleSelectRow = (row: UserRow, selected: boolean) => {
    const next = new Set(selectedRows);
    if (selected) next.add(row);
    else next.delete(row);
    setSelectedRows(next);
  };

  const columns: TableColumn<UserRow>[] = [
    {
      key: "id",
      header: "User ID",
      checkbox: true,
      sortable: true,
    },
    { key: "vendor", header: "Vendor Name" },
    { key: "email", header: "Email Address" },
    {
      key: "role",
      header: "Role",
      cell: (row) => {
        const badgeStyle = ROLE_BADGE_STYLES[row.role];
        return (
          <span
            className="flex max-w-[150px] justify-center rounded-lg px-2.5 py-0.5 text-sm font-medium"
            style={badgeStyle}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusToggle
          status={row.status as "active" | "inactive"}
          onToggle={(newStatus) => {
            if (row.status === "active" && newStatus === "inactive") {
              setUserToDeactivate({ id: row.id, vendor: row.vendor });
              setIsDeactivateModalOpen(true);
            } else {
              if (newStatus === "active" && row.status !== "active") {
                toast.success("User has been activated", { icon: "🎉" });
              }
              setUsers((prev) =>
                prev.map((u) => (u.id === row.id ? { ...u, status: newStatus } : u))
              );
            }
          }}
        />
      ),
    },
    { key: "onboardingdate", header: "Onboarded Date", sortable: true },
  ];

  const handleOnboardUser = (formData: OnboardUserFormData) => {
    const newUserId = `USR-2025-${String(users.length + 1).padStart(3, "0")}`;
    const formattedDate = formatDate(new Date());
    const newUser: UserRow = {
      id: newUserId,
      vendor: formData.name,
      email: formData.email,
      role: formData.role as UserRow["role"],
      status: "pending",
      onboardingdate: formattedDate,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          Seller Dashboard &gt; User Management
        </nav>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-foreground">User Management</h1>
          <Button variant="default" size="lg" onClick={() => setIsOnboardModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            <span className="ml-2">Onboard User</span>
          </Button>
        </div>
        <p className="text-gray-700">Manage user onboarding, roles and access across the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Users"
          value={users.length.toString()}
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiUsersGroupIcon />}
          onClick={() => setIsSalesModalOpen(true)}
          background="linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)"
          image="/kpi/kpi1.png"
        />
        <KPICard
          title="Active Users"
          value={users.filter((u) => u.status === "active").length.toString()}
          change="+12.5% From Last Month"
          changeType="positive"
          icon={<KpiUserSparkleCardIcon />}
          onClick={() => setIsActiveUsersModalOpen(true)}
          background="linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)"
          image="/kpi/kpi2.png"
        />
        <KPICard
          title="Brands"
          value={users.filter((u) => u.role === "Brand").length.toString()}
          change="-2.1% From Last Month"
          changeType="negative"
          icon={<KpiBrandGemIcon />}
          background="linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)"
          image="/kpi/kpi3.png"
        />
        <KPICard
          title="New Onboarding"
          value={users.length.toString()}
          change="+12.5% From This Month"
          changeType="positive"
          icon={<KpiOnboardingCalendarIcon />}
          background="linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)"
          image="/kpi/kpi4.png"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" aria-hidden />
                User List
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Monitor users in real-time</p>
            </div>
            <Button variant="outline" size="lg">
              <Download className="h-4 w-4" aria-hidden />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center gap-10">
            <div className="relative flex-1 w-[660px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="Search by user ID, vendor name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#E8E9E8] rounded-md border border-input px-10 py-2 text-md focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Search users"
              />
            </div>
            <div className="flex gap-4">
              <AppSelect
                placeholder="All roles"
                value={role}
                onChange={(value: string) => setRole(value)}
                options={[
                  { label: "All roles", value: "all" },
                  { label: "Brand", value: "Brand" },
                  { label: "Agent", value: "Agent" },
                  { label: "Retailer", value: "Retailer" },
                  { label: "Institutional Buyer", value: "Institutional Buyer" },
                ]}
              />
              <AppSelect
                placeholder="All status"
                value={status}
                onChange={(value: string) => setStatus(value)}
                options={[
                  { label: "All status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedUsers}
            selectedRows={selectedRows}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
          />

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
      <DeactivateUserConfirmationModal
        open={isDeactivateModalOpen}
        onOpenChange={(open) => {
          setIsDeactivateModalOpen(open);
          if (!open) setUserToDeactivate(null);
        }}
        userName={userToDeactivate?.vendor}
        onConfirm={() => {
          if (userToDeactivate) {
            setUsers((prev) =>
              prev.map((u) => (u.id === userToDeactivate.id ? { ...u, status: "inactive" as const } : u))
            );
            setUserToDeactivate(null);
          }
        }}
      />
      <OnboardUserModal
        open={isOnboardModalOpen}
        onOpenChange={setIsOnboardModalOpen}
        onSubmit={handleOnboardUser}
      />
    </div>
  );
}
