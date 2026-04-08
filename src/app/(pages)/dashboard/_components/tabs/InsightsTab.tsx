"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export function InsightsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
          Insights are not configured for this KPI yet.
        </div>
      </CardContent>
    </Card>
  )
}

