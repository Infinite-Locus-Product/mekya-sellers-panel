"use client"

import { cn, formatNumber } from "@/lib/utils"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export type ChartDataPoint = {
  label: string
  value: number
  /** Optional payload for custom tooltip (e.g. topCategories) */
  payload?: Record<string, unknown>
}

export type PieChartLayout = "chart-left" | "chart-right" | "chart-center"
export type PieChartLabelPosition = "left" | "right" | "hidden"

interface PieChartProps {
  data: ChartDataPoint[]
  timeRange?: "1D" | "1W" | "1M" | "1Y"
  className?: string
  colors?: string[]
  layout?: PieChartLayout
  labelPosition?: PieChartLabelPosition
  showPercentages?: boolean
  showLegend?: boolean
  showTitle?: boolean
  title?: string
  chartSize?: number
  outerRadius?: number
  labelColumns?: number
  customTooltipFormatter?: (value: number, name: string) => [string, string]
  /** Custom tooltip content; receives Recharts tooltip props. When set, overrides default tooltip. */
  customTooltip?: (props: {
    active?: boolean
    payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, unknown> }>
    label?: string
  }) => React.ReactNode
  showFooter?: boolean
}

const MONTH_COLORS = [
  "#76CAF3",
  "#FF96DF",
  "#EFF68E",
  "#F7C159",
  "#9FFF8C", // May
  "#F0F05B", // Jun
  "#8585F1", // Jul
  "#1D8096", // Aug
  "#CC0F11", // Sep
  "#94FAD2", // Oct
  "#F8946A", // Nov
  "#FB9E9F", // Dec
]

const DEFAULT_COLORS = [
  "hsl(var(--info-dark))",
  "hsl(var(--success-dark))",
  "hsl(var(--warning-dark))",
  "hsl(var(--error-dark))",
  "hsl(var(--accent-dark))",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
]

export function PieChart({
  data,
  timeRange,
  className,
  colors,
  layout = "chart-left",
  labelPosition = "right",
  showPercentages = true,
  showLegend = true,
  showTitle = false,
  title = "Pie Chart",
  chartSize = 300,
  outerRadius = 120,
  labelColumns = 2,
  customTooltipFormatter,
  customTooltip,
  showFooter = true,
}: PieChartProps) {
  const isMonthData =
    data.length === 12 && (data[0]?.label === "January" || data[0]?.label === "Jan")

  const defaultColors = colors || (isMonthData ? MONTH_COLORS : DEFAULT_COLORS)

  const chartData = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: defaultColors[index % defaultColors.length],
    ...(item.payload && { payload: item.payload }),
  }))

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const renderLabels = () => {
    if (!showLegend || labelPosition === "hidden") return null

    return (
      <div
        className="grid gap-x-6 gap-y-2 flex-shrink-0"
        style={{ gridTemplateColumns: `repeat(${labelColumns}, minmax(0, 1fr))` }}
      >
        {chartData.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div
                className="w-5 h-5 rounded-lg flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground font-medium min-w-[85px]">
                {item.name}
                {showPercentages && (
                  <span className="pl-2 text-muted-foreground">{percentage}%</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const getTooltipFormatter = () => {
    if (customTooltipFormatter) {
      return customTooltipFormatter
    }
    return (value: number, name: string) => [name, ""]
  }

  const renderChart = () => (
    <div className="flex-shrink-0" style={{ width: `${chartSize}px`, height: `${chartSize}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              color: "hsl(var(--foreground))",
            }}
            content={
              customTooltip
                ? (props: { active?: boolean; payload?: unknown[]; label?: string }) =>
                    customTooltip({
                      active: props.active,
                      payload: props.payload as Array<{
                        name?: string
                        value?: number
                        color?: string
                        payload?: Record<string, unknown>
                      }>,
                      label: props.label,
                    })
                : ({ active, payload }: { active?: boolean; payload?: Array<{ value?: number; name?: string }> }) => {
                    if (!active || !payload?.length) return null
                    const entry = payload[0]
                    const value = Number(entry?.value ?? 0)
                    const name = String(entry?.name ?? "")
                    const [formattedName, formattedValue] = getTooltipFormatter()(value, name)
                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0"
                    return (
                      <div className="px-3 py-2 text-sm">
                        <div className="font-medium">{formattedName}</div>
                        {formattedValue ? `${formattedValue} (${pct}%)` : `${value} (${pct}%)`}
                      </div>
                    )
                  }
            }
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className={cn("flex flex-col gap-3 p-4 w-full", className)}>
      {showTitle && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{title}</span>
          {timeRange && <span>Range: {timeRange}</span>}
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-center gap-8",
          layout === "chart-center" && "flex-col"
        )}
      >
        {layout === "chart-right" && labelPosition === "left" && renderLabels()}
        {layout === "chart-left" && labelPosition === "left" && renderLabels()}

        {layout !== "chart-center" && renderChart()}

        {layout === "chart-center" && renderChart()}

        {layout === "chart-left" && labelPosition === "right" && renderLabels()}
        {layout === "chart-right" && labelPosition === "right" && renderLabels()}
      </div>

      {showFooter && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Total: {formatNumber(total)}</span>
          <span>Items: {data.length}</span>
        </div>
      )}
    </div>
  )
}
