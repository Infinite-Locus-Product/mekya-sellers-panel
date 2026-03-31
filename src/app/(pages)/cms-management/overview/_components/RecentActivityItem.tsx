"use client"

import { cn } from "@/lib/utils"
import { ActiveBannersIcon, PendingReelsIcon, PublishedBlogsIcon } from "@/assets/icons"

export type ActivityType = "image" | "blog" | "video"

/** Icon tile background when no thumbnail; cycles by list position. */
const RECENT_ACTIVITY_ACCENT_BACKGROUNDS = [
  "bg-[#C1EEFF]",
  "bg-[#FFBABB]",
  "bg-[#FFE4AF]",
] as const

function ActivityKpiIcon({ type }: { type: ActivityType }) {
  if (type === "image") return <ActiveBannersIcon />
  if (type === "video") return <PendingReelsIcon />
  return <PublishedBlogsIcon />
}

export interface RecentActivityItemProps {
  type: ActivityType
  title: string
  status: string
  timeAgo: string

  imageSrc?: string
  /** List position (0-based); drives repeating accent background when no image. */
  index?: number
  className?: string
}

export function RecentActivityItem({
  type,
  title,
  status,
  timeAgo,
  imageSrc,
  index = 0,
  className,
}: RecentActivityItemProps) {
  const accentBg =
    RECENT_ACTIVITY_ACCENT_BACKGROUNDS[
      index % RECENT_ACTIVITY_ACCENT_BACKGROUNDS.length
    ]

  return (
    <div
      className={cn("flex items-start gap-4  rounded-lg p-4", className)}
      role="listitem"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md overflow-hidden",
          imageSrc && imageSrc.trim() !== ""
            ? "border border-border bg-white"
            : accentBg
        )}
      >
        {imageSrc && imageSrc.trim() !== "" ? (
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ActivityKpiIcon type={type} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {status} • {timeAgo}
        </p>
      </div>
    </div>
  )
}
