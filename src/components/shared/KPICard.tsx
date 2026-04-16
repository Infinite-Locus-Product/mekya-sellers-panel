import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { TrendUpIcon, TrendDownIcon } from "@/assets/icons"

export type KPICardVariant = "success" | "warning" | "error" | "info" | "accent"

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  change?: string
  changeType?: "positive" | "negative"
  changeDisplay?: "pill" | "text"
  icon?: ReactNode
  variant?: KPICardVariant
  className?: string
  onClick?: () => void
  href?: string
  background?: string
  image?: string
  imageClassName?: string
  subtitleBelowValue?: boolean
}

const variantStyles: Record<KPICardVariant, string> = {
  success: "bg-gradient-to-br from-[var(--success-light)] to-[var(--success-light)]/50",
  warning: "bg-gradient-to-br from-[var(--warning-light)] to-[var(--warning-light)]/50",
  error: "bg-gradient-to-br from-[var(--error-light)] to-[var(--error-light)]/50",
  info: "bg-gradient-to-br from-[var(--info-light)] to-[var(--info-light)]/50",
  accent: "bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent-light)]/50",
}

const DEFAULT_IMAGE_CLASS =
  "absolute -right-8 -bottom-8 w-[120px] h-[120px] md:w-[120px] md:h-[110px] sm:w-[110px] sm:h-[100px] object-contain select-none pointer-events-none kpi-spin-img scale-[1.2]"

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeType = "positive",
  changeDisplay = "pill",
  icon,
  variant = "info",
  className,
  onClick,
  href,
  background,
  image,
  imageClassName,
  subtitleBelowValue,
}: KPICardProps) {
  const interactive = Boolean(href || onClick)
  const card = (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        "w-full min-w-0 h-[160px] sm:h-auto sm:min-h-[160px] md:h-[140px]",
        interactive && "cursor-pointer hover:shadow-md",
        !href && className
      )}
      onClick={href ? undefined : onClick}
    >
      <CardContent
        className={cn(
          "p-6 w-full h-full relative group",
          background ? undefined : variantStyles[variant]
        )}
        style={background ? { background: background } : undefined}
      >
        <div className="flex items-stretch w-full h-full justify-between">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col h-full">
            <div className="shrink-0">
              <p className="text-md font-medium mb-1">{title}</p>
              {!subtitleBelowValue && subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="mt-auto flex flex-col gap-1.5 pt-4">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {change &&
                (changeDisplay === "text" ? (
                  <p className="text-sm text-muted-foreground">{change}</p>
                ) : (
                  (() => {
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
                  })()
                ))}
              {subtitleBelowValue && subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {icon && <div className="  absolute right-2 top-2 bg-[linear-gradient(180deg,_#F9F9F9_0%,_rgba(189,189,189,0.73)_100%)] rounded-full p-2 shadow-[inset_0px_4px_4px_0px_#00000040]">{icon}</div>}
        </div>
        {image && (
          <Image
            src={image}
            width={120}
            height={120}
            sizes="(max-width: 640px) 90px, (max-width: 768px) 110px, 140px"
            alt="KPI Card Decoration"
            className={cn(DEFAULT_IMAGE_CLASS, imageClassName)}
            draggable="false"
            unoptimized
          />
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block w-full min-w-0 rounded-xl text-inherit no-underline outline-none transition-shadow",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        aria-label={`Open ${title}`}
      >
        {card}
      </Link>
    )
  }

  return card
}
