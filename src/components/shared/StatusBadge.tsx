import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

export type StatusVariant =
  | "delivered"
  | "pending"
  | "shipped"
  | "processing"
  | "canceled"
  | "returned"

interface StatusBadgeProps {
  children: ReactNode
  variant: StatusVariant
  className?: string
}

const statusStyles: Record<StatusVariant, string> = {
  delivered: "bg-[var(--success-light)] text-[var(--success-dark)]",
  pending: "bg-[var(--warning-light)] text-[var(--warning-dark)]",
  shipped: "bg-[var(--info-light)] text-[var(--info-dark)]",
  processing: "bg-[var(--accent-light)] text-[var(--accent-dark)]",
  canceled: "bg-[var(--error-light)] text-[var(--error-dark)]",
  returned: "bg-[var(--warning-light)] text-[var(--warning-dark)]",
}

export function StatusBadge({ children, variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
