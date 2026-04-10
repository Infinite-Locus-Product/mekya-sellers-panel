"use client"

import { cn, formatNumber } from "@/lib/utils"
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

export type MultiLineChartDataPoint = {
  label: string
  totalSeller: number
  activeSeller: number
  newSeller: number
}

interface MultiLineChartProps {
  data: MultiLineChartDataPoint[]
  timeRange?: "1D" | "1W" | "1M" | "1Y"
  className?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2 text-sm">{String(label ?? "").toUpperCase()}</p>
        {payload.map((entry) => (
          <div key={`${entry.name ?? "series"}-${entry.dataKey ?? "value"}`} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">
              {String(entry.name ?? entry.dataKey ?? "Value")} :{" "}
              {formatNumber(typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function MultiLineChart({ data, timeRange, className }: MultiLineChartProps) {
  const chartData = data.map((item, index) => {
    let newLabel = item.label
    switch (timeRange) {
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
      "Total Seller": item.totalSeller,
      "Active Seller": item.activeSeller,
      "New Seller": item.newSeller,
    }
  })

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 w-full relative",
        className
      )}
    >
      <div className="w-full" style={{ height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.2}
            />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "gray", strokeWidth: 1 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "gray", strokeWidth: 1 }}
              ticks={[1000, 2000, 3000, 4000, 5000]}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={CustomTooltip} />
            <Line
              type="monotone"
              dataKey="Total Seller"
              stroke="#76B7FF"
              strokeWidth={2}
              dot={{ r: 4, fill: "#76B7FF" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Active Seller"
              stroke="#FFD700"
              strokeWidth={2}
              dot={{ r: 4, fill: "#FFD700" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="New Seller"
              stroke="#DC143C"
              strokeWidth={2}
              dot={{ r: 4, fill: "#DC143C" }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
