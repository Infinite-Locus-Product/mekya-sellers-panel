"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "lucide-react"

export interface HeatmapDataPoint {
  page: string
  mobile: number
  tablet: number
  desktop: number
}

interface HeatmapTableProps {
  data: HeatmapDataPoint[]
  title?: string
  className?: string
}

// Color coding function based on bounce rate - returns badge colors
const getBounceRateColor = (rate: number): string => {
  if (rate <= 20) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  } else if (rate <= 35) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  } else {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
}

export function HeatmapTable({
  data,
  title = "Bounce Rate Heatmap by Device",
  className,
}: HeatmapTableProps) {
  const devices = ["Mobile", "Tablet", "Desktop"] as const

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground bg-muted/50">
                    Page
                  </th>
                  {devices.map((device) => (
                    <th
                      key={device}
                      className="px-4 py-3 text-center text-sm font-semibold text-foreground bg-muted/50"
                    >
                      {device}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.page} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{row.page}</td>
                    {devices.map((device) => {
                      const rate = row[device.toLowerCase() as keyof HeatmapDataPoint] as number
                      return (
                        <td key={device} className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium",
                              getBounceRateColor(rate)
                            )}
                          >
                            {rate.toFixed(1)}%
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
