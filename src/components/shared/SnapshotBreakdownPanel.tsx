"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PieChart } from "@/components/analytics"
import { formatNumber } from "@/lib/utils"

export interface SnapshotBreakdownItem {
  type: string
  label: string
  percentage: number
  count: number
  color: string
}

interface SnapshotBreakdownPanelProps {
  data?: SnapshotBreakdownItem[]
  /** Icon + heading above the pie (e.g. "Return Reasons"). */
  title: string
  /** Heading above the right-hand detail bars (e.g. "Return Reasons Details"). */
  detailsTitle: string
  /** Appended after each count in the detail list, e.g. "Returns" or "Orders". */
  unitLabel: string
  emptyMessage: string
}

/**
 * Real-data pie + bar-list breakdown, shared by every "snapshot" (non-time-series) tab
 * across the KPI analytics modals (Order Status, Return Reasons, Gender, Return Rate) —
 * extracted so each one isn't a near-identical copy of the same ~80 lines.
 */
export function SnapshotBreakdownPanel({
  data,
  title,
  detailsTitle,
  unitLabel,
  emptyMessage,
}: Readonly<SnapshotBreakdownPanelProps>) {
  const items = data ?? []
  const hasData = items.some((item) => item.count > 0)
  const chartData = items
    .filter((item) => item.count > 0)
    .map((item) => ({ label: item.label, value: item.percentage }))
  const maxCount = Math.max(...items.map((item) => item.count), 1)

  if (!hasData) {
    return (
      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="pt-2">
          <div className="flex h-72 items-center justify-center rounded-2xl border border-border bg-white/70 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="pb-0" />
      <CardContent className="space-y-6 pt-2">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white/70 p-6 shadow-sm">
            <p className="font-medium text-foreground">{title}</p>
            <div className="flex flex-col items-center gap-6 mt-2 md:flex-row">
              <div className="flex-1 flex justify-center">
                <PieChart
                  data={chartData}
                  colors={items.filter((i) => i.count > 0).map((item) => item.color)}
                  layout="chart-center"
                  labelPosition="hidden"
                  showLegend={false}
                  chartSize={180}
                  outerRadius={80}
                  showFooter={false}
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {items.map((item) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.label} : {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white/70 p-6 shadow-sm">
            <p className="font-medium text-foreground">{detailsTitle}</p>
            <div className="space-y-6">
              {items.map((item) => {
                const ratio = maxCount > 0 ? item.count / maxCount : 0
                return (
                  <div key={`${item.type}-detail`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span className="font-normal">{item.label}</span>
                      <span>
                        {formatNumber(item.count)} {unitLabel}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className="h-3 rounded-full"
                        style={{ width: `${ratio * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
