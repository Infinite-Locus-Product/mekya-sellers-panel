"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart, type ChartDataPoint } from "@/components/analytics"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DashboardChartProps {
  data: ChartDataPoint[]
  title?: string
  defaultChartType?: "line" | "bar"
}

export function DashboardChart({
  data,
  title = "Dashboard Chart",
  defaultChartType = "line",
}: DashboardChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">(defaultChartType)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
            >
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === "line" ? (
          <LineChart data={data} timeRange="1M" />
        ) : (
          <BarChart data={data} timeRange="1M" />
        )}
      </CardContent>
    </Card>
  )
}
