"use client"

import { useId } from "react"
import { cn, formatCurrencyINR, formatNumber } from "@/lib/utils"
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
import { LineChartAreaGradient } from "./LineChartAreaGradient"

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

function fullWeekdayName(short: string): string {
  const map: Record<string, string> = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  }
  return map[short] ?? short
}

function niceCeilViewAxis(max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 500
  const step = max <= 500 ? 100 : max <= 2000 ? 200 : 500
  return Math.max(step, Math.ceil(max / step) * step)
}

interface LineChartProps {
  data: ChartDataPoint[]
  timeRange?: "1D" | "1W" | "1M" | "1Y"
  className?: string
  color?: string
  /** `views`: count axis + "views" tooltip (CMS analytics). Default: INR sales tooltip + fixed k-axis. */
  variant?: "default" | "views"
}

export function LineChart({
  data,
  className,
  timeRange,
  color = LINE_COLOR,
  variant = "default",
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

  const maxValue = Math.max(0, ...chartData.map((d) => d.value))
  const viewAxisMax = niceCeilViewAxis(maxValue)
  const viewStep =
    viewAxisMax <= 500 ? 100 : viewAxisMax <= 2000 ? 200 : 500
  const viewTicks = Array.from(
    { length: Math.floor(viewAxisMax / viewStep) + 1 },
    (_, i) => i * viewStep
  )

  const idSuffix = useId().replace(/[^a-zA-Z0-9-_]/g, "")
  const gradientId = `line-area-${idSuffix || "default"}`

  const chartMargin =
    variant === "views"
      ? { top: 12, right: 12, left: 8, bottom: 8 }
      : { top: 16, right: 16, left: 8, bottom: 8 }

  const renderTooltipContent: TooltipProps<number, string>["content"] = ({ active, payload, label }) => {
    if (!active || !payload?.length || label == null) return null
    const value = payload[0]?.value ?? 0
    const isViews = variant === "views"
    const lab = String(label)
    const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
    const timeLabel = WEEK.includes(lab as (typeof WEEK)[number])
      ? fullWeekdayName(lab)
      : fullMonthName(lab)
    return (
      <div
        className="relative rounded-lg px-3 py-2 shadow-md"
        style={{
          backgroundColor: "#374151",
          color: "white",
        }}
      >
        <div className="text-sm font-medium leading-tight">{timeLabel}</div>
        <div className="text-xs mt-0.5 opacity-90">
          {isViews ? `${formatNumber(value)} views` : formatCurrencyINR(value)}
        </div>
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
        // No h-full: percentage height breaks ResponsiveContainer when the parent only has min-height / auto height (e.g. CMS analytics grid).
        "flex w-full flex-col rounded-lg min-h-[300px]",
        className
      )}
    >
      {/* Explicit height required: Recharts ResponsiveContainer measures parent; % height collapses without it */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={chartMargin}>
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
              width={variant === "views" ? 28 : undefined}
              tickMargin={variant === "views" ? 4 : undefined}
              domain={variant === "views" ? [0, viewAxisMax] : undefined}
              ticks={variant === "views" ? viewTicks : [1000, 2000, 3000, 4000, 5000]}
              tickFormatter={(value) =>
                variant === "views" ? `${value}` : `${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              content={renderTooltipContent}
              cursor={<VerticalLineCursor />}
              wrapperStyle={{ outline: "none" }}
            />
            <defs>
              <LineChartAreaGradient id={gradientId} lineColor={color} />
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
