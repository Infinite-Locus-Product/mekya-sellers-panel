"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart, type ChartDataPoint } from "@/components/analytics"
import { BarChart3 } from "lucide-react"
import { SalesTrendsTitleIcon } from "@/assets/icons"

export interface HistoricalTrendsTabProps {
  chartData?: ChartDataPoint[]
  chartTitle?: string
  chartIcon?: React.ComponentType<{ className?: string }>
}

/**
 * Order-count trend for the selected period.
 *
 * Line only, and no local 1D/1W/1M/1Y control: the modal's date picker owns the range
 * and is what refetches. The old buttons just relabelled points against a fixed month
 * list, which mislabelled any series that wasn't exactly 12 months long.
 */
export function HistoricalTrendsTab({
  chartData,
  chartTitle = "Historical Trends",
  chartIcon: ChartIconProp,
}: Readonly<HistoricalTrendsTabProps>) {
  const isSalesTrends = chartTitle === "Sales Trends Over Time"
  const ChartIcon = isSalesTrends ? SalesTrendsTitleIcon : (ChartIconProp ?? BarChart3)
  const hasData = (chartData ?? []).some((point) => point.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ChartIcon ? (
            <span className={cn("flex shrink-0", isSalesTrends ? "h-5 w-[17px]" : "h-5 w-5")}>
              <ChartIcon className="h-full w-full" />
            </span>
          ) : null}
          {chartTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96">
          {hasData ? (
            <LineChart data={chartData ?? []} variant="count" unitLabel="orders" />
          ) : (
            <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-lg bg-muted/30 text-center">
              <ChartIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No orders in this period</p>
              <p className="text-xs text-muted-foreground">
                Pick a different date range to see the trend.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
