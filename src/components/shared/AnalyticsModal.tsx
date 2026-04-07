"use client"

import { useState, type ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SubKpiCard } from "@/components/shared/SubKpiCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartDataPoint,
  type MultiLineChartDataPoint,
} from "@/components/analytics"
import {
  SalesTrendsTab,
  CategoryBreakdownTab,
  RegionalPerformanceTab,
  ColorTrendsTab,
  SalesChannelTab,
  DeviceHeatmapTab,
  PageAnalysisTab,
  InsightsTab,
  SellerGrowthOverviewTab,
  EngagementTab,
  UserSegmentTab,
  type PageAnalysisDataPoint,
  type UserGrowthDataPoint,
  type SalesChannelDataPoint,
} from "@/app/(pages)/dashboard/_components/tabs"
import type { HeatmapDataPoint } from "@/components/analytics"
import { CustomerTypeAnalyticsModal, type CustomerTypeDataPoint } from "@/components/modals/average-order-value/tabs/CustomerTypeAnalyticsModal"
import { HistoricalTrendsAnalyticsModal } from "@/components/modals/average-order-value/tabs/HistoricalTrendsAnalyticsModal"
import { OrderTypeAnalyticsModal } from "@/components/modals/average-order-value/tabs/OrderTypeAnalyticsModal"
import { ImpactOfPromotionsAnalyticsModal } from "@/components/modals/average-order-value/tabs/ImpactOfPromotionsAnalyticsModal"

import { HistoricalTrendsTab as TOHistoricalTrendsTab } from "@/components/modals/total-orders/tabs/HistoricalTrendsTab"
import { OrderTypeTab as TOOrderTypeTab } from "@/components/modals/total-orders/tabs/OrderTypeTab"
import { OrderStatusTab as TOOrderStatusTab } from "@/components/modals/total-orders/tabs/OrderStatusTab"
import { CustomerTypeTab as TOCustomerTypeTab } from "@/components/modals/total-orders/tabs/CustomerTypeTab"

import { HistoricalTrendsTab as ROHistoricalTrendsTab } from "@/components/modals/return-orders/tabs/HistoricalTrendsTab"
import { ReturnReasonsTab as ROReturnReasonsTab } from "@/components/modals/return-orders/tabs/ReturnReasonsTab"
import { ProductCategoriesTab as ROProductCategoriesTab } from "@/components/modals/return-orders/tabs/ProductCategoriesTab"
import { ReturnRateTab as ROReturnRateTab } from "@/components/modals/return-orders/tabs/ReturnRateTab"
import { Download, BarChart3, Info, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TabList } from "@/components/shared/TabList"
import { Filter, DEFAULT_FILTER_VALUES } from "@/components/shared/Filter"
import type { FilterValues, FilterOption } from "@/components/shared/FilterPanel"

export type { TimeRange } from "@/components/shared/TimeRangeSelector"

export interface TabConfig {
  id: string
  label: string
}

export interface SubKpiCardConfig {
  id?: string
  title: string
  value: string
  subtitle?: string
  variant: "success" | "warning" | "error" | "info" | "accent"
  icon?: LucideIcon
  customIcon?: ReactNode
  change?: string
  changeType?: "positive" | "negative"
  background?: string
  image?: string
  imageClassName?: string
  subtitleBelowValue?: boolean
}

export type KPICardConfig = SubKpiCardConfig
export interface KpiDefinitionPurposeConfig {
  sectionTitle: string
  definition: string
  purpose: string
  definitionLabel?: string
  purposeLabel?: string
}

export interface AnalyticsModalConfig {
  title: string
  kpiDefinitionPurpose?: KpiDefinitionPurposeConfig
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
  salesChannelData?: SalesChannelDataPoint[]
  deviceHeatmapData?: HeatmapDataPoint[]
  pageAnalysisData?: PageAnalysisDataPoint[]
  sellerGrowthData?: MultiLineChartDataPoint[]
  engagementData?: UserGrowthDataPoint[]
  userSegmentData?: { buyersCount: number; sellersCount: number }
  customerTypeData?: CustomerTypeDataPoint[]
  contentClassName?: string
}

const ANALYTICS_TIME_RANGE_OPTIONS: FilterOption[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "custom_range", label: "Custom Range" },
]

