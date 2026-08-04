import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

export type PaymentStatusVariant =
  | "Pending"
  | "Partially Paid"
  | "Paid"
  | "Partially Refunded"
  | "Refunded"
  | "Overpaid"

interface PaymentStatusBadgeProps {
  children: ReactNode
  variant: PaymentStatusVariant
  className?: string
}

const paymentStatusStyles: Record<PaymentStatusVariant, string> = {
  Pending: "bg-white text-gray-700 border border-gray-300",
  "Partially Paid": "bg-gray-100 text-gray-900 border border-gray-400",
  Paid: "bg-gray-900 text-white",
  "Partially Refunded": "bg-orange-50 text-orange-700 border border-orange-300",
  Refunded: "bg-gray-100 text-gray-700 border border-gray-300",
  Overpaid: "bg-blue-50 text-blue-700 border border-blue-300",
}

export function PaymentStatusBadge({ children, variant, className }: Readonly<PaymentStatusBadgeProps>) {
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
