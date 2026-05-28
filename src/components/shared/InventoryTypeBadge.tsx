import { cn } from "@/lib/utils"
import type { ProductInventoryType } from "@/lib/tableTypes"
import { PRODUCT_INVENTORY_TYPE_LABELS } from "@/lib/tableTypes"

const BADGE_LAYOUT =
  "inline-flex min-h-[22px] w-full min-w-0 max-w-full items-center justify-center overflow-hidden rounded-full px-1 py-0.5 text-center text-[9px] font-medium leading-none whitespace-nowrap sm:min-h-7 sm:px-2 sm:text-[11px] xl:text-xs min-[1920px]:text-sm"

interface InventoryTypeBadgeProps {
  type?: ProductInventoryType
  className?: string
}

export function InventoryTypeBadge({ type, className }: Readonly<InventoryTypeBadgeProps>) {
  if (!type) {
    return (
      <span
        className={cn(
          BADGE_LAYOUT,
          "bg-muted/70 text-muted-foreground",
          className
        )}
      >
        <span className="min-w-0 truncate">—</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        BADGE_LAYOUT,
        "bg-[#E0F2FE] text-[#0369A1]",
        className
      )}
    >
      <span className="min-w-0 truncate">{PRODUCT_INVENTORY_TYPE_LABELS[type]}</span>
    </span>
  )
}
