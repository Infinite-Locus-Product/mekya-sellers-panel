import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

export type PaymentStatusVariant = "Paid" | "Pending" | "Refunded"

interface PaymentStatusBadgeProps {
  children: ReactNode
  variant: PaymentStatusVariant
  className?: string
}

const paymentStatusStyles: Record<PaymentStatusVariant, string> = {
  Paid: "bg-gray-900 text-white",
  Pending: "bg-white text-gray-700 border border-gray-300",
  Refunded: "bg-gray-100 text-gray-700 border border-gray-300",
}

export function PaymentStatusBadge({ children, variant, className }: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        paymentStatusStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
