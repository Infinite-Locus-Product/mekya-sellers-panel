"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
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
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { cn, formatNumber } from "@/lib/utils"

export interface ImpactOfPromotionsDataPoint {
  label: string
  discountedOrders: number
  regularOrders: number
}

interface ImpactOfPromotionsAnalyticsModalProps {
  data?: ImpactOfPromotionsDataPoint[]
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2 text-sm text-foreground">{String(label ?? "").toUpperCase()}</p>
        {payload.map((entry) => (
          <div key={`${entry.name ?? "series"}-${entry.dataKey ?? "value"}`} className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">
              {String(entry.name ?? entry.dataKey ?? "Value")} :{" "}
              <span className="text-foreground">
                ₹{formatNumber(typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0))}
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function ImpactOfPromotionsAnalyticsModal({ data }: ImpactOfPromotionsAnalyticsModalProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1Y")
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [activeChartType, setActiveChartType] = useState<string>("Line Chart")

  const defaultData: ImpactOfPromotionsDataPoint[] = [
    { label: "Jan", discountedOrders: 3300, regularOrders: 2500 },
    { label: "Feb", discountedOrders: 3700, regularOrders: 2600 },
    { label: "Mar", discountedOrders: 3900, regularOrders: 2600 },
    { label: "Apr", discountedOrders: 3800, regularOrders: 2700 },
    { label: "May", discountedOrders: 4300, regularOrders: 2900 },
    { label: "Jun", discountedOrders: 4200, regularOrders: 3100 },
    { label: "Jul", discountedOrders: 4500, regularOrders: 3000 },
    { label: "Aug", discountedOrders: 4600, regularOrders: 3700 },
    { label: "Sep", discountedOrders: 4700, regularOrders: 3800 },
    { label: "Oct", discountedOrders: 4600, regularOrders: 3700 },
    { label: "Nov", discountedOrders: 4700, regularOrders: 3800 },
    { label: "Dec", discountedOrders: 4900, regularOrders: 4100 },
  ]

  const dataToUse = data || defaultData

  const chartData = dataToUse.map((item, index) => {
    let newLabel = item.label
    switch (activeTimeRange) {
      case "1D": {
        const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
        newLabel = hours[index % hours.length] || item.label
        break
      }
      case "1W": {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        newLabel = days[index % days.length] || item.label
        break
      }
      case "1M": {
        const dates = ["00", "10", "20", "30"]
        newLabel = dates[index % dates.length] || item.label
        break
      }
      case "1Y": {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        newLabel = months[index % months.length] || item.label
        break
      }
    }
    return {
      name: newLabel,
      "Discounted Orders": item.discountedOrders,
      "Regular Orders": item.regularOrders,
    }
  })

  // Defer setState to next tick to avoid synchronous setState in effect
  useEffect(() => {
    const startId = setTimeout(() => setIsChartLoading(true), 0)
    const endId = setTimeout(() => setIsChartLoading(false), 600)
    return () => {
      clearTimeout(startId)
      clearTimeout(endId)
    }
  }, [activeTimeRange, activeChartType])

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground font-medium text-lg">
            <TrendingUp className="h-5 w-5" />
            Impact of Promotions
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
                  <span className="flex items-center gap-2 text-sm text-foreground">
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
      <CardContent className="px-0 pb-0">
        <div className="relative h-96 w-full">
          {isChartLoading ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-muted/30">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <LoadingSpinner />
                <p className="text-sm font-medium">Loading...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "gray", strokeWidth: 1 }}
                  tickMargin={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "gray", strokeWidth: 1 }}
                  ticks={[1000, 2000, 3000, 4000, 5000]}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '3 3' }} content={CustomTooltip} />
                <Line
                  type="monotone"
                  dataKey="Discounted Orders"
                  stroke="#1E293B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "white", stroke: "#1E293B", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f1f5f9", stroke: "#1E293B", strokeWidth: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Regular Orders"
                  stroke="#15803D"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "white", stroke: "#15803D", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f1f5f9", stroke: "#15803D", strokeWidth: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
