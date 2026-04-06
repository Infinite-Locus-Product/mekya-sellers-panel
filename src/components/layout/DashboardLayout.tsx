import { Sidebar } from "./Sidebar"
import { type ReactNode } from "react"

/** Layout for all (pages) routes: fixed sidebar + main content area. */
interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 bg-background">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
