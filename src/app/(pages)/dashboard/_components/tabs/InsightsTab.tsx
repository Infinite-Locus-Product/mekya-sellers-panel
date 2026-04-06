"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  type: "warning" | "error" | "info" | "positive"
  title: string
  description: string
  recommendation: string
}

interface InsightsTabProps {
  insights?: Insight[]
}

const DEFAULT_INSIGHTS: Insight[] = [
  {
    type: "error",
    title: "High Bounce Rate on Checkout Page",
    description:
      "Checkout page has 52.7% bounce rate, indicating potential issues with the checkout process.",
    recommendation: "Simplify checkout form and add progress indicators.",
  },
  {
    type: "error",
    title: "Mobile Users Bouncing More",
    description: "Mobile users have 23% higher bounce rates than desktop users.",
    recommendation: "Optimize mobile experience and page loading speeds.",
  },
  {
    type: "info",
    title: "Improving Trend",
    description:
      "Overall bounce rate has decreased by 2.1% compared to last month, showing positive improvement.",
    recommendation: "Continue monitoring and maintain current optimization strategies.",
  },
]

const getInsightIcon = (type: Insight["type"]) => {
  switch (type) {
    case "warning":
    case "error":
      return (
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      )
    case "info":
    case "positive":
      return (
        <div className="flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
      )
  }
}

export function InsightsTab({ insights = DEFAULT_INSIGHTS }: InsightsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.title} className="p-4 rounded-lg bg-muted/30 border border-border shadow-sm">
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-2">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="p-3 rounded bg-muted/70 border border-border/50">
                    <p className="text-sm text-foreground">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
