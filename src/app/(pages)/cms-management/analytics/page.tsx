import { CmsAnalyticsClient } from "./CmsAnalyticsClient";

const EMPTY_KPIS = {
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
  avgWatchSeconds: 0,
  engagementRatePercent: 0,
};

export default function CmsAnalyticsPage() {
  return (
    <CmsAnalyticsClient
      initialData={{ kpis: EMPTY_KPIS, viewsOverTime: [], audienceByDevice: [], topReels: [] }}
    />
  );
}
