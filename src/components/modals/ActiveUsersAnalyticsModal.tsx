"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "./AnalyticsModal"
import { BarChart3, Calendar, TrendingUp } from "lucide-react"

interface ActiveUsersAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActiveUsersAnalyticsModal({ open, onOpenChange }: ActiveUsersAnalyticsModalProps) {
  const config: AnalyticsModalConfig = {
    title: "Active Users - Detailed Analytics",
    kpiCards: [
      {
        title: "This Week",
        subtitle: "Current Week",
        subtitleBelowValue: true,
        value: "33,506",
        variant: "info",
        icon: BarChart3,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[113px] !h-[98px] !right-0 !bottom-0 -mr-5 -mb-5 opacity-100 object-contain",
      },
      {
        title: "Last Week",
        subtitle: "Previous Week",
        subtitleBelowValue: true,
        value: "26,894",
        variant: "warning",
        icon: Calendar,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[113px] !h-[98px] opacity-100",
      },
      {
        title: "Change",
        subtitle: "Week over Week",
        subtitleBelowValue: true,
        value: "+150%",
        changeType: "positive",
        variant: "error",
        icon: TrendingUp,
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
    chartIcon: BarChart3,
    defaultTab: "user-growth",
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}
