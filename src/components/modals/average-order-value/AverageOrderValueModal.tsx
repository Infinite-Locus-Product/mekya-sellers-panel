"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"
import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import type { DateRangeApiPayload } from "@/components/shared/custom-date-range"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"
import { getAovAnalytics, type AovAnalytics } from "@/lib/api/analytics"

interface AverageOrderValueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateRangePayload?: DateRangeApiPayload
  channel?: "b2b" | "b2c"
}

function buildConfig(data: AovAnalytics | null): AnalyticsModalConfig {
  return {
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
        title: data?.summary.this_week.label ?? "Current Period",
        subtitle: "Current Period",
        subtitleBelowValue: true,
        value: data?.summary.this_week.display_value ?? "—",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: data?.summary.last_week.label ?? "Previous Period",
        subtitle: "Previous Period",
        subtitleBelowValue: true,
        value: data?.summary.last_week.display_value ?? "—",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Change",
        subtitle: "Change",
        subtitleBelowValue: true,
        value: data?.summary.display_change ?? "—",
        changeType: data?.summary.change_direction === "negative" ? "negative" : "positive",
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
    ],
    chartTitle: "Historical Trends",
    chartIcon: BarChart3,
    defaultTab: "historical-trends",
    chartData: data?.historical_trends.series,
    customerTypeData: data?.customer_type_trends.series.map((p) => ({
      label: p.label,
      new: p.new,
      returning: p.returning,
    })),
    customerTypeNote: data?.customer_type_trends.note,
    orderTypeData: data?.order_type_trends.series.map((p) => ({
      label: p.label,
      b2b: p.b2b,
      b2c: p.b2c,
    })),
    contentClassName: "bg-white",
  }
}

export function AverageOrderValueModal({
  open,
  onOpenChange,
  dateRangePayload,
  channel,
}: Readonly<AverageOrderValueModalProps>) {
  const [data, setData] = useState<AovAnalytics | null>(null)
  /** The modal's own date picker overrides the range seeded from the dashboard KPI row;
   *  until the user touches it, `dateRangePayload` is what we query. */
  const [activeRange, setActiveRange] = useState<DateRangeApiPayload | undefined>(
    dateRangePayload
  )

  useEffect(() => {
    if (!open) queueMicrotask(() => setActiveRange(dateRangePayload))
  }, [open, dateRangePayload])

  const effectiveRange = activeRange ?? dateRangePayload

  useEffect(() => {
    if (!open) return
    if (!effectiveRange?.start_date || !effectiveRange?.end_date) return
    let cancelled = false
    getAovAnalytics({
      date_from: effectiveRange.start_date,
      date_to: effectiveRange.end_date,
      channel,
    })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, effectiveRange?.start_date, effectiveRange?.end_date, channel])

  const config = useMemo(() => buildConfig(data), [data])

  return (
    <AnalyticsModal
      open={open}
      onOpenChange={onOpenChange}
      config={config}
      initialDateRangePayload={dateRangePayload}
      onDateRangePayloadChange={setActiveRange}
    />
  )
}
