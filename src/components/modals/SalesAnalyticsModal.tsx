"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import { BarChart3 } from "lucide-react"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"

interface SalesAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalesAnalyticsModal({ open, onOpenChange }: SalesAnalyticsModalProps) {
  const trendData = [
    { label: "Jan", value: 2900 },
    { label: "Feb", value: 3800 },
    { label: "Mar", value: 2600 },
    { label: "Apr", value: 3400 },
    { label: "May", value: 3100 },
    { label: "Jun", value: 4000 },
    { label: "Jul", value: 3600 },
    { label: "Aug", value: 3200 },
    { label: "Sep", value: 2400 },
    { label: "Oct", value: 3500 },
    { label: "Nov", value: 2600 },
    { label: "Dec", value: 3200 },
  ]

  const categoryBreakdownData = [
    { category: "Electronics", value: 1250000, percentage: 35, color: "var(--info-dark)" },
    { category: "Clothing", value: 980000, percentage: 27, color: "var(--success-dark)" },
    { category: "Home & Kitchen", value: 750000, percentage: 21, color: "var(--warning-dark)" },
    { category: "Books", value: 450000, percentage: 12, color: "var(--error-dark)" },
    { category: "Sports", value: 320000, percentage: 5, color: "var(--accent-dark)" },
  ]

  const regionalPerformanceData = [
    { region: "North India", sales: 1250000, growth: 12.5, color: "#2C4FBF" },
    { region: "South India", sales: 980000, growth: 8.3, color: "#016630" },
    { region: "East India", sales: 750000, growth: -2.1, color: "#894B3E" },
    { region: "West India", sales: 1100000, growth: 15.7, color: "#720050" },
    { region: "Central India", sales: 650000, growth: 5.2, color: "#660101" },
  ]

  const colorTrendsData = [
    { color: "Light Blue", name: "Light Blue", units: 650, percentage: 22, hexCode: "#76CAF3" },
    { color: "Black", name: "Black", units: 612, percentage: 20, hexCode: "#000000" },
    { color: "White", name: "White", units: 512, percentage: 18, hexCode: "#FFFFFF" },
    { color: "Orange", name: "Orange", units: 432, percentage: 15, hexCode: "#F8946A" },
    { color: "Light Green", name: "Light Green", units: 320, percentage: 12, hexCode: "#9FFF8C" },
    { color: "Dark Blue", name: "Dark Blue", units: 120, percentage: 10, hexCode: "#2C4FBF" },
    { color: "Grey", name: "Other", units: 100, percentage: 9, hexCode: "#9CA3AF" },
  ]

  const config: AnalyticsModalConfig = {
    title: "Total Sales Volume - Detailed Analytics",
    kpiCards: [
      {
        title: "This Week",
        subtitle: "Current Week",
        subtitleBelowValue: true,
        value: "₹5,000,00",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-14 w-14 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[113px] !h-[98px] !right-0 !bottom-0 -mr-5 -mb-5 opacity-100 object-contain",
      },
      {
        title: "Last Week",
        subtitle: "Previous Week",
        subtitleBelowValue: true,
        value: "₹2,000,00",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[113px] !h-[98px] opacity-100",
      },
      {
        title: "Week over Week",
        subtitle: "Week over Week",
        subtitleBelowValue: true,
        value: "+150%",
        changeType: "positive",
        variant: "error",
        customIcon: <WeekOverWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
        image: "/kpi/kpi3.png",
        imageClassName: "!w-[113px] !h-[98px] opacity-100",
      },
    ],
    tabs: [
      { id: "sales-trends", label: "Sales Trends" },
      { id: "category-breakdown", label: "Category Breakdown" },
      { id: "regional-performance", label: "Regional Performance" },
      { id: "color-trends", label: "Color Trends" },
    ],
    chartTitle: "Sales Trends Over Time",
    chartIcon: BarChart3,
    defaultTab: "sales-trends",
    chartData: trendData,
    categoryBreakdownData,
    regionalPerformanceData,
    colorTrendsData,
    contentClassName: "bg-gray-50",
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}
