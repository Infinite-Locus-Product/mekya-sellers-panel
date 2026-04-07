"use client"

import { useId } from "react"
import { cn, formatCurrencyINR } from "@/lib/utils"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  Tooltip,
  type TooltipProps,
} from "recharts"

export type ChartDataPoint = {
  label: string
  value: number
}

const LINE_COLOR = "#2563eb"

/** Vertical dashed line at cursor band (Recharts passes x, y, width, height). */
function VerticalLineCursor(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  stroke?: string
}) {
  const { x = 0, y = 0, width = 0, height = 0, stroke = "#d1d5db" } = props
  const cx = x + width / 2
  return (
    <line
      x1={cx}
      y1={y}
      x2={cx}
      y2={y + height}
      stroke={stroke}
      strokeDasharray="4 4"
      strokeWidth={1}
    />
  )
}

/** Full month name from short label (e.g. "Aug" -> "August"). */
function fullMonthName(short: string): string {
  const map: Record<string, string> = {
    Jan: "January", Feb: "February", Mar: "March", Apr: "April",
    May: "May", Jun: "June", Jul: "July", Aug: "August",
    Sep: "September", Oct: "October", Nov: "November", Dec: "December",
  }
  return map[short] ?? short
}

interface LineChartProps {
  data: ChartDataPoint[]
  timeRange?: "1D" | "1W" | "1M" | "1Y"
  className?: string
  color?: string
}

export function LineChart({
  data,
  className,
  timeRange,
  color = LINE_COLOR,
}: LineChartProps) {
  const chartData = (() => {
    switch (timeRange) {
      case "1D": {
        const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        return data.slice(0, hours.length).map((item, index) => ({ name: hours[index], value: item.value }))
      }
      case "1W": {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return data.slice(0, days.length).map((item, index) => ({ name: days[index], value: item.value }))
      }
      case "1M": {
        const dates = ["05", "10", "15", "20", "25", "30"]
        return data.slice(0, dates.length).map((item, index) => ({ name: dates[index], value: item.value }))
      }
      case "1Y": {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return data.slice(0, months.length).map((item, index) => ({ name: months[index], value: item.value }))
      }
      default:
        return data.map(item => ({ name: item.label, value: item.value }))
    }
  })()
  const idSuffix = useId().replace(/[^a-zA-Z0-9-_]/g, "")
  const gradientId = `line-area-${idSuffix || "default"}`

  const renderTooltipContent: TooltipProps<number, string>["content"] = ({ active, payload, label }) => {
    if (!active || !payload?.length || label == null) return null
    const value = payload[0]?.value ?? 0
    const monthLabel = fullMonthName(String(label))
    return (
      <div
        className="relative rounded-lg px-3 py-2 shadow-md"
        style={{
          backgroundColor: "#374151",
          color: "white",
        }}
      >
        <div className="text-sm font-medium leading-tight">{monthLabel}</div>
        <div className="text-xs mt-0.5 opacity-90">{formatCurrencyINR(value)}</div>
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: -6,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #374151",
          }}
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg w-full h-full min-h-[300px]",
        className
      )}
    >
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
              horizontal={true}
            />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              ticks={[1000, 2000, 3000, 4000, 5000]}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={renderTooltipContent}
              cursor={<VerticalLineCursor />}
              wrapperStyle={{ outline: "none" }}
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="-0.19%" stopColor="rgba(0, 122, 255, 0)" />
                <stop offset="59.55%" stopColor="rgba(118, 183, 255, 0.38)" />
                <stop offset="100%" stopColor="rgba(118, 183, 255, 0)" />
              </linearGradient>
            </defs>
            <Area
              type="basis"
              dataKey="value"
              stroke="none"
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              baseValue={0}
            />
            <Line
              type="basis"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                fill: color,
                stroke: "white",
                strokeWidth: 2,
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
