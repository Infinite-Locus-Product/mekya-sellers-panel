"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PagesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Pages route error:", error?.message ?? error, error?.digest)
    }
  }, [error])

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
