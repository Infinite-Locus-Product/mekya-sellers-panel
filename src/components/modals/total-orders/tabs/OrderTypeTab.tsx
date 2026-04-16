"use client"

import { useState, useEffect, useId } from "react"
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
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { LineChartAreaGradient } from "@/components/analytics"
import { cn, formatNumber } from "@/lib/utils"

const B2B_STROKE = "#38BDF8"
const B2C_STROKE = "#D97706"

export interface OrderTypeDataPoint {
  label: string
  b2b: number
  b2c: number
}

interface OrderTypeTabProps {
  data?: OrderTypeDataPoint[]
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
                {formatNumber(typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0))} Orders
              </span>
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function OrderTypeTab({ data }: OrderTypeTabProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1Y")
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [activeChartType, setActiveChartType] = useState<string>("Line Chart")
  const chartAreaSuffix = useId().replace(/[^a-zA-Z0-9-_]/g, "")
  const gB2b = `ot-b2b-${chartAreaSuffix || "b"}`
  const gB2c = `ot-b2c-${chartAreaSuffix || "c"}`

  const defaultData: OrderTypeDataPoint[] = [
    { label: "Jan", b2b: 3300, b2c: 2500 },
    { label: "Feb", b2b: 3700, b2c: 2600 },
    { label: "Mar", b2b: 3900, b2c: 2600 },
    { label: "Apr", b2b: 3800, b2c: 2700 },
    { label: "May", b2b: 4300, b2c: 2900 },
    { label: "Jun", b2b: 4200, b2c: 3100 },
    { label: "Jul", b2b: 4500, b2c: 3000 },
    { label: "Aug", b2b: 4600, b2c: 3700 },
    { label: "Sep", b2b: 4700, b2c: 3800 },
    { label: "Oct", b2b: 4600, b2c: 3700 },
    { label: "Nov", b2b: 4700, b2c: 3800 },
    { label: "Dec", b2b: 4900, b2c: 4100 },
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
      "B2B": item.b2b,
      "B2C": item.b2c,
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
            <TrendingUp className="h-5 w-5"/>
            Type (B2B/B2C)
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
                    <LineChartIcon className="h-4 w-4 shrink-0"/>
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
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <defs>
                  <LineChartAreaGradient id={gB2b} lineColor={B2B_STROKE} />
                  <LineChartAreaGradient id={gB2c} lineColor={B2C_STROKE} />
                </defs>
                <Area
                  type="monotone"
                  dataKey="B2B"
                  stroke="none"
                  fill={`url(#${gB2b})`}
                  fillOpacity={1}
                  baseValue={0}
                />
                <Area
                  type="monotone"
                  dataKey="B2C"
                  stroke="none"
                  fill={`url(#${gB2c})`}
                  fillOpacity={1}
                  baseValue={0}
                />
                <Line
                  type="monotone"
                  dataKey="B2B"
                  stroke={B2B_STROKE}
                  strokeWidth={2}
                  dot={{ r: 3, fill: "white", stroke: B2B_STROKE, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f1f5f9", stroke: "#334155", strokeWidth: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="B2C"
                  stroke={B2C_STROKE}
                  strokeWidth={2}
                  dot={{ r: 3, fill: "white", stroke: B2C_STROKE, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f1f5f9", stroke: "#334155", strokeWidth: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
