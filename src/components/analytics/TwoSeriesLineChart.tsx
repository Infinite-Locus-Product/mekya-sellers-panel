"use client"

import { useEffect, useId, useRef, useState } from "react"
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
import { cn, formatNumber } from "@/lib/utils"

export interface TwoSeriesLineChartDataPoint {
  label: string
  a: number
  b: number
}

interface TwoSeriesLineChartProps {
  data: TwoSeriesLineChartDataPoint[]
  seriesALabel: string
  seriesBLabel: string
  seriesAColor?: string
  seriesBColor?: string
  valuePrefix?: string
  /** Appended after the tooltip value, e.g. " Orders". Empty for currency series. */
  valueSuffix?: string
  /** Y axis in thousands ("5k"). Turn off for small counts, where every tick would
   *  otherwise round to "0k". */
  compactAxis?: boolean
  className?: string
}

/**
 * Two-line time-series comparison (e.g. B2B vs B2C, New vs Returning). Measures
 * its own width via ResizeObserver and passes a real pixel value to the chart
 * instead of relying on recharts' `ResponsiveContainer` — that auto-measurement
 * has been observed to land on 0 inside a portaled Dialog and never
 * self-correct, producing NaN for every SVG coordinate (see LineChart.tsx for
 * the same fix and full writeup). Starts at a non-zero default so the chart
 * never renders blank even if the real measurement is slow to arrive.
 */
export function TwoSeriesLineChart({
  data,
  seriesALabel,
  seriesBLabel,
  seriesAColor = "#38BDF8",
  seriesBColor = "#D97706",
  valuePrefix = "₹",
  valueSuffix = "",
  compactAxis = true,
  className,
}: TwoSeriesLineChartProps) {
  const idSuffix = useId().replace(/[^a-zA-Z0-9-_]/g, "")
  const gA = `tsl-a-${idSuffix || "a"}`
  const gB = `tsl-b-${idSuffix || "b"}`

  function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (active && payload && payload.length) {
      // Each series renders both an Area (gradient fill) and a Line (visible stroke/dots)
      // sharing the same dataKey — recharts includes an entry per graphical element, not
      // per series, so without this the tooltip lists every series twice. Keep the LAST
      // entry per key (the Line, rendered after its Area below) rather than the first —
      // the Area's `color` reflects its gradient fill, not the series' solid color, so
      // deduping to the first entry left the tooltip's dot with no visible color.
      const byKey = new Map<string, (typeof payload)[number]>()
      for (const entry of payload) {
        byKey.set(String(entry.dataKey ?? entry.name ?? ""), entry)
      }
      const uniquePayload = Array.from(byKey.values())
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2 text-sm text-foreground">{String(label ?? "")}</p>
          {uniquePayload.map((entry) => (
            <div
              key={`${entry.name ?? "series"}-${entry.dataKey ?? "value"}`}
              className="flex items-center gap-2 mb-1"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-muted-foreground">
                {String(entry.name ?? entry.dataKey ?? "Value")} :{" "}
                <span className="text-foreground">
                  {valuePrefix}
                  {formatNumber(typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0))}
                  {valueSuffix}
                </span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const chartData = data.map((item) => ({
    name: item.label,
    [seriesALabel]: item.a,
    [seriesBLabel]: item.b,
  }))

  const containerRef = useRef<HTMLDivElement>(null)
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

  return (
    <div ref={containerRef} className={cn("flex h-full w-full flex-col", className)}>
      <div className="mb-2 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: seriesAColor }}
            aria-hidden
          />
          {seriesALabel}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: seriesBColor }}
            aria-hidden
          />
          {seriesBLabel}
        </span>
      </div>
      <ComposedChart
        width={measuredWidth}
        height={320}
        data={chartData}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical horizontal />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "gray", strokeWidth: 1 }}
          tickMargin={10}
        />
        {/* Explicit width/tickMargin: recharts 2.x supplies these through defaultProps,
            which React 19 no longer applies to function components — left undefined they
            make the plot-width arithmetic NaN and the chart paints nothing. */}
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: "gray", strokeWidth: 1 }}
          tickFormatter={(value) =>
            compactAxis ? `${(value / 1000).toFixed(0)}k` : formatNumber(Number(value))
          }
          domain={["auto", "auto"]}
          allowDecimals={compactAxis}
          width={56}
          tickMargin={5}
        />
        <Tooltip
          cursor={{ stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={CustomTooltip}
        />
        <defs>
          <LineChartAreaGradient id={gA} lineColor={seriesAColor} />
          <LineChartAreaGradient id={gB} lineColor={seriesBColor} />
        </defs>
        <Area type="monotone" dataKey={seriesALabel} stroke="none" fill={`url(#${gA})`} fillOpacity={1} baseValue={0} />
        <Area type="monotone" dataKey={seriesBLabel} stroke="none" fill={`url(#${gB})`} fillOpacity={1} baseValue={0} />
        <Line
          type="monotone"
          dataKey={seriesALabel}
          stroke={seriesAColor}
          strokeWidth={2}
          dot={{ r: 3, fill: "white", stroke: seriesAColor, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#f1f5f9", stroke: "#334155", strokeWidth: 4 }}
        />
        <Line
          type="monotone"
          dataKey={seriesBLabel}
          stroke={seriesBColor}
          strokeWidth={2}
          dot={{ r: 3, fill: "white", stroke: seriesBColor, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#f1f5f9", stroke: "#334155", strokeWidth: 4 }}
        />
      </ComposedChart>
    </div>
  )
}
