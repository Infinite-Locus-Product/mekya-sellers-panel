"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart, type ChartDataPoint } from "@/components/analytics"
import { BarChart3 } from "lucide-react"
import { SalesTrendsTitleIcon } from "@/assets/icons"

interface SalesTrendsTabProps {
  chartData?: ChartDataPoint[]
  chartTitle?: string
  chartIcon?: React.ComponentType<{ className?: string }>
}

export function SalesTrendsTab({
  chartData,
  chartTitle = "Sales Trends Over Time",
  chartIcon: ChartIconProp,
}: SalesTrendsTabProps) {
  const isSalesTrends = chartTitle === "Sales Trends Over Time"
  const ChartIcon = isSalesTrends ? SalesTrendsTitleIcon : (ChartIconProp ?? BarChart3)

  // Line only, and no local range control: the chart type was a cosmetic switch (a pie of a
  // time series is meaningless), and the 1D/1W/1M/1Y buttons only relabelled points without
  // refetching. The date range now lives in the modal's CustomDateRangeSelector, which does
  // drive the query.
  const renderChart = () => {
    if (!chartData) return null
    return <LineChart data={chartData} />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {ChartIcon ? (
              <span className={cn("flex shrink-0", isSalesTrends ? "h-5 w-[17px]" : "h-5 w-5")}>
                <ChartIcon className="h-full w-full" />
              </span>
            ) : null}
            {chartTitle}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-96">
          {chartData ? (
            renderChart()
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-muted/30 text-center space-y-3">
              <ChartIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No sales data for this period</p>
              <p className="text-xs text-muted-foreground">
                Pick a different date range to see trends.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
