import { Suspense, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  return (
    <div className="flex min-h-screen min-w-0">
      <Suspense
        fallback={
          <aside
            className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-[var(--neutral-light)]/30"
            aria-hidden
          />
        }
      >
        <Sidebar />
      </Suspense>
      <main className="ml-64 flex min-w-0 flex-1 bg-background">
        <div className="min-w-0 flex-1 p-3 sm:p-4 xl:p-5 min-[1920px]:p-6">{children}</div>
      </main>
    </div>
  )
}
