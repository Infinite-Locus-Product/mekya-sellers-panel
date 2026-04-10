"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import { BarChart3, Users } from "lucide-react"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"

interface ActiveUsersAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActiveUsersAnalyticsModal({ open, onOpenChange }: ActiveUsersAnalyticsModalProps) {
  const engagementData = [
    { label: "Jan", value: 2200 },
    { label: "Feb", value: 2600 },
    { label: "Mar", value: 2400 },
    { label: "Apr", value: 2800 },
    { label: "May", value: 3000 },
    { label: "Jun", value: 3200 },
    { label: "Jul", value: 3100 },
    { label: "Aug", value: 3600 },
    { label: "Sep", value: 3900 },
    { label: "Oct", value: 4100 },
    { label: "Nov", value: 4300 },
    { label: "Dec", value: 4600 },
  ]

  const config: AnalyticsModalConfig = {
    title: "Active Users - Detailed Analytics",
    kpiDefinitionPurpose: {
      sectionTitle: "KPI Definition & Purpose",
      definition:
        "The number of unique users who are active within the selected time period (e.g., users who log in or perform meaningful actions).",
      purpose:
        "Active users indicate adoption and engagement, helping track platform health and growth over time.",
    },
    kpiCards: [
      {
        title: "Current Period",
        subtitle: "Active users",
        subtitleBelowValue: true,
        value: "4,600",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Previous Period",
        subtitle: "Last period",
        subtitleBelowValue: true,
        value: "4,300",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Change",
        subtitle: "Period over period",
        subtitleBelowValue: true,
        value: "+7%",
        changeType: "positive",
        variant: "error",
        customIcon: <WeekOverWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
        image: "/kpi/kpi3.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
    ],
    tabs: [
      { id: "engagement", label: "Trends" },
      { id: "device-heatmap", label: "Heatmap" },
      { id: "insights", label: "Insights" },
    ],
    chartTitle: "Active Users",
    chartIcon: Users,
    defaultTab: "engagement",
    engagementData,
    contentClassName: "bg-white",
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}

