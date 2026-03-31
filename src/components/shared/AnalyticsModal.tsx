"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SubKpiCard } from "@/components/shared/SubKpiCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared"
import {
  LineChart,
  BarChart,
  PieChart,
  CategoryBreakdown,
  type ChartDataPoint,
  type MultiLineChartDataPoint,
} from "@/components/analytics"
import {
  SalesTrendsTab,
  CategoryBreakdownTab,
  RegionalPerformanceTab,
  ColorTrendsTab,
  DeviceHeatmapTab,
  PageAnalysisTab,
  InsightsTab,
  SellerGrowthOverviewTab,
  EngagementTab,
  UserSegmentTab,
  type PageAnalysisDataPoint,
  type UserGrowthDataPoint,
} from "@/app/(pages)/dashboard/_components/tabs"
import type { HeatmapDataPoint } from "@/components/analytics"
import { Download, BarChart3, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TabList } from "@/components/shared/TabList"
import { Filter, DEFAULT_FILTER_VALUES } from "@/components/shared/Filter"
import type { FilterValues } from "@/components/shared/FilterPanel"

/** Re-export for backward compatibility; prefer importing from TimeRangeSelector */
export type { TimeRange } from "@/components/shared/TimeRangeSelector"

export interface TabConfig {
  id: string
  label: string
}

/** Config for SubKPI cards shown in detail modals (e.g. "Total Sales Volume - Detailed Analytics") */
export interface SubKpiCardConfig {
  /** Optional unique id; used as React key when provided (avoids key collisions if titles duplicate) */
  id?: string
  title: string
  value: string
  subtitle?: string
  variant: "success" | "warning" | "error" | "info" | "accent"
  icon?: LucideIcon
  /** Custom icon element (e.g. SVG); when set, used instead of icon */
  customIcon?: ReactNode
  change?: string
  changeType?: "positive" | "negative"
  background?: string
  image?: string
  /** Optional class for the card image/decoration area */
  imageClassName?: string
  /** When true, subtitle is shown below the value (title → value → subtitle layout) */
  subtitleBelowValue?: boolean
}

/** @deprecated Use SubKpiCardConfig for detail modal KPIs */
export type KPICardConfig = SubKpiCardConfig

export interface AnalyticsModalConfig {
  title: string
  kpiCards: SubKpiCardConfig[]
  tabs: TabConfig[]
  chartTitle: string
  chartIcon?: LucideIcon
  defaultTab?: string
  chartData?: ChartDataPoint[]
  categoryBreakdownData?: Array<{
    category: string
    value: number
    percentage: number
    color: string
  }>
  regionalPerformanceData?: Array<{
    region: string
    sales?: number
    growth?: number
    color?: string
    numberOfSellers?: number
    revenue?: number
    averageRating?: number
  }>
  colorTrendsData?: Array<{
    color: string
    name: string
    units: number
    percentage: number
    hexCode: string
  }>
  deviceHeatmapData?: HeatmapDataPoint[]
  pageAnalysisData?: PageAnalysisDataPoint[]
  sellerGrowthData?: MultiLineChartDataPoint[]
  engagementData?: UserGrowthDataPoint[]
  userSegmentData?: { buyersCount: number; sellersCount: number }
  /** Optional class for the main content area (e.g. bg-gray-50 for Total Sales) */
  contentClassName?: string
}

interface AnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: AnalyticsModalConfig
}

export function AnalyticsModal({ open, onOpenChange, config }: AnalyticsModalProps) {
  const initialTab = config.defaultTab || config.tabs[0]?.id || ""
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_VALUES)

  const ChartIcon = config.chartIcon || BarChart3

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }
  const handleFilterReset = () => setFilters(DEFAULT_FILTER_VALUES)
  const handleFilterApply = () => {
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "sales-trends":
      case "bounce-rate-trends":
        return (
          <SalesTrendsTab
            chartData={config.chartData}
            chartTitle={config.chartTitle}
            chartIcon={ChartIcon}
          />
        )
      case "category-breakdown":
        return <CategoryBreakdownTab data={config.categoryBreakdownData} />
      case "regional-performance":
        return (
          <RegionalPerformanceTab
            data={config.regionalPerformanceData}
            chartData={config.chartData}
          />
        )
      case "color-trends":
        return <ColorTrendsTab data={config.colorTrendsData} chartData={config.chartData} />
      case "device-heatmap":
        return <DeviceHeatmapTab data={config.deviceHeatmapData} />
      case "page-analysis":
        return <PageAnalysisTab data={config.pageAnalysisData} />
      case "insights":
        return <InsightsTab />
      case "overview":
        return <SellerGrowthOverviewTab chartData={config.sellerGrowthData} />
      case "user-growth":
        return (
          <SellerGrowthOverviewTab
            chartData={config.sellerGrowthData}
            chartTitle={config.chartTitle}
          />
        )
      case "engagement":
        return <EngagementTab data={config.engagementData} />
      case "user-segment":
        return <UserSegmentTab data={config.userSegmentData} />
      case "categories":
        return <CategoryBreakdownTab data={config.categoryBreakdownData} />
      case "regions":
        return (
          <RegionalPerformanceTab
            data={config.regionalPerformanceData}
            chartData={config.chartData}
          />
        )
      default:
        // Fallback to old behavior for backward compatibility
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartIcon className="h-5 w-5" />
                {config.chartTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-muted/30 text-center space-y-3">
                <ChartIcon className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {config.tabs.find((t) => t.id === activeTab)?.label ?? "Analytics"} (placeholder)
                </p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl" hideDefaultClose>
        <DialogHeader className="p-4 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{config.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#F2F2F2] hover:bg-[#E5E5E5] border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <DialogCloseButton />
            </div>
          </div>
        </DialogHeader>

        <div className="w-full border-b border-border" aria-hidden />

        <div className={cn("p-4 space-y-6", config.contentClassName)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.kpiCards.map((card) => {
              const Icon = card.icon
              const iconContent = card.customIcon ?? (Icon && (
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    card.variant === "info" && "bg-[var(--info-dark)]/20",
                    card.variant === "warning" && "bg-[var(--warning-dark)]/20",
                    card.variant === "error" && "bg-[var(--error-dark)]/20",
                    card.variant === "success" && "bg-[var(--success-dark)]/20",
                    card.variant === "accent" && "bg-[var(--accent-dark)]/20"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      card.variant === "info" && "text-[var(--info-dark)]",
                      card.variant === "warning" && "text-[var(--warning-dark)]",
                      card.variant === "error" && "text-[var(--error-dark)]",
                      card.variant === "success" && "text-[var(--success-dark)]",
                      card.variant === "accent" && "text-[var(--accent-dark)]"
                    )}
                  />
                </div>
              ))
              return (
                <SubKpiCard
                  key={card.id ?? card.title}
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  variant={card.variant}
                  change={card.change}
                  changeType={card.changeType}
                  background={card.background}
                  image={card.image}
                  imageClassName={card.imageClassName}
                  subtitleBelowValue={card.subtitleBelowValue}
                  icon={iconContent}
                />
              )
            })}
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <TabList
              tabs={config.tabs}
              value={activeTab}
              onValueChange={setActiveTab}
              variant="pill"
            />
            <Filter
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
              onApply={handleFilterApply}
            />
          </div>

          {renderTabContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
