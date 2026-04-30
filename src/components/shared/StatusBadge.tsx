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
  /** B2B Custom Orders table */
  | "custom_in_process"
  | "custom_pending_info"
  | "custom_fulfilled"

interface StatusBadgeProps {
  children: ReactNode
  variant: StatusVariant
  className?: string
  /** When true, label may wrap (e.g. long custom-order status). */
  allowWrap?: boolean
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
  custom_in_process: "bg-[#DBEAFE] text-[#1D4ED8]",
  custom_pending_info: "bg-[#FEF9C2] text-[#854D0E]",
  custom_fulfilled: "bg-[#DCFCE7] text-[#15803D]",
}

const BADGE_LAYOUT =
  "inline-flex min-h-[22px] w-full min-w-0 max-w-full items-center justify-center gap-x-0.5 overflow-hidden rounded-full px-1 py-0.5 text-center text-[9px] font-medium leading-none whitespace-nowrap sm:min-h-7 sm:px-2 sm:text-[11px] xl:text-xs min-[1920px]:px-2.5 min-[1920px]:text-sm"

const BADGE_LAYOUT_WRAP_LONG =
  "inline-flex min-h-[22px] w-full min-w-0 max-w-full items-center justify-center gap-x-0.5 rounded-full px-1 py-0.5 text-center text-[8px] font-medium leading-tight sm:min-h-7 sm:px-2 sm:text-[10px] xl:text-[11px] min-[1920px]:px-2.5 min-[1920px]:text-xs"

export function StatusBadge({
  children,
  variant,
  className,
  allowWrap = false,
}: Readonly<StatusBadgeProps>) {
  const layout = allowWrap ? BADGE_LAYOUT_WRAP_LONG : BADGE_LAYOUT
  return (
    <span
      className={cn(
        layout,
        statusStyles[variant],
        className
      )}
    >
      <span className={allowWrap ? "min-w-0 text-pretty" : "min-w-0 truncate"}>{children}</span>
    </span>
  )
}
