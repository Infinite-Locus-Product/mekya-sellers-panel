"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LineChart, PieChart, type ChartDataPoint } from "@/components/analytics";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { AppSelect } from "@/components/shared/AppSelect";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Eye, Heart, Share2, Trophy } from "lucide-react";
import type {
  CmsAnalyticsKpis,
  CmsAudienceByDeviceSlice,
  CmsTopReel,
  CmsViewsOverTimePoint,
} from "@/lib/data/cms";
import { getReelAnalyticsSummary, type AnalyticsDateRange } from "@/lib/api/reels";
import { LoadingSpinner } from "@/components/shared";
import { cn, formatNumber } from "@/lib/utils";
import { EngagementRateOverview } from "./components/EngagementRateOverview";

export interface CmsAnalyticsData {
  kpis: CmsAnalyticsKpis;
  viewsOverTime: CmsViewsOverTimePoint[];
  audienceByDevice: CmsAudienceByDeviceSlice[];
  topReels: CmsTopReel[];
}

export interface CmsAnalyticsClientProps {
  initialData: CmsAnalyticsData;
}

const DATE_OPTIONS: Array<{ label: string; value: AnalyticsDateRange }> = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "All time", value: "all" },
];

const AUDIENCE_COLORS = ["#87E6C5", "#87B5E6", "#FFBAF0"] as const;

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function CmsAnalyticsClient({ initialData }: Readonly<CmsAnalyticsClientProps>) {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>("30d");
  const [data, setData] = useState<CmsAnalyticsData>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const summary = await getReelAnalyticsSummary(dateRange);
        if (!cancelled) setData(summary);
      } catch (error) {
        if (!cancelled) {
          toast.error(extractErrorMessage(error, "Failed to load analytics"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const { kpis, viewsOverTime, audienceByDevice, topReels } = data;

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
              onChange={(v) => setDateRange(v as AnalyticsDateRange)}
              options={DATE_OPTIONS}
              className="w-[min(100%,11rem)] min-[1920px]:w-[200px]"
            />
          </div>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LoadingSpinner size="sm" />
              Updating…
            </span>
          )}
        </div>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        All-time totals — not affected by the date range below
      </p>
      {/* Dimmed while a refetch is in flight so stale numbers read as stale, not final. */}
      <div
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 min-[1920px]:gap-4 transition-opacity duration-200",
          isLoading && "opacity-50"
        )}
      >
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
          title="Saves"
          value={formatNumber(kpis.totalSaves)}
          kpiType={3}
          icon={<Bookmark className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
        <KPICard
          title="Total Shares"
          value={formatNumber(kpis.totalShares)}
          kpiType={4}
          icon={<Share2 className="text-[#004C5E]" aria-hidden />}
          className="m-4"
        />
      </div>

      <div
        className={cn(
          "grid min-h-0 grid-cols-1 items-stretch gap-0 lg:grid-cols-3 bg-[#F9FAF9] transition-opacity duration-200",
          isLoading && "opacity-50"
        )}
      >
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
                  Daily views for the selected date range
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
                  How viewers are accessing your reel, for the selected date range
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

      <Card
        className={cn(
          "border-0 bg-[#F9FAF9] shadow-none transition-opacity duration-200",
          isLoading && "opacity-50"
        )}
      >
        <CardContent className="flex flex-col gap-4 p-4 min-[1920px]:p-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <Trophy className="h-4 w-4 shrink-0 text-[#004C5E]" aria-hidden />
            <div>
              <h2 className="text-sm font-medium text-foreground min-[1920px]:text-base">
                Top Performing Reels
              </h2>
              <p className="mt-1 text-xs text-muted-foreground min-[1920px]:text-sm">
                Your best reels by all-time views
              </p>
            </div>
          </div>

          {topReels.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "No reels yet."}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {topReels.map((reel, index) => (
                <div key={reel.reelId} className="flex items-center gap-4 py-3">
                  <span className="w-5 shrink-0 text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  {reel.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={reel.thumbnailUrl}
                      alt=""
                      className="h-12 w-9 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-9 shrink-0 rounded bg-muted" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {reel.title}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    {formatNumber(reel.views)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3.5 w-3.5" aria-hidden />
                    {formatNumber(reel.likes)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5" aria-hidden />
                    {formatNumber(reel.shares)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
