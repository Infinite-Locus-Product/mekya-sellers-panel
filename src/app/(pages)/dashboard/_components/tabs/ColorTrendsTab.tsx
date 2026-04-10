"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets } from "lucide-react"
import type { ChartDataPoint } from "@/components/analytics"

export interface ColorTrendsDataPoint {
  color: string
  name: string
  units: number
  percentage: number
  hexCode: string
}

interface ColorTrendsTabProps {
  data?: ColorTrendsDataPoint[]
  chartData?: ChartDataPoint[]
}

export function ColorTrendsTab(props: ColorTrendsTabProps) {
  const { data } = props
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Color Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data?.length ? (
          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.color}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded"
                    style={{ backgroundColor: item.hexCode }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.units} units</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
            Color trends unavailable
          </div>
        )}
      </CardContent>
    </Card>
  )
}
