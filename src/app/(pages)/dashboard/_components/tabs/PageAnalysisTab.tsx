"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"

export interface PageAnalysisDataPoint {
  page: string
  bounceRate: number
  visitors: number
  avgTimeOnPage: number // in seconds
  exitRate: number
  trend: "up" | "down" | "stable"
}

interface PageAnalysisTabProps {
  data?: PageAnalysisDataPoint[]
}

// Get qualitative assessment based on bounce rate
const getBounceRateAssessment = (
  rate: number
): {
  label: string
  color: string
  bgColor: string
} => {
  if (rate <= 20) {
    return {
      label: "excellent",
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    }
  } else if (rate <= 30) {
    return {
      label: "Good",
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    }
  } else if (rate <= 45) {
    return {
      label: "Poor",
      color: "text-yellow-700 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    }
  } else {
    return {
      label: "Critical",
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    }
  }
}

// Format time from seconds to readable format
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export function PageAnalysisTab({ data }: PageAnalysisTabProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-muted/30 text-center space-y-3">
        <p className="text-sm text-muted-foreground">No page analysis data available</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Page-wise Bounce Rate Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {data.map((item) => {
            const assessment = getBounceRateAssessment(item.bounceRate)
            return (
              <div
                key={item.page}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{item.page}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(item.visitors)} visitors • {formatTime(item.avgTimeOnPage)} avg
                    time
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {item.bounceRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Bounce Rate</div>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                      assessment.bgColor,
                      assessment.color
                    )}
                  >
                    {assessment.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
