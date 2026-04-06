"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import { TrendingUp, Calendar, ArrowUpDown } from "lucide-react"
import type { MultiLineChartDataPoint } from "@/components/analytics"

interface ActiveSellersAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActiveSellersAnalyticsModal({
  open,
  onOpenChange,
}: ActiveSellersAnalyticsModalProps) {
  const sellerGrowthData: MultiLineChartDataPoint[] = [
    { label: "Jan", totalSeller: 3200, activeSeller: 2500, newSeller: 1200 },
    { label: "Feb", totalSeller: 3300, activeSeller: 2550, newSeller: 1250 },
    { label: "Mar", totalSeller: 3400, activeSeller: 2600, newSeller: 1300 },
    { label: "Apr", totalSeller: 3500, activeSeller: 2650, newSeller: 1350 },
    { label: "May", totalSeller: 3600, activeSeller: 2700, newSeller: 1400 },
    { label: "Jun", totalSeller: 3700, activeSeller: 2750, newSeller: 1450 },
    { label: "Jul", totalSeller: 3800, activeSeller: 2800, newSeller: 1500 },
    { label: "Aug", totalSeller: 3900, activeSeller: 2820, newSeller: 1600 },
    { label: "Sep", totalSeller: 4000, activeSeller: 2850, newSeller: 1700 },
    { label: "Oct", totalSeller: 4100, activeSeller: 2880, newSeller: 1800 },
    { label: "Nov", totalSeller: 4150, activeSeller: 2900, newSeller: 1850 },
    { label: "Dec", totalSeller: 4200, activeSeller: 2900, newSeller: 1900 },
  ]

  const regionalPerformanceData = [
    {
      region: "North India",
      numberOfSellers: 98,
      revenue: 850000,
      averageRating: 4.2,
    },
    {
      region: "South India",
      numberOfSellers: 87,
      revenue: 650000,
      averageRating: 4.0,
    },
    {
      region: "West India",
      numberOfSellers: 95,
      revenue: 950000,
      averageRating: 4.4,
    },
    {
      region: "East India",
      numberOfSellers: 62,
      revenue: 250000,
      averageRating: 3.8,
    },
  ]

  const config: AnalyticsModalConfig = {
    title: "Active Sellers - Detailed Analytics",
    kpiCards: [
      {
        title: "This Week",
        subtitle: "Current Week",
        subtitleBelowValue: true,
        value: "120",
        variant: "info",
        icon: TrendingUp,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[113px] !h-[98px] !right-0 !bottom-0 -mr-5 -mb-5 opacity-100 object-contain",
      },
      {
        title: "Last Week",
        subtitle: "Previous Week",
        subtitleBelowValue: true,
        value: "316",
        variant: "warning",
        icon: Calendar,
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
        icon: ArrowUpDown,
        background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
        image: "/kpi/kpi3.png",
        imageClassName: "!w-[113px] !h-[98px] opacity-100",
      },
    ],
    tabs: [
      { id: "user-growth", label: "User Growth" },
      { id: "engagement", label: "Engagement" },
      { id: "user-segment", label: "User Segment" },
    ],
    chartTitle: "User Growth Over Time",
    defaultTab: "user-growth",
    sellerGrowthData: sellerGrowthData,
    regionalPerformanceData: regionalPerformanceData,
    engagementData: [
      { period: "Jan", buyer: 1200, seller: 800 },
      { period: "Feb", buyer: 1350, seller: 850 },
      { period: "Mar", buyer: 1480, seller: 920 },
      { period: "Apr", buyer: 1620, seller: 980 },
      { period: "May", buyer: 1780, seller: 1050 },
      { period: "Jun", buyer: 1920, seller: 1120 },
      { period: "Jul", buyer: 2050, seller: 1180 },
      { period: "Aug", buyer: 2180, seller: 1250 },
      { period: "Sep", buyer: 2320, seller: 1320 },
      { period: "Oct", buyer: 2450, seller: 1380 },
      { period: "Nov", buyer: 2580, seller: 1420 },
      { period: "Dec", buyer: 2650, seller: 1480 },
    ],
    userSegmentData: { buyersCount: 20000, sellersCount: 40457 },
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}
