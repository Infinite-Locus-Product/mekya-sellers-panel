"use client"

import { cn, formatNumber } from "@/lib/utils"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export type ChartDataPoint = {
  label: string
  value: number
}

interface BarChartProps {
  data: ChartDataPoint[]
  /** Accepted so callers can keep passing their range selector's value, but no longer used
   *  for labelling — bar labels come from `data[].label`. See chartData below. */
  timeRange?: "1D" | "1W" | "1M" | "1Y"
  className?: string
  color?: string
}

export function BarChart({ data, className, color = "#76B7FF" }: BarChartProps) {
  // Labels come from the API, which already knows its own granularity (hour/day/month) and
  // labels each point accordingly. This used to overwrite them positionally from a fixed
  // list keyed off `timeRange` — scaffolding from the mock-data era that assumed the series
  // was always exactly 12 months / 7 weekdays / 12 hours. Against real data of any other
  // length it silently mislabels every point (10 daily points became "Jan".."Oct").
  const chartData = data.map((item) => ({ name: item.label, value: item.value }))

  return (
    <div className={cn("flex flex-col gap-3 rounded-lg w-full", className)}>
      <div className="w-full" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              opacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#9ca3af", strokeWidth: 2 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#9ca3af", strokeWidth: 2 }}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}k`
                }
                return value.toString()
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                color: "#111827",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#6b7280", marginBottom: "4px" }}
              formatter={(value: number | string) => [
                typeof value === "number" ? formatNumber(value) : value,
                "Sales",
              ]}
            />
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} barSize={42} activeBar={false} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
