"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { MultiLineChart, type MultiLineChartDataPoint } from "@/components/analytics"
import { LoadingSpinner, TimeRangeSelector } from "@/components/shared"
import type { TimeRange } from "@/components/shared/TimeRangeSelector"
import { LineChartIcon } from "@/assets/icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SellerGrowthOverviewTabProps {
  chartData?: MultiLineChartDataPoint[]
  chartTitle?: string
}

export function SellerGrowthOverviewTab({
  chartData,
  chartTitle = "Seller Growth Over Time",
}: SellerGrowthOverviewTabProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1Y")
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [activeChartType, setActiveChartType] = useState<string>("Line Chart")

  const defaultData: MultiLineChartDataPoint[] = [
    { label: "Jan", totalSeller: 3200, activeSeller: 2500, newSeller: 1200 },
    { label: "Feb", totalSeller: 3300, activeSeller: 2550, newSeller: 1250 },
    { label: "Mar", totalSeller: 3400, activeSeller: 2600, newSeller: 1300 },
    { label: "Apr", totalSeller: 3500, activeSeller: 2650, newSeller: 1350 },
    { label: "May", totalSeller: 3600, activeSeller: 2700, newSeller: 1400 },
    { label: "Jun", totalSeller: 3700, activeSeller: 2750, newSeller: 1450 },
    { label: "Jul", totalSeller: 3800, activeSeller: 2800, newSeller: 1500 },
    { label: "Aug", totalSeller: 3900, activeSeller: 2820, newSeller: 1600 },
    { label: "Sep", totalSeller: 4000, activeSeller: 2850, newSeller: 1700 },
    { label: "Oct", totalSeller: 4100, activeSeller: 2880, newSeller: 1800 },
    { label: "Nov", totalSeller: 4150, activeSeller: 2900, newSeller: 1850 },
    { label: "Dec", totalSeller: 4200, activeSeller: 2900, newSeller: 1900 },
  ]

  const dataToUse = chartData || defaultData

  // Defer setState to next tick to avoid synchronous setState in effect (cascading renders)
  useEffect(() => {
    const startId = setTimeout(() => setIsChartLoading(true), 0)
    const endId = setTimeout(() => setIsChartLoading(false), 600)
    return () => {
      clearTimeout(startId)
      clearTimeout(endId)
    }
  }, [activeTimeRange, activeChartType])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
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
                <SelectItem value="Line Chart">
                  <span className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 shrink-0" />
                    Line Chart
                  </span>
                </SelectItem>
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
        <div className="relative">
          {isChartLoading ? (
            <div className="flex h-96 items-center justify-center rounded-lg bg-muted/30">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <LoadingSpinner />
                <p className="text-sm font-medium">Loading...</p>
              </div>
            </div>
          ) : (
            <MultiLineChart data={dataToUse} timeRange={activeTimeRange} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
