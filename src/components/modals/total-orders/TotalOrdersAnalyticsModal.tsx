"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import { BarChart3 } from "lucide-react"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"

interface TotalOrdersAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TotalOrdersAnalyticsModal({ open, onOpenChange }: TotalOrdersAnalyticsModalProps) {
  const trendData = [
    { label: "Jan", value: 2200 },
    { label: "Feb", value: 2500 },
    { label: "Mar", value: 2600 },
    { label: "Apr", value: 2400 },
    { label: "May", value: 1800 },
    { label: "Jun", value: 1600 },
    { label: "Jul", value: 2100 },
    { label: "Aug", value: 3200 },
    { label: "Sep", value: 4300 },
    { label: "Oct", value: 4500 },
    { label: "Nov", value: 4200 },
    { label: "Dec", value: 4800 },
  ]

  const regionalPerformanceData = [
    { region: "North India", sales: 1250000, growth: 4.2, color: "#2C4FBF" },
    { region: "South India", sales: 980000, growth: 3.1, color: "#016630" },
    { region: "East India", sales: 750000, growth: -0.8, color: "#894B3E" },
    { region: "West India", sales: 1100000, growth: 5.0, color: "#720050" },
    { region: "Central India", sales: 650000, growth: 2.4, color: "#660101" },
  ]

  const salesChannelData = [
    {
      channel: "mobile",
      label: "Mobile App",
      orders: 28000,
      color: "#86D97B",
      description: "Orders from Mobile app",
    },
    {
      channel: "website",
      label: "Website",
      orders: 36000,
      color: "#D45A5A",
      description: "Orders from Website",
    },
    {
      channel: "retail",
      label: "Retail",
      orders: 12000,
      color: "#F9A826",
      description: "Walking customer orders",
    },
  ]

  const config: AnalyticsModalConfig = {
    title: "Total Number of Orders - Detailed Analytics",
    kpiDefinitionPurpose: {
      sectionTitle: "KPI Definition & Purpose",
      definition:
        "The total count of all completed orders within a selected time frame.",
      purpose:
        "This KPI tracks the volume of orders placed and helps assess customer activity and engagement on the platform.",
    },
    kpiCards: [
      {
        title: "Current Period",
        subtitle: "Current Period",
        subtitleBelowValue: true,
        value: "580",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[140px] !h-[120px] !right-0 !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Previous Period",
        subtitle: "Previous Period",
        subtitleBelowValue: true,
        value: "202",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[140px] !h-[120px] opacity-100 object-contain scale-[1.18]",
      },
      {
        title: "Change",
        subtitle: "Change",
        subtitleBelowValue: true,
        value: "+102%",
        changeType: "positive",
        variant: "error",
        customIcon: <WeekOverWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
        image: "/kpi/kpi3.png",
        imageClassName: "!w-[140px] !h-[120px] opacity-100 object-contain scale-[1.18]",
      },
    ],
    tabs: [
      { id: "to-historical-trends", label: "Historical Trends" },
      { id: "to-order-type", label: "Order Type" },
      { id: "to-order-status", label: "Order Status" },
      { id: "to-customer-type", label: "Customer Type" },
    ],
    chartTitle: "Historical Trends",
    chartIcon: BarChart3,
    defaultTab: "to-historical-trends",
    chartData: trendData,
    regionalPerformanceData,
    salesChannelData,
    contentClassName: "bg-white",
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}