const ANALYTICS_FILTER_CONFIG = {
  timeRange: ANALYTICS_TIME_RANGE_OPTIONS,
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
      case "historical-trends":
        return (
          <HistoricalTrendsAnalyticsModal
            chartData={config.chartData}
            chartTitle={config.chartTitle}
            chartIcon={ChartIcon}
          />
        )
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
      case "sales-channel":
        return <SalesChannelTab data={config.salesChannelData} />
      case "customer-type":
        return <CustomerTypeAnalyticsModal data={config.customerTypeData} />
      case "order-type":
        return <OrderTypeAnalyticsModal />
      case "impact-of-promotions":
        return <ImpactOfPromotionsAnalyticsModal />

      // Total Orders Tabs
      case "to-historical-trends":
        return (
          <TOHistoricalTrendsTab
            chartData={config.chartData}
            chartTitle={config.chartTitle}
            chartIcon={ChartIcon}
          />
        )
      case "to-order-type":
        return <TOOrderTypeTab />
      case "to-order-status":
        return <TOOrderStatusTab />
      case "to-customer-type":
        return <TOCustomerTypeTab />

      // Return Orders Tabs
      case "ro-historical-trends":
        return (
          <ROHistoricalTrendsTab
            chartData={config.chartData}
            chartTitle={config.chartTitle}
            chartIcon={ChartIcon}
          />
        )
      case "ro-return-reasons":
        return <ROReturnReasonsTab />
      case "ro-product-categories":
        return <ROProductCategoriesTab />
      case "ro-return-rate":
        return <ROReturnRateTab />
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
          {config.kpiDefinitionPurpose && (
            <div className="overflow-hidden rounded-lg  bg-[#F2F2F2]">
              <div className="flex items-center gap-2 bg-[#F2F2F2] px-4 py-3">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.99785 14.67H3.33118V13.3367H9.99785V14.67ZM14.6645 2.66536L11.5078 6.63536L11.3612 6.81536L7.60785 11.6087C7.48397 11.7326 7.3369 11.8308 7.17505 11.8979C7.01319 11.9649 6.83971 11.9994 6.66452 11.9994C6.48932 11.9994 6.31585 11.9649 6.15399 11.8979C5.99213 11.8308 5.84506 11.7326 5.72118 11.6087C5.5973 11.4848 5.49904 11.3378 5.43199 11.1759C5.36495 11.014 5.33044 10.8406 5.33044 10.6654C5.33044 10.4902 5.36495 10.3167 5.43199 10.1548C5.49904 9.99298 5.5973 9.84591 5.72118 9.72203L14.6645 2.66536ZM1.76118 4.82136C0.798019 6.36365 0.451657 8.21235 0.791184 9.9987H1.33118V9.33203C1.32455 8.01945 1.71752 6.73592 2.45785 5.65203L1.76118 4.82136ZM7.99785 1.33203C6.97827 1.33197 5.96996 1.5453 5.03777 1.95829C4.10558 2.37128 3.27014 2.9748 2.58518 3.73003L3.34785 4.6387C4.25294 3.80663 5.43511 3.34089 6.66452 3.33203C7.9006 3.34052 9.08884 3.81087 9.99585 4.6507L12.3625 2.7827C11.1022 1.84104 9.57112 1.33217 7.99785 1.33203ZM12.5512 7.46536L12.3959 7.6567L11.9105 8.2767C11.9676 8.6256 11.9968 8.97849 11.9979 9.33203V9.9987H15.2045C15.5208 8.33029 15.2417 6.6038 14.4159 5.12003L12.5512 7.46536Z" fill="black" />
                  </svg>

                </div>
                <span className="text-sm font-medium text-foreground">
                  {config.kpiDefinitionPurpose.sectionTitle}
                </span>
              </div>
              <div className="border-b border-border" aria-hidden />
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="block font-semibold text-foreground">
                      {config.kpiDefinitionPurpose.definitionLabel ?? "Definition :"}
                    </span>
                    <span className="block">{config.kpiDefinitionPurpose.definition}</span>
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">
                      {config.kpiDefinitionPurpose.purposeLabel ?? "Purpose :"}
                    </span>{" "}
                    <span className="block">{config.kpiDefinitionPurpose.purpose}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

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
              config={ANALYTICS_FILTER_CONFIG}
            />
          </div>

          {renderTabContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
