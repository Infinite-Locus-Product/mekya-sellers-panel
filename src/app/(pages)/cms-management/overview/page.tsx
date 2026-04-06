import { getCmsOverviewData } from "@/lib/data";
import { CMSOverviewClient } from "./CMSOverviewClient";

export default async function CMSOverviewPage() {
  const { stats, recentActivities, topBlogs } = await getCmsOverviewData();
  return (
    <CMSOverviewClient
      stats={stats}
      recentActivities={recentActivities}
      topBlogs={topBlogs}
    />
  );
}
