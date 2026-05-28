"use client";

import { useMemo, useState } from "react";
import { LineChart, PieChart, type ChartDataPoint } from "@/components/analytics";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { AppSelect } from "@/components/shared/AppSelect";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import type {
  CmsAnalyticsKpis,
  CmsAudienceByDeviceSlice,
  CmsViewsOverTimePoint,
} from "@/lib/data/cms";
import { formatNumber } from "@/lib/utils";
import { EngagementRateOverview } from "./components/EngagementRateOverview";

export interface CmsAnalyticsClientProps {
  kpis: CmsAnalyticsKpis;
  viewsOverTime: CmsViewsOverTimePoint[];
  audienceByDevice: CmsAudienceByDeviceSlice[];
}

const DATE_OPTIONS = [
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "Last 90 Days", value: "last_90_days" },
];

const AUDIENCE_COLORS = ["#87E6C5", "#87B5E6", "#FFBAF0"] as const;

export function CmsAnalyticsClient({
  kpis,
  viewsOverTime,
  audienceByDevice,
}: Readonly<CmsAnalyticsClientProps>) {
  const [dateRange, setDateRange] = useState("last_30_days");

  const viewsChartData: ChartDataPoint[] = useMemo(
    () => viewsOverTime.map((d) => ({ label: d.day, value: d.views })),
    [viewsOverTime]
  );

  const audienceChartData: ChartDataPoint[] = useMemo(
    () => audienceByDevice.map((s) => ({ label: s.label, value: s.value })),
    [audienceByDevice]
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 min-[1920px]:gap-6">
      <Breadcrumb
        items={[
          { label: "Seller Dashboard", href: "/dashboard" },
          { label: "CMS Management", href: "/cms-management/reels" },
          { label: "Analytics" },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-foreground min-[1920px]:text-xl">
            CMS - Analytics
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground min-[1920px]:text-base">
            Track the performance of your reels with real-time insights on views, engagement, and reach
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">Date Range :</span>
            <AppSelect
              placeholder="Last 30 Days"
              value={dateRange}
              onChange={setDateRange}
              options={DATE_OPTIONS}
              className="w-[min(100%,11rem)] min-[1920px]:w-[200px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 min-[1920px]:gap-4">
        <KPICard
          title="Total Views"
          value={formatNumber(kpis.totalViews)}
          kpiType={1}
          icon={<Eye className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
        <KPICard
          title="Total Likes"
          value={formatNumber(kpis.totalLikes)}
          kpiType={2}
          icon={<Heart className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
        <KPICard
          title="Total Comments"
          value={formatNumber(kpis.totalComments)}
          kpiType={3}
          icon={<MessageCircle className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
        <KPICard
          title="Total Shares"
          value={formatNumber(kpis.totalShares)}
          kpiType={4}
          icon={<Share2 className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
        <KPICard
          title="Avg. Watch Time"
          value={`${kpis.avgWatchSeconds} seconds`}
          kpiType={5}
          icon={<Clock className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
      </div>

      <div className="grid min-h-0 grid-cols-1 items-stretch gap-0 lg:grid-cols-3 bg-[#F9FAF9]">
        <div className="flex min-h-0 flex-col lg:h-full lg:min-h-0">
          <Card className="m-4 flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-white shadow-none lg:min-h-0">
            <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden p-0">
              <div className="shrink-0 border-b border-border p-4">
                <h2 className="text-sm font-medium text-foreground min-[1920px]:text-base">
                  Engagement Overview
                </h2>
                <p className="mt-1 text-xs text-muted-foreground min-[1920px]:text-sm">
                  Measure how audiences are interacting with your reels
                </p>
              </div>
              <EngagementRateOverview percent={kpis.engagementRatePercent} className="min-h-0 flex-1" />
            </CardContent>
          </Card>
        </div>

        <div className="flex min-h-0 flex-col lg:h-full lg:min-h-0">
          <Card className="m-4 flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-white shadow-none lg:min-h-0">
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-4 shrink-0 border-b border-border p-4">
                <h2 className="text-sm font-medium text-foreground min-[1920px]:text-base">
                  Views Over Time
                </h2>
                <p className="mt-1 text-xs text-muted-foreground min-[1920px]:text-sm">
                  Daily views and engagement for the past week
                </p>
              </div>
              <LineChart data={viewsChartData} variant="views" color="#2563eb" />
            </CardContent>
          </Card>
        </div>

        <div className="flex min-h-0 flex-col lg:h-full lg:min-h-0">
          <Card className="m-4 flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-white shadow-none lg:min-h-0">
            <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 min-[1920px]:p-6">
              <div className="mb-4 shrink-0 border-b border-border pb-4">
                <h2 className="text-sm font-medium text-foreground min-[1920px]:text-base">
                  Audience by Device
                </h2>
                <p className="mt-1 text-xs text-muted-foreground min-[1920px]:text-sm">
                  How viewers are accessing your reel
                </p>
              </div>
              <PieChart
                data={audienceChartData}
                layout="chart-left"
                labelPosition="right"
                showFooter={false}
                showTitle={false}
                compact
                fluid
                colors={[...AUDIENCE_COLORS]}
                labelColumns={1}
                className="min-h-0 flex-1 gap-2 p-0 w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
