"use client"

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

/** Uniform soft light blue for area under the line (matches reference). */
const AREA_FILL = "rgba(118, 183, 255, 0.38)"

export function LineChart({
  data,
  className,
  color = LINE_COLOR,
}: LineChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }))

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
            <Area
              type="basis"
              dataKey="value"
              stroke="none"
              fill={AREA_FILL}
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
