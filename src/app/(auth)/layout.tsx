import type { ReactNode } from "react"

/** Auth routes: full-page flows without dashboard chrome. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>
}
