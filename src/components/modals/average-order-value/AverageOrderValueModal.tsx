"use client"

import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import { BarChart3 } from "lucide-react"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"

interface AverageOrderValueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AverageOrderValueModal({ open, onOpenChange }: AverageOrderValueModalProps) {
  const trendData = [
    { label: "Jan", value: 1200 },
    { label: "Feb", value: 1400 },
    { label: "Mar", value: 1350 },
    { label: "Apr", value: 1500 },
    { label: "May", value: 1480 },
    { label: "Jun", value: 1520 },
    { label: "Jul", value: 1580 },
    { label: "Aug", value: 1530 },
    { label: "Sep", value: 1490 },
    { label: "Oct", value: 1600 },
    { label: "Nov", value: 1570 },
    { label: "Dec", value: 1620 },
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
    title: "Average Order Value (AOV) - Detailed Analytics",
    kpiDefinitionPurpose: {
      sectionTitle: "KPI Definition & Purpose",
      definition:
        "The average value of each order placed over a selected time period, calculated by dividing total sales by the total number of orders.",
      purpose:
        "AOV measures the average spend per customer per order, which helps assess how much value customers are bringing to the business.",
    },
    kpiCards: [
      {
        title: "Current Period",
        subtitle: "Average order value",
        subtitleBelowValue: true,
        value: "₹1,546",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Previous Period",
        subtitle: "Last 30 days",
        subtitleBelowValue: true,
        value: "₹1,430",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Change",
        subtitle: "Month over Month",
        subtitleBelowValue: true,
        value: "+8%",
        changeType: "positive",
        variant: "error",
        customIcon: <WeekOverWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
        image: "/kpi/kpi3.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
    ],
    tabs: [
      { id: "historical-trends", label: "Historical Trends" },
      { id: "customer-type", label: "Customer Type" },
      { id: "order-type", label: "Order Type" },
      { id: "impact-of-promotions", label: "Impact of Promotions" },
    ],
    chartTitle: "Historical Trends",
    chartIcon: BarChart3,
    defaultTab: "historical-trends",
    chartData: trendData,
    regionalPerformanceData,
    salesChannelData,
    contentClassName: "bg-white",
  }

  return <AnalyticsModal open={open} onOpenChange={onOpenChange} config={config} />
}
