"use client"

import { useEffect, useId, useRef, useState } from "react"
import { cn, formatCurrencyINR, formatNumber } from "@/lib/utils"
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
  /** Accepted so callers can keep passing their range selector's value, but no longer used
   *  for labelling — point labels come from `data[].label`. See chartData below. */
  timeRange?: "1D" | "1W" | "1M" | "1Y"
  className?: string
  color?: string
  /**
   * What the values mean, which decides both the tooltip and the Y axis:
   * - `default` — money. INR tooltip, axis in thousands ("5k").
   * - `views` — CMS view counts. Fixed 0-based axis with stepped ticks.
   * - `count` — a plain tally (orders, requests…). Whole-number axis that scales to the
   *   real range, so a chart of 1-2 items doesn't render five "0k" ticks and a "₹2"
   *   tooltip the way the money variant would.
   */
  variant?: "default" | "views" | "count"
  /** Unit shown after the value in the tooltip for non-money variants. */
  unitLabel?: string
}

export function LineChart({
  data,
  className,
  color = LINE_COLOR,
  variant = "default",
  unitLabel,
}: LineChartProps) {
  // Labels come from the API, which already knows its own granularity (hour/day/month) and
  // labels each point accordingly. This used to overwrite them positionally from a fixed
  // list keyed off `timeRange` — scaffolding from the mock-data era that assumed the series
  // was always exactly 12 months / 7 weekdays / 12 hours. Against real data of any other
  // length it silently mislabels every point (10 daily points became "Jan".."Oct").
  const chartData = data.map((item) => ({ name: item.label, value: item.value }))

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

  const containerRef = useRef<HTMLDivElement>(null)
  // `ResponsiveContainer`'s own internal measurement of its parent (e.g. inside a
  // portaled Dialog, before layout has settled) can come up 0 and never self-correct,
  // producing NaN for every SVG coordinate. Bypass that entirely by measuring the
  // parent ourselves. Crucially, this starts at a real, non-zero fallback width (not 0)
  // — the chart must never be gated on a measurement succeeding, since if THAT
  // measurement itself gets stuck (whatever the reason), a "render nothing until
  // measured" gate just trades a NaN crash for a permanently blank chart instead. The
  // real measurement below only refines this default; it doesn't gate the first render.
  const DEFAULT_CHART_WIDTH = 600
  const [measuredWidth, setMeasuredWidth] = useState(DEFAULT_CHART_WIDTH)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (el.clientWidth > 0) {
      queueMicrotask(() => setMeasuredWidth(el.clientWidth))
    }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      if (width > 0) setMeasuredWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const chartMargin =
    variant === "views"
      ? { top: 12, right: 12, left: 8, bottom: 8 }
      : { top: 16, right: 16, left: 8, bottom: 8 }

  const renderTooltipContent: TooltipProps<number, string>["content"] = ({ active, payload, label }) => {
    if (!active || !payload?.length || label == null) return null
    const value = payload[0]?.value ?? 0
    const isViews = variant === "views"
    const isCount = variant === "count"
    const unit = unitLabel ?? (isViews ? "views" : "")
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
          {isViews || isCount
            ? `${formatNumber(value)}${unit ? ` ${unit}` : ""}`
            : formatCurrencyINR(value)}
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
        "flex w-full flex-col rounded-lg min-h-[300px]",
        className
      )}
    >
      {/* Explicit height required, and width is measured ourselves (see measuredWidth) rather
          than trusting ResponsiveContainer's own auto-measurement inside a portaled Dialog. */}
      <div ref={containerRef} className="h-[300px] w-full">
          <ComposedChart width={measuredWidth} height={300} data={chartData} margin={chartMargin}>
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
              width={variant === "views" ? 28 : 60}
              tickMargin={variant === "views" ? 4 : 5}
              domain={variant === "views" ? [0, viewAxisMax] : ["auto", "auto"]}
              ticks={variant === "views" ? viewTicks : undefined}
              // A tally must never be divided by 1000 — a chart of 1-2 orders would show
              // "0k" on every tick — nor show fractional ticks for whole things.
              allowDecimals={variant !== "count"}
              tickFormatter={(value) => {
                if (variant === "views") return `${value}`
                if (variant === "count") return formatNumber(Number(value))
                return `${(value / 1000).toFixed(0)}k`
              }}
            />
            <Tooltip
              content={renderTooltipContent}
              cursor={<VerticalLineCursor />}
              wrapperStyle={{ outline: "none" }}
            />
            <defs>
              <LineChartAreaGradient id={gradientId} lineColor={color} />
            </defs>
            {/* `monotone`, not `basis`: a basis spline only *approximates* its control points,
                so the curve never reaches them — the 03 Aug peak of ₹43,508 was drawn at
                roughly ₹30k while the tooltip and dot reported the true figure. `monotone`
                interpolates through every point (and won't overshoot into fake dips between
                them), so the line agrees with the data it plots. */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              baseValue={0}
            />
            <Line
              type="monotone"
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
      </div>
    </div>
  )
}
