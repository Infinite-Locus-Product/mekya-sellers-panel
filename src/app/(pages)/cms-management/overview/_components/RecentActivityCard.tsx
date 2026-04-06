"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RotateCw } from "lucide-react"
import { RecentActivityRefreshIcon } from "@/assets/icons"
import { RecentActivityItem, type ActivityType } from "./RecentActivityItem"

export interface RecentActivityEntry {
  type: ActivityType
  title: string
  status: string
  timeAgo: string
}

export interface RecentActivityCardProps {
  title?: string
  subtitle?: string
  activities: RecentActivityEntry[]
  /** Image URL used for each activity item (avatar/thumbnail) */
  itemImageSrc?: string
  onRefresh?: () => void
  className?: string
}

export function RecentActivityCard({
  title = "Recent Activity",
  subtitle = "Monitor recent activity in real-time",
  activities,
  itemImageSrc,
  onRefresh,
  className,
}: RecentActivityCardProps) {
  return (
    <Card className={cn("bg-muted/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Refresh recent activity"
            >
              <RecentActivityRefreshIcon />

            </button>
          ) : (
            <span className="shrink-0 rounded-md p-1.5 text-muted-foreground" aria-hidden>
              <RotateCw className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-muted/30 rounded-b-lg">
        <ul className="space-y-3" role="list">
          {activities.map((activity, index) => (
            <li key={`${activity.title}-${index}`}>
              <RecentActivityItem
                type={activity.type}
                title={activity.title}
                status={activity.status}
                timeAgo={activity.timeAgo}
                imageSrc={itemImageSrc}
                index={index}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
