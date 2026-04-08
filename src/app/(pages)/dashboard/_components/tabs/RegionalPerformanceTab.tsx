"use client"

import { BarChart, type ChartDataPoint } from "@/components/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import { BarChart3 } from "lucide-react"

export interface RegionalPerformanceDataPoint {
  region: string
  sales?: number
  growth?: number
  color?: string
  numberOfSellers?: number
  revenue?: number
  averageRating?: number
}

interface RegionalPerformanceTabProps {
  data?: RegionalPerformanceDataPoint[]
  chartData?: ChartDataPoint[]
}

export function RegionalPerformanceTab({ data, chartData }: RegionalPerformanceTabProps) {
  const computedChartData: ChartDataPoint[] =
    chartData ??
    data
      ?.filter((item) => typeof item.sales === "number")
      .map((item) => ({ label: item.region, value: item.sales ?? 0 })) ??
    []

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales by Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          {computedChartData.length ? (
            <BarChart data={computedChartData} />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
              Regional data unavailable
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Region Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data ?? []).map((item) => (
              <div
                key={item.region}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.region}</p>
                  <p className="text-xs text-muted-foreground">
                    Sales: {formatNumber(item.sales ?? 0)}
                  </p>
                </div>
                {typeof item.growth === "number" ? (
                  <span
                    className={[
                      "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
                      item.growth >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800",
                    ].join(" ")}
                  >
                    {item.growth >= 0 ? "+" : ""}
                    {item.growth.toFixed(1)}%
                  </span>
                ) : null}
              </div>
            ))}

            {!data?.length ? (
              <p className="text-sm text-muted-foreground">No regional breakdown provided.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

