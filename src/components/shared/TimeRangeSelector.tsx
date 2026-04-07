"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TimeRange = "1D" | "1W" | "1M" | "1Y"

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "1Y"]

export interface TimeRangeSelectorProps {
  value: TimeRange
  onValueChange: (value: TimeRange) => void
  size?: "default" | "sm" | "lg"
  className?: string
  /** Optional class for the active button */
  activeClassName?: string
}

/**
 * Reusable time range selector (1D, 1W, 1M, 1Y). Use everywhere charts or analytics need a time range.
 */
export function TimeRangeSelector({
  value,
  onValueChange,
  size = "sm",
  className,
  activeClassName,
}: TimeRangeSelectorProps) {
  const activeGradient =
    "radial-gradient(52.59% 160.7% at 51.96% 52.59%, #136CC8 0%, #98C9FF 94.99%)"

  return (
    <div className={cn("flex gap-1 bg-[#E8E9E8] p-1 rounded-md", className)} role="group" aria-label="Time range">
      {TIME_RANGES.map((range) => (
        <Button
          key={range}
          type="button"
          variant={value === range ? "default" : "outline"}
          size={size}
          onClick={() => onValueChange(range)}
          className={cn(value === range && "border-0 text-white hover:opacity-90", value === range && activeClassName)}
          style={value === range ? { background: activeGradient } : undefined}
        >
          {range}
        </Button>
      ))}
    </div>
  )
}
