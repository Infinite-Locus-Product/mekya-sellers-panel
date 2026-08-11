"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3 } from "lucide-react"
import { AnalyticsModal, type AnalyticsModalConfig } from "@/components/shared/AnalyticsModal"
import type { DateRangeApiPayload } from "@/components/shared/custom-date-range"
import { CurrentWeekKpiIcon, PreviousWeekKpiIcon, WeekOverWeekKpiIcon } from "@/assets/icons"
import { getSalesVolumeAnalytics, type SalesVolumeAnalytics } from "@/lib/api/analytics"

interface SalesAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateRangePayload?: DateRangeApiPayload
  channel?: "b2b" | "b2c"
}

function buildConfig(data: SalesVolumeAnalytics | null): AnalyticsModalConfig {
  return {
    title: "Total Sales Volume - Detailed Analytics",
    kpiDefinitionPurpose: {
      sectionTitle: "KPI Definition & Purpose",
      definition:
        "The total monetary value of all confirmed purchases made by customers within the selected time period.",
      purpose:
        "This KPI (Key performance indicator) tracks the overall revenue generated from all orders placed, which is a critical measure of your store's performance and growth.",
    },
    kpiCards: [
      {
        title: data?.summary.this_week.label ?? "Current Week",
        subtitle: "Current Week",
        subtitleBelowValue: true,
        value: data?.summary.this_week.display_value ?? "—",
        variant: "info",
        customIcon: <CurrentWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
        image: "/kpi/kpi1.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: data?.summary.last_week.label ?? "Previous Week",
        subtitle: "Previous Week",
        subtitleBelowValue: true,
        value: data?.summary.last_week.display_value ?? "—",
        variant: "warning",
        customIcon: <PreviousWeekKpiIcon className="h-10 w-10 shrink-0 opacity-100" />,
        background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
        image: "/kpi/kpi2.png",
        imageClassName: "!w-[140px] !h-[120px] !bottom-0 -mr-6 -mb-6 opacity-100 object-contain scale-[1.2]",
      },
      {
        title: "Week over Week",
        subtitle: "Week over Week",
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
      { id: "sales-trends", label: "Sales Trends" },
      { id: "category-breakdown", label: "Category Breakdown" },
      { id: "regional-performance", label: "Regional Performance" },
      { id: "color-trends", label: "Color Trends" },
    ],
    chartTitle: "Sales Trends Over Time",
    chartIcon: BarChart3,
    defaultTab: "sales-trends",
    chartData: data?.sales_trends.series,
    categoryBreakdownData: data?.category_breakdown.items,
    genderBreakdownData: data?.gender_breakdown?.items,
    regionalPerformanceData: data?.regional_performance.items,
    colorTrendsData: data?.color_trends.items.map((item) => ({
      color: item.color,
      name: item.name,
      units: item.units,
      percentage: item.percentage,
      hexCode: item.hex_code,
    })),
    contentClassName: "bg-gray-50",
  }
}

export function SalesAnalyticsModal({
  open,
  onOpenChange,
  dateRangePayload,
  channel,
}: Readonly<SalesAnalyticsModalProps>) {
  const [data, setData] = useState<SalesVolumeAnalytics | null>(null)
  /** The modal's own date picker overrides the range seeded from the dashboard KPI row;
   *  until the user touches it, `dateRangePayload` is what we query. */
  const [activeRange, setActiveRange] = useState<DateRangeApiPayload | undefined>(
    dateRangePayload
  )

  // Re-seed when the dashboard's range changes while the modal is closed, so reopening
  // doesn't show a stale range the picker no longer reflects. Deferred to a microtask so
  // the reset doesn't run synchronously inside the effect body and cascade a re-render.
  useEffect(() => {
    if (!open) queueMicrotask(() => setActiveRange(dateRangePayload))
  }, [open, dateRangePayload])

  const effectiveRange = activeRange ?? dateRangePayload

  useEffect(() => {
    if (!open) return
    if (!effectiveRange?.start_date || !effectiveRange?.end_date) return
    let cancelled = false
    getSalesVolumeAnalytics({
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
