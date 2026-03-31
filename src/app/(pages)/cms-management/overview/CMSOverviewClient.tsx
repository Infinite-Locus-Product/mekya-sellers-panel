"use client";

import { KPICard } from "@/components/shared";
import { ActiveBannersIcon, PendingReelsIcon, PublishedBlogsIcon, CmsContributorsIcon } from "@/assets/icons";
import { RecentActivityCard, TopPerformingBlogsCard } from "./_components";
import type { CmsOverviewStats, RecentActivityEntry, TopBlogEntry } from "@/lib/data";

export interface CMSOverviewClientProps {
  stats: CmsOverviewStats;
  recentActivities: RecentActivityEntry[];
  topBlogs: TopBlogEntry[];
}

function changeTone(change: string): "positive" | "negative" {
  return change.trim().startsWith("-") ? "negative" : "positive"
}

export function CMSOverviewClient({ stats, recentActivities, topBlogs }: CMSOverviewClientProps) {
  const kpiItems = [
    {
      title: "Active Banners",
      value: String(stats.activeBanners),
      change: stats.activeBannersChange,
      changeType: changeTone(stats.activeBannersChange),
      href: "/cms-management/banner-management?status=active",
      icon: <ActiveBannersIcon />,
      variant: "accent" as const,
      background: "linear-gradient(280.39deg, #AFEAFF 3.59%, #EBF9FF 51.27%, #D8EFFF 98.94%)",
      image: "/kpi/kpi1.png",
    },
    {
      title: "Pending Reels",
      value: String(stats.pendingReels),
      change: stats.pendingReelsChange,
      changeType: changeTone(stats.pendingReelsChange),
      href: "/cms-management/reels-approval?status=pending",
      icon: <PendingReelsIcon />,
      variant: "warning" as const,
      background: "linear-gradient(100.31deg, #FFF4DE -0.8%, #FFF0D3 63.46%, #FFD177 101.6%)",
      image: "/kpi/kpi2.png",
    },
    {
      title: "Published Blogs",
      value: String(stats.publishedBlogs),
      change: stats.publishedBlogsChange,
      changeType: changeTone(stats.publishedBlogsChange),
      href: "/cms-management/blog-management?status=published",
      icon: <PublishedBlogsIcon />,
      variant: "success" as const,
      background: "linear-gradient(100.25deg, #FFB9B9 0.53%, #FFE6E7 55.38%, #FF7477 101.5%)",
      image: "/kpi/kpi3.png",
    },
    {
      title: "Contributors",
      value: String(stats.contributors),
      change: stats.contributorsChange,
      changeType: changeTone(stats.contributorsChange),
      href: "/cms-management/contributors",
      icon: <CmsContributorsIcon />,
      variant: "info" as const,
      background: "linear-gradient(100.63deg, #DFE3FF -1.02%, #FEEDFF 50.22%, #FF8EE4 101.47%)",
      image: "/kpi/kpi4.png",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          Admin Dashboard &gt; CMS Management &gt; Overview
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">CMS Overview</h1>
        </div>
      </div>

      <div className="space-y-6">
        <section aria-label="Key metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiItems.map((item) => (
              <KPICard
                key={item.title}
                title={item.title}
                value={item.value}
                change={item.change}
                changeType={item.changeType}
                href={item.href}
                icon={item.icon}
                variant={item.variant}
                background={item.background}
                image={item.image}
                className="w-full max-w-full"
              />
            ))}
          </div>
        </section>

        <section aria-label="Activity and performance" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard activities={recentActivities} onRefresh={() => { }} />
          <TopPerformingBlogsCard
            title="Top Performing Blogs"
            subtitle="Most viewed blog posts"
            blogs={topBlogs}
          />
        </section>
      </div>
    </div>
  );
}
