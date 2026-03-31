"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart, LineChart, PieChart, type ChartDataPoint } from "@/components/analytics"
import { LoadingSpinner, TimeRangeSelector } from "@/components/shared"
import type { TimeRange } from "@/components/shared/TimeRangeSelector"
import { BarChart3 } from "lucide-react"
import { SalesTrendsTitleIcon, CHART_TYPE_OPTIONS } from "@/assets/icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1Y")
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [activeChartType, setActiveChartType] = useState<string>("Bar Chart")

  const renderChart = () => {
    if (!chartData) return null

    const chartProps = {
      data: chartData,
      timeRange: activeTimeRange,
    }

    switch (activeChartType) {
      case "Bar Chart":
        return <BarChart {...chartProps} />
      case "Pie Chart":
        return <PieChart {...chartProps} />
      case "Line Chart":
      default:
        return <LineChart {...chartProps} />
    }
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
          <div className="flex items-center gap-2">
            <Select
              value={activeChartType}
              onValueChange={(value) => {
                setActiveChartType(value)
                setIsChartLoading(true)
                setTimeout(() => setIsChartLoading(false), 600)
              }}
            >
              <SelectTrigger className="w-[140px] bg-white border-border px-3" size="sm">
                <SelectValue />
                <div className="h-4 w-px bg-gray-300 flex-shrink-0" aria-hidden />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPE_OPTIONS.map(({ value, Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      {value}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TimeRangeSelector
              value={activeTimeRange}
              onValueChange={(range) => {
                setActiveTimeRange(range)
                setIsChartLoading(true)
                setTimeout(() => setIsChartLoading(false), 600)
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-96">
          {isChartLoading ? (
            <div className="flex h-96 items-center justify-center rounded-lg bg-muted/30">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <LoadingSpinner />
                <p className="text-sm font-medium">Loading...</p>
              </div>
            </div>
          ) : chartData ? (
            renderChart()
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-muted/30 text-center space-y-3">
              <ChartIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Sales Trends (placeholder)</p>
              <p className="text-xs text-muted-foreground">
                Data range: Jan - Dec ({activeTimeRange} view)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
