import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { TrendUpIcon, TrendDownIcon } from "@/assets/icons"

export type KPICardVariant = "success" | "warning" | "error" | "info" | "accent"
export type KPICardType = 1 | 2 | 3 | 4 | 5

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
  kpiType?: KPICardType
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
  "absolute -right-8 -bottom-10 h-[72px] w-[72px] object-contain select-none pointer-events-none kpi-spin-img scale-110 sm:-right-10 sm:-bottom-12 sm:h-[90px] sm:w-[90px] sm:scale-125 xl:-right-12 xl:-bottom-14 xl:h-[110px] xl:w-[110px] min-[1920px]:h-[130px] min-[1920px]:w-[130px] min-[1920px]:scale-[1.35]"

const kpiTypeStyles: Record<KPICardType, { background: string; image: string }> = {
  1: {
    background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
    image: "/kpi/kpi1.png",
  },
  2: {
    background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
    image: "/kpi/kpi2.png",
  },
  3: {
    background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
    image: "/kpi/kpi3.png",
  },
  4: {
    background: "linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)",
    image: "/kpi/kpi4.png",
  },
  5: {
    background: "linear-gradient(100.63deg, #93F1BA -1.02%, #DDFFF3 50.22%, #C9FF88 101.47%)",
    image: "/kpi/kpi5.png",
  },
}

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
  kpiType,
  background,
  image,
  imageClassName,
  subtitleBelowValue,
}: KPICardProps) {
  const kpiStyle = kpiType ? kpiTypeStyles[kpiType] : undefined
  const resolvedBackground = kpiStyle?.background ?? background
  const resolvedImage = kpiStyle?.image ?? image
  const interactive = Boolean(href || onClick)
  const card = (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        "h-[128px] w-full min-w-0 sm:h-auto sm:min-h-[128px] md:min-h-[132px] xl:min-h-[140px] min-[1920px]:min-h-[160px]",
        interactive && "cursor-pointer hover:shadow-md",
        !href && className
      )}
      onClick={href ? undefined : onClick}
    >
      <CardContent
        className={cn(
          "relative h-full w-full p-3 sm:p-4 min-[1920px]:p-6 group",
          resolvedBackground ? undefined : variantStyles[variant]
        )}
        style={resolvedBackground ? { background: resolvedBackground } : undefined}
      >
        <div className="flex h-full w-full items-stretch justify-between">
          <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0">
              <p className="mb-0.5 text-xs font-medium min-[1920px]:mb-1 min-[1920px]:text-base">
                {title}
              </p>
              {!subtitleBelowValue && subtitle && (
                <p className="text-[10px] text-muted-foreground min-[1920px]:text-xs">{subtitle}</p>
              )}
            </div>
            <div className="mt-auto flex flex-col gap-1 pt-2 min-[1920px]:gap-1.5 min-[1920px]:pt-4">
              <p className="text-lg font-bold leading-tight text-foreground min-[1920px]:text-2xl min-[1920px]:leading-none">
                {value}
              </p>
              {change &&
                (changeDisplay === "text" ? (
                  <p className="text-xs text-muted-foreground min-[1920px]:text-sm">{change}</p>
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
                <p className="text-xs text-muted-foreground min-[1920px]:text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          {icon && (
            <div className="absolute right-1 top-1 rounded-full bg-[linear-gradient(180deg,_#F9F9F9_0%,_rgba(189,189,189,0.73)_100%)] p-1 shadow-[inset_0px_4px_4px_0px_#00000040] sm:p-1.5 min-[1920px]:right-2 min-[1920px]:top-2 min-[1920px]:p-2 [&>svg]:size-3.5 xl:[&>svg]:size-4 min-[1920px]:[&>svg]:size-5">
              {icon}
            </div>
          )}
        </div>
        {resolvedImage && (
          <Image
            src={resolvedImage}
            width={120}
            height={120}
            sizes="(max-width: 640px) 72px, (max-width: 1280px) 90px, (max-width: 1919px) 110px, 140px"
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
