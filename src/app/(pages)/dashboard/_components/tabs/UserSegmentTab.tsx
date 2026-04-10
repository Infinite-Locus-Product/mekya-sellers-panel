"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface UserSegmentTabProps {
  data?: { buyersCount: number; sellersCount: number }
}

export function UserSegmentTab({ data }: UserSegmentTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Segment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Buyers</p>
              <p className="text-2xl font-semibold text-foreground">{data.buyersCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Sellers</p>
              <p className="text-2xl font-semibold text-foreground">{data.sellersCount}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
            Segment data unavailable
          </div>
        )}
      </CardContent>
    </Card>
  )
}

