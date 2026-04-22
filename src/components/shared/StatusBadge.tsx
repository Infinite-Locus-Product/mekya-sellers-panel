import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

export type StatusVariant =
  | "delivered"
  | "completed"
  | "pending"
  | "shipped"
  | "processing"
  | "canceled"
  | "returned"
  | "partial"

interface StatusBadgeProps {
  children: ReactNode
  variant: StatusVariant
  className?: string
}

const statusStyles: Record<StatusVariant, string> = {
  delivered: "bg-[#DBFCE7] text-[#016630]",
  completed: "bg-[#E6F7ED] text-[#0A6A3D]",
  pending: "bg-[#FEF9C2] text-[#686000]",
  shipped: "bg-[#DBEAFE] text-[#2C4FBF]",
  processing: "bg-[#FCDBF2] text-[#720050]",
  canceled: "bg-[#FCDBDB] text-[#660101]",
  returned: "bg-[#FFD8AA] text-[#7C4200]",
  partial: "bg-[#CCFBF1] text-[#0F766E]",
}

const BADGE_LAYOUT =
  "inline-flex min-h-[22px] w-full min-w-0 max-w-full items-center justify-center gap-x-0.5 overflow-hidden rounded-full px-1 py-0.5 text-center text-[9px] font-medium leading-none whitespace-nowrap sm:min-h-7 sm:px-2 sm:text-[11px] xl:text-xs min-[1920px]:px-2.5 min-[1920px]:text-sm"

export function StatusBadge({ children, variant, className }: Readonly<StatusBadgeProps>) {
  return (
    <span
      className={cn(
        BADGE_LAYOUT,
        statusStyles[variant],
        className
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}
