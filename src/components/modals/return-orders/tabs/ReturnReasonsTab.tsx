"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PieChart } from "@/components/analytics"
import { formatNumber } from "@/lib/utils"

export interface ReturnReasonDataPoint {
  type: string
  label: string
  percentage: number
  customers: number
  color: string
}

interface ReturnReasonsTabProps {
  data?: ReturnReasonDataPoint[]
}

const DEFAULT_RETURN_REASONS_DATA: ReturnReasonDataPoint[] = [
  {
    type: "defective",
    label: "Defective Product",
    percentage: 30,
    customers: 102,
    color: "#FDE047",
  },
  {
    type: "wrong_size",
    label: "Wrong Size",
    percentage: 50,
    customers: 380,
    color: "#4ADE80",
  },
  {
    type: "change_of_mind",
    label: "Change of Mind",
    percentage: 10,
    customers: 80,
    color: "#EF4444",
  },
  {
    type: "not_as_described",
    label: "Not as Described",
    percentage: 10,
    customers: 20,
    color: "#3B82F6",
  },
]

export function ReturnReasonsTab({ data = DEFAULT_RETURN_REASONS_DATA }: ReturnReasonsTabProps) {
  const chartData = data.map((item) => ({ label: item.label, value: item.percentage }))
  const totalCustomers = data.reduce((sum, item) => sum + item.customers, 0)
  const maxCustomers = Math.max(...data.map((item) => item.customers), 1)

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="pb-0" />
      <CardContent className="space-y-6 pt-2">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: AOV by Customer Type */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white/70 p-6 shadow-sm">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 13.3333C15.2614 13.3333 17.5 14.8257 17.5 16.6667V17.5H7.5V16.6667C7.5 14.8257 9.73858 13.3333 12.5 13.3333ZM12.5 11.6667C10.1988 11.6667 8.33333 9.80118 8.33333 7.5C8.33333 5.19881 10.1988 3.33333 12.5 3.33333C14.8012 3.33333 16.6667 5.19881 16.6667 7.5C16.6667 9.80118 14.8012 11.6667 12.5 11.6667ZM4.16667 15.8333V15.5401C4.16641 14.341 4.90802 13.2373 6.0125 12.8008L5.70083 11.9058C4.15456 12.5168 3.16104 13.9169 3.3375 15.56H4.16667V15.8333ZM5.83333 9.16667C4.45262 9.16667 3.33333 8.04738 3.33333 6.66667C3.33333 5.28595 4.45262 4.16667 5.83333 4.16667C6.015 4.16667 6.18833 4.19583 6.35333 4.24917L6.61167 3.3925C6.3625 3.35333 6.10167 3.33333 5.83333 3.33333C3.99238 3.33333 2.5 4.82571 2.5 6.66667C2.5 8.50762 3.99238 10 5.83333 10C6.09667 10 6.35083 9.97833 6.595 9.9325L6.37667 9.1125C6.2025 9.14833 6.02083 9.16667 5.83333 9.16667Z" fill="#1F2937"/>
                </svg>
              </span>
              <span>Return Reasons</span>
            </p>
            <div className="flex flex-col items-center gap-6 mt-2 md:flex-row">
              <div className="flex-1 flex justify-center">
                <PieChart
                  data={chartData}
                  colors={data.map((item) => item.color)}
                  layout="chart-center"
                  labelPosition="hidden"
                  showLegend={false}
                  chartSize={180}
                  outerRadius={80}
                  showFooter={false}
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {data.map((item) => {
                  return (
                    <div key={item.type} className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {item.label} : {item.percentage}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Numbers of customers */}
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white/70 p-6 shadow-sm">
            <div>
              <p className="flex items-center gap-2 font-medium text-foreground border-b-0">
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 13.3333C15.2614 13.3333 17.5 14.8257 17.5 16.6667V17.5H7.5V16.6667C7.5 14.8257 9.73858 13.3333 12.5 13.3333ZM12.5 11.6667C10.1988 11.6667 8.33333 9.80118 8.33333 7.5C8.33333 5.19881 10.1988 3.33333 12.5 3.33333C14.8012 3.33333 16.6667 5.19881 16.6667 7.5C16.6667 9.80118 14.8012 11.6667 12.5 11.6667ZM4.16667 15.8333V15.5401C4.16641 14.341 4.90802 13.2373 6.0125 12.8008L5.70083 11.9058C4.15456 12.5168 3.16104 13.9169 3.3375 15.56H4.16667V15.8333ZM5.83333 9.16667C4.45262 9.16667 3.33333 8.04738 3.33333 6.66667C3.33333 5.28595 4.45262 4.16667 5.83333 4.16667C6.015 4.16667 6.18833 4.19583 6.35333 4.24917L6.61167 3.3925C6.3625 3.35333 6.10167 3.33333 5.83333 3.33333C3.99238 3.33333 2.5 4.82571 2.5 6.66667C2.5 8.50762 3.99238 10 5.83333 10C6.09667 10 6.35083 9.97833 6.595 9.9325L6.37667 9.1125C6.2025 9.14833 6.02083 9.16667 5.83333 9.16667Z" fill="#1F2937"/>
                  </svg>
                </span>
                <span>Return Reasons Details</span>
              </p>
            </div>
            <div className="space-y-6">
              {data.map((item) => {
                const ratio = maxCustomers > 0 ? item.customers / maxCustomers : 0
                return (
                  <div key={`${item.type}-detail`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span className="font-normal">{item.label}</span>
                      <span>{formatNumber(item.customers)} Returns</span>
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
