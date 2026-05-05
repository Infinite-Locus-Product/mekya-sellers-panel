"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { KPICard } from "@/components/shared/KPICard";
import { AppSelect } from "@/components/shared/AppSelect";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Clock, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CmsAnalyticsKpis, CmsViewsOverTimePoint } from "@/lib/data/cms";
import { cn, formatNumber } from "@/lib/utils";

export interface CmsAnalyticsClientProps {
  kpis: CmsAnalyticsKpis;
  viewsOverTime: CmsViewsOverTimePoint[];
}

const DATE_OPTIONS = [
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "Last 90 Days", value: "last_90_days" },
];

export function CmsAnalyticsClient({
  kpis,
  viewsOverTime,
}: Readonly<CmsAnalyticsClientProps>) {
  const [dateRange, setDateRange] = useState("last_30_days");

  const engagementPie = useMemo(
    () => [
      { name: "Engaged", value: kpis.engagementRatePercent },
      { name: "Other", value: 100 - kpis.engagementRatePercent },
    ],
    [kpis.engagementRatePercent]
  );

  const lineData = useMemo(
    () => viewsOverTime.map((d) => ({ name: d.day, views: d.views })),
    [viewsOverTime]
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
          <Link
            href="/cms-management/reels"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View reels library
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 min-[1920px]:gap-4">
        <KPICard
          title="Total Views"
          value={formatNumber(kpis.totalViews)}
          kpiType={1}
          icon={<Eye className="text-[#004C5E]" aria-hidden />}
        />
        <KPICard
          title="Total Likes"
          value={formatNumber(kpis.totalLikes)}
          kpiType={2}
          icon={<Heart className="text-[#004C5E]" aria-hidden />}
        />
        <KPICard
          title="Total Comments"
          value={formatNumber(kpis.totalComments)}
          kpiType={3}
          icon={<MessageCircle className="text-[#004C5E]" aria-hidden />}
        />
        <KPICard
          title="Total Shares"
          value={formatNumber(kpis.totalShares)}
          kpiType={4}
          icon={<Share2 className="text-[#004C5E]" aria-hidden />}
        />
        <KPICard
          title="Avg. Watch Time"
          value={`${kpis.avgWatchSeconds} seconds`}
          kpiType={5}
          icon={<Clock className="text-[#004C5E]" aria-hidden />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden border-[#e8e9e8]">
          <CardContent className="p-4 min-[1920px]:p-6">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-foreground min-[1920px]:text-base">
                Engagement Overview
              </h2>
              <p className="mt-1 text-xs text-muted-foreground min-[1920px]:text-sm">
                Measure how audiences are interacting with your reels
              </p>
            </div>
            <div className="relative mx-auto h-[260px] w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementPie}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={100}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {engagementPie.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.name === "Engaged" ? "#004C5E" : "#E8E9E8"}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Share"]}
                    contentStyle={{ borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-2xl font-semibold tabular-nums text-foreground min-[1920px]:text-3xl">
                  {kpis.engagementRatePercent}%
                </span>
                <span className="mt-1 max-w-[140px] text-center text-[10px] text-muted-foreground min-[1920px]:text-xs">
                  Overall Engagement Rate
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#e8e9e8]">
          <CardContent className="p-4 min-[1920px]:p-6">
            <div className="mb-4">
              <h2 className="text-sm font-medium text-foreground min-[1920px]:text-base">
                Views Over Time
              </h2>
              <p className="mt-1 text-xs text-muted-foreground min-[1920px]:text-sm">
                Daily views and engagement for the past week
              </p>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={36} />
                  <Tooltip
                    formatter={(v: number) => [formatNumber(v), "Views"]}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#004C5E"
                    strokeWidth={2}
                    dot={{ fill: "#004C5E", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
