"use client"

import { Eye } from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"

export interface TopBlogItemProps {
  imageSrc: string
  imageAlt?: string
  title: string
  views: number
  className?: string
}

export function TopBlogItem({
  imageSrc,
  imageAlt,
  title,
  views,
  className,
}: TopBlogItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg bg-white h-22 px-4",
        className
      )}
      role="listitem"
    >
      <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-md bg-white border border-border">
        {imageSrc && imageSrc.trim() !== "" ? (
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-muted" aria-hidden />
        )}
      </div>
      <p className="min-w-0 flex-1 text-sm font-medium text-foreground line-clamp-2">
        {title}
      </p>
      <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground">
        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span>{formatNumber(views)}</span>
      </div>
    </div>
  )
}
