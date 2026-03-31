"use client"

import { cn, formatNumber } from "@/lib/utils"

export type SalesTrendPoint = {
  label: string
  value: number
}

interface SalesTrendsChartProps {
  data: SalesTrendPoint[]
  timeRange: "1D" | "1W" | "1M" | "1Y"
  className?: string
}

export function SalesTrendsChart({ data, timeRange, className }: SalesTrendsChartProps) {
  return (
    <div className={cn("flex h-96 flex-col gap-4 rounded-lg border bg-muted/30 p-4", className)}>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Sales Trends Over Time</span>
        <span>Range: {timeRange}</span>
      </div>
      <div className="flex-1">
        <div className="grid h-full grid-cols-12 items-end gap-2 rounded-lg bg-background/60 p-4">
          {data.map((point, idx) => (
            <div key={point.label + idx} className="flex flex-col items-center">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${(point.value / getMax(data)) * 100}%`,
                  backgroundColor: "#76B7FF20",
                }}
              >
                <div className="h-2 w-full rounded-t-md" style={{ backgroundColor: "#76B7FF" }} />
              </div>
              <span className="mt-2 text-xs text-muted-foreground">{point.label}</span>
              <span className="text-xs font-medium text-foreground">
                {formatNumber(point.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Placeholder chart — replace with API-driven charting library when ready.
      </p>
    </div>
  )
}

function getMax(data: SalesTrendPoint[]) {
  return Math.max(...data.map((d) => d.value), 1)
}
