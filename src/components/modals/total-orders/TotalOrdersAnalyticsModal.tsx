"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"
import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import type { DateRangeApiPayload } from "@/components/shared/custom-date-range"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"
import { getTotalOrdersAnalytics, type TotalOrdersAnalytics } from "@/lib/api/analytics"

interface TotalOrdersAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateRangePayload?: DateRangeApiPayload
  channel?: "b2b" | "b2c"
}

function buildConfig(data: TotalOrdersAnalytics | null): AnalyticsModalConfig {
  return {
    title: "Total Number of Orders - Detailed Analytics",
    kpiDefinitionPurpose: {
      sectionTitle: "KPI Definition & Purpose",
      definition:
        "The total count of orders placed within the selected time frame, across every status.",
      purpose:
        "This KPI tracks the volume of orders placed and helps assess customer activity and engagement on the platform.",
    },
    kpiCards: [
      {
        title: data?.summary.current.label ?? "Current Period",
        subtitle: "Current Period",
        subtitleBelowValue: true,
        value: data?.summary.current.display_value ?? "—",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName:
          "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: data?.summary.previous.label ?? "Previous Period",
        subtitle: "Previous Period",
        subtitleBelowValue: true,
        value: data?.summary.previous.display_value ?? "—",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName:
          "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
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
        imageClassName:
          "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
    ],
    tabs: [
      { id: "to-historical-trends", label: "Historical Trends" },
      { id: "to-order-type", label: "Order Type" },
      { id: "to-customer-type", label: "Customer Type" },
    ],
    chartTitle: "Historical Trends",
    chartIcon: BarChart3,
    defaultTab: "to-historical-trends",
    chartData: data?.historical_trends.series,
    orderTypeData: data?.order_type.series,
    customerTypeData: data?.customer_type.series,
    contentClassName: "bg-gray-50",
  }
}

export function TotalOrdersAnalyticsModal({
  open,
  onOpenChange,
  dateRangePayload,
  channel,
}: Readonly<TotalOrdersAnalyticsModalProps>) {
  const [data, setData] = useState<TotalOrdersAnalytics | null>(null)
  /** The modal's own picker overrides the range seeded from the dashboard KPI row. */
  const [activeRange, setActiveRange] = useState<DateRangeApiPayload | undefined>(
    dateRangePayload
  )

  // Deferred to a microtask so the reset doesn't run synchronously inside the effect body
  // and cascade a re-render.
  useEffect(() => {
    if (!open) queueMicrotask(() => setActiveRange(dateRangePayload))
  }, [open, dateRangePayload])

  const effectiveRange = activeRange ?? dateRangePayload

  useEffect(() => {
    if (!open) return
    if (!effectiveRange?.start_date || !effectiveRange?.end_date) return
    let cancelled = false
    getTotalOrdersAnalytics({
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
