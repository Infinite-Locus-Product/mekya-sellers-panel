import { CmsAnalyticsClient } from "./CmsAnalyticsClient";

export default function CmsAnalyticsPage() {
  return (
    <CmsAnalyticsClient
      kpis={{ totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, avgWatchSeconds: 0, engagementRatePercent: 0 }}
      viewsOverTime={[]}
      audienceByDevice={[]}
    />
  );
}
