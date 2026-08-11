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
 * Return-request counts over the selected period.
 *
 * Line only and no 1D/1W/1M/1Y control — the modal's date picker owns the range. Uses the
 * `count` chart variant: these are returns, not rupees, so the money variant would render
 * a "₹2" tooltip and divide the axis by 1000.
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
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-foreground">
          {ChartIcon ? (
            <span className={cn("flex shrink-0", isSalesTrends ? "h-5 w-[17px]" : "h-5 w-5")}>
              <ChartIcon className="h-full w-full" />
            </span>
          ) : null}
          {chartTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96">
          {hasData ? (
            <LineChart data={chartData ?? []} variant="count" unitLabel="returns" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-muted/30 text-center">
              <ChartIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No returns in this period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
