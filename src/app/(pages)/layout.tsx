import { RequireAuth } from "@/components/auth/require-auth"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  )
}
