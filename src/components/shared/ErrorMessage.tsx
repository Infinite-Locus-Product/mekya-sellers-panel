import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

interface ErrorMessageProps {
  children: ReactNode
  className?: string
  variant?: "default" | "destructive"
}

export function ErrorMessage({ children, className, variant = "default" }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded-md p-4",
        variant === "destructive"
          ? "bg-[var(--error-light)] text-[var(--error-dark)]"
          : "bg-muted text-muted-foreground",
        className
      )}
      role="alert"
    >
      {children}
    </div>
  )
}
