"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LineChart, type ChartDataPoint } from "@/components/analytics"
import { BarChart3 } from "lucide-react"

export interface HistoricalTrendsAnalyticsModalProps {
  chartData?: ChartDataPoint[]
  chartTitle?: string
  chartIcon?: React.ComponentType<{ className?: string }>
}

/**
 * Average order value over the selected period — currency, so the default LineChart
 * variant is right here.
 *
 * No 1D/1W/1M/1Y control: the modal's date picker owns the range and is what refetches.
 * Those buttons only relabelled points against a fixed month list without changing the
 * data, and sat next to a date picker that disagreed with them.
 */
export function HistoricalTrendsAnalyticsModal({
  chartData,
  chartTitle = "Historical Trends",
  chartIcon: ChartIconProp,
}: Readonly<HistoricalTrendsAnalyticsModalProps>) {
  const ChartIcon = ChartIconProp ?? BarChart3

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <span className={cn("flex shrink-0 h-5 w-5")}>
            <ChartIcon className="h-full w-full" />
          </span>
          {chartTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 bg-white/70 p-6">
          {chartData?.length ? (
            <LineChart data={chartData} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-muted/30 text-center space-y-3">
              <ChartIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No data for the selected period.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
