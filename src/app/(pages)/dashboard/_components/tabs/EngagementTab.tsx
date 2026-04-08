"use client"

import { LineChart, type ChartDataPoint } from "@/components/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export interface UserGrowthDataPoint {
  label: string
  value: number
}

interface EngagementTabProps {
  data?: UserGrowthDataPoint[]
}

export function EngagementTab({ data }: EngagementTabProps) {
  const chartData: ChartDataPoint[] = (data ?? []).map((item) => ({
    label: item.label,
    value: item.value,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length ? (
          <LineChart data={chartData} />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
            Engagement data unavailable
          </div>
        )}
      </CardContent>
    </Card>
  )
}

