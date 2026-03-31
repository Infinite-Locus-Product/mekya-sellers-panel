"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatNumber } from "@/lib/utils"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { LineChartIcon } from "@/assets/icons"
import { TimeRangeSelector } from "@/components/shared"
import type { TimeRange } from "@/components/shared/TimeRangeSelector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface UserGrowthDataPoint {
  period: string
  buyer: number
  seller: number
}

const DEFAULT_USER_GROWTH_DATA: UserGrowthDataPoint[] = [
  { period: "Jan", buyer: 1200, seller: 800 },
  { period: "Feb", buyer: 1350, seller: 850 },
  { period: "Mar", buyer: 1480, seller: 920 },
  { period: "Apr", buyer: 1620, seller: 980 },
  { period: "May", buyer: 1780, seller: 1050 },
  { period: "Jun", buyer: 1920, seller: 1120 },
  { period: "Jul", buyer: 2050, seller: 1180 },
  { period: "Aug", buyer: 2180, seller: 1250 },
  { period: "Sep", buyer: 2320, seller: 1320 },
  { period: "Oct", buyer: 2450, seller: 1380 },
  { period: "Nov", buyer: 2580, seller: 1420 },
  { period: "Dec", buyer: 2650, seller: 1480 },
]

const BUYER_COLOR = "#22c55e"
const SELLER_COLOR = "#ef4444"

interface EngagementTabProps {
  data?: UserGrowthDataPoint[]
}

function UserGrowthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>
            {entry.name}: {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function EngagementTab({ data = DEFAULT_USER_GROWTH_DATA }: EngagementTabProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>("1Y")
  const [activeChartType, setActiveChartType] = useState<string>("Line Chart")

  const chartData = data.map((d) => ({
    name: d.period,
    Buyer: d.buyer,
    Seller: d.seller,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <LineChartIcon className="h-full w-full" />
            </span>
            User Growth Over Time
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={activeChartType}
              onValueChange={setActiveChartType}
            >
              <SelectTrigger className="w-[140px] border-border bg-white px-3" size="sm">
                <SelectValue />
                <div className="h-4 w-px flex-shrink-0 bg-gray-300" aria-hidden />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Line Chart">
                  <span className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 shrink-0" />
                    Line Chart
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <TimeRangeSelector
              value={activeTimeRange}
              onValueChange={setActiveTimeRange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("relative h-96 w-full")}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={true}
                horizontal={true}
              />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#9ca3af", strokeWidth: 2 }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "#9ca3af", strokeWidth: 2 }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip content={<UserGrowthTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
              <Bar
                dataKey="Buyer"
                fill={BUYER_COLOR}
                radius={[4, 4, 0, 0]}
                barSize={28}
                name="Buyer"
              />
              <Bar
                dataKey="Seller"
                fill={SELLER_COLOR}
                radius={[4, 4, 0, 0]}
                barSize={28}
                name="Seller"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
