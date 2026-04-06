"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PieChart } from "@/components/analytics"
import { formatNumber } from "@/lib/utils"

export interface SalesChannelDataPoint {
  channel: string
  label: string
  orders: number
  color: string
  description?: string
}

interface SalesChannelTabProps {
  data?: SalesChannelDataPoint[]
}

const DEFAULT_SALES_CHANNEL_DATA: SalesChannelDataPoint[] = [
  {
    channel: "mobile",
    label: "Mobile App",
    orders: 40000,
    color: "#86D97B",
    description: "Orders from Mobile app",
  },
  {
    channel: "website",
    label: "Website",
    orders: 60000,
    color: "#D45A5A",
    description: "Orders from Website",
  },
]

export function SalesChannelTab({ data = DEFAULT_SALES_CHANNEL_DATA }: SalesChannelTabProps) {
  const totalOrders = data.reduce((sum, channel) => sum + channel.orders, 0)
  const maxOrders = Math.max(...data.map((channel) => channel.orders), 1)
  const chartData = data.map((channel) => ({ label: channel.label, value: channel.orders }))

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="pb-0">
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white/70 p-4 shadow-sm">
          <span>Sales by Channel</span>
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <div className="flex-1">
                <PieChart
                  data={chartData}
                  colors={data.map((channel) => channel.color)}
                  layout="chart-center"
                  labelPosition="hidden"
                  showLegend={false}
                  chartSize={180}
                  outerRadius={80}
                  showFooter={false}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {data.map((channel) => {
                  const percentage = totalOrders > 0 ? ((channel.orders / totalOrders) * 100).toFixed(1) : "0.0"
                return (
                  <div key={channel.channel} className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: channel.color }}
                      />
                      <div className="flex gap-2">
                        <span className="text-sm font-medium text-foreground">{channel.label}</span>
                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Details</p>
              </div>
            </div>
            <div className="space-y-5">
              {data.map((channel) => {
                const ratio = Math.min(1, channel.orders / maxOrders)
                const percentage = totalOrders > 0 ? ((channel.orders / totalOrders) * 100).toFixed(1) : "0.0"
                return (
                  <div key={`${channel.channel}-detail`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span>{channel.description ?? `Orders from ${channel.label}`}</span>
                      <span>{formatNumber(channel.orders)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/40">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${ratio * 100}%`, backgroundColor: channel.color }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{percentage}% of total</p>
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
