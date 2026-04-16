"use client"

import { type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendUpIcon, TrendDownIcon } from "@/assets/icons"

export type SubKpiCardVariant = "success" | "warning" | "error" | "info" | "accent"

export interface SubKpiCardProps {
  title: string
  value: string
  subtitle?: string
  change?: string
  changeType?: "positive" | "negative"
  icon?: ReactNode
  variant?: SubKpiCardVariant
  background?: string
  image?: string
  imageClassName?: string
  subtitleBelowValue?: boolean
  className?: string
}

const DEFAULT_IMAGE_CLASS =
  "absolute -right-6 -bottom-5 w-[90px] h-[90px] md:w-[70px] md:h-[70px] sm:w-[60px] sm:h-[60px] object-contain select-none pointer-events-none kpi-spin-img"

export function SubKpiCard({
  title,
  value,
  subtitle,
  change,
  changeType = "positive",
  icon,
  variant = "info",
  background,
  image,
  imageClassName,
  subtitleBelowValue,
  className,
}: SubKpiCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all shrink-0",
        "w-full min-w-0 h-[160px] sm:h-auto sm:min-h-[160px] md:h-[140px]",
        className
      )}
    >
      <CardContent
        className="p-6 w-full h-full relative group overflow-hidden"
        style={background ? { background } : undefined}
      >
        <div className="flex h-full w-full items-stretch justify-between">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0">
              {!subtitleBelowValue && (
                <>
                  <p className="text-md font-medium mb-1">{title}</p>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </>
              )}
              {subtitleBelowValue && <p className="text-md font-medium mb-1">{title}</p>}
            </div>
            <div className="mt-auto flex flex-col gap-1.5 pt-4">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change && (() => {
                const fromIndex = change.indexOf(" From ")
                const pillContent = fromIndex >= 0 ? change.slice(0, fromIndex) : change
                const labelContent = fromIndex >= 0 ? change.slice(fromIndex + 1) : null
                return (
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                        changeType === "positive"
                          ? "bg-[#DBFCE7] text-[#016630]"
                          : "bg-[#660101]/10 text-[#660101]"
                      )}
                    >
                      {changeType === "positive" ? (
                        <TrendUpIcon className="h-3 w-3 shrink-0 text-current" />
                      ) : (
                        <TrendDownIcon className="h-3 w-3 shrink-0 text-current" />
                      )}
                      {pillContent}
                    </span>
                    {labelContent && (
                      <span className="text-xs text-muted-foreground">{labelContent}</span>
                    )}
                  </div>
                )
              })()}
              {subtitleBelowValue && subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {icon && <div className="absolute right-2 top-2">{icon}</div>}
        </div>
        {image && (
          <img
            src={image}
            alt=""
            className={cn(DEFAULT_IMAGE_CLASS, imageClassName)}
            draggable={false}
          />
        )}
      </CardContent>
    </Card>
  )
}
