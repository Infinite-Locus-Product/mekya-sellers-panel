"use client"

import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"

/** Redirects to login when no valid session (client-side guard). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { status, user } = useAuth()

  useEffect(() => {
    if (status !== "ready") return
    if (!user) {
      router.replace("/login")
    }
  }, [status, user, router])

  if (status !== "ready" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
