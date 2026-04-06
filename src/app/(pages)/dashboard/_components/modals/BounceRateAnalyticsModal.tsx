"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import { BarChart3, Calendar, TrendingDown } from "lucide-react"
import type { ChartDataPoint } from "@/components/analytics"
import type { HeatmapDataPoint } from "@/components/analytics"
import type { PageAnalysisDataPoint } from "../tabs"
import bounceRateData from "@/data/bounceRateData.json"

interface BounceRateAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BounceRateAnalyticsModal({ open, onOpenChange }: BounceRateAnalyticsModalProps) {
  const trendData: ChartDataPoint[] = bounceRateData.trendData.map((item) => ({
    label: item.label,
    value: item.value,
  }))

  const deviceHeatmapData: HeatmapDataPoint[] = bounceRateData.deviceHeatmap.map((item) => ({
    page: item.page,
    mobile: item.mobile,
    tablet: item.tablet,
    desktop: item.desktop,
  }))

  const pageAnalysisData: PageAnalysisDataPoint[] = bounceRateData.pageAnalysis.map((item) => ({
    page: item.page,
    bounceRate: item.bounceRate,
    visitors: item.visitors,
    avgTimeOnPage: item.avgTimeOnPage,
    exitRate: item.exitRate,
    trend: item.trend as "up" | "down" | "stable",
  }))

  const config: AnalyticsModalConfig = {
    title: "Bounce Rate - Detailed Analytics",
    kpiCards: [
      {
        title: bounceRateData.kpiCards.currentWeek.title,
        subtitle: bounceRateData.kpiCards.currentWeek.subtitle,
        subtitleBelowValue: true,
        value: bounceRateData.kpiCards.currentWeek.value,
        variant: bounceRateData.kpiCards.currentWeek.variant as
          | "info"
          | "warning"
          | "error"
          | "success"
          | "accent",
        icon: BarChart3,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[113px] !h-[98px] !right-0 !bottom-0 -mr-5 -mb-5 opacity-100 object-contain",
      },
      {
        title: bounceRateData.kpiCards.previousWeek.title,
        subtitle: bounceRateData.kpiCards.previousWeek.subtitle,
        subtitleBelowValue: true,
        value: bounceRateData.kpiCards.previousWeek.value,
        variant: bounceRateData.kpiCards.previousWeek.variant as
          | "info"
          | "warning"
          | "error"
          | "success"
          | "accent",
        icon: Calendar,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[113px] !h-[98px] opacity-100",
      },
      {
        title: bounceRateData.kpiCards.change.title,
        subtitle: bounceRateData.kpiCards.change.subtitle,
        subtitleBelowValue: true,
        value: bounceRateData.kpiCards.change.value,
        changeType: bounceRateData.kpiCards.change.changeType as "positive" | "negative",
        variant: bounceRateData.kpiCards.change.variant as
          | "info"
          | "warning"
          | "error"
          | "success"
          | "accent",
        icon: TrendingDown,
        background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
        image: "/kpi/kpi3.png",
        imageClassName: "!w-[113px] !h-[98px] opacity-100",
      },
    ],
    tabs: [
      { id: "bounce-rate-trends", label: "Bounce Rate Trends" },
      { id: "device-heatmap", label: "Device Heatmap" },
      { id: "page-analysis", label: "Page Analysis" },
      { id: "insights", label: "Insights" },
    ],
    chartTitle: "Bounce Rate Trends Over Time",
    chartIcon: BarChart3,
    defaultTab: "bounce-rate-trends",
    chartData: trendData,
    deviceHeatmapData: deviceHeatmapData,
    pageAnalysisData: pageAnalysisData,
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}
