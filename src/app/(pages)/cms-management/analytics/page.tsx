import {
  getCmsAnalyticsKpis,
  getCmsAudienceByDevice,
  getCmsViewsOverTime,
} from "@/lib/data/cms";
import { CmsAnalyticsClient } from "./CmsAnalyticsClient";

export default function CmsAnalyticsPage() {
  return (
    <CmsAnalyticsClient
      kpis={getCmsAnalyticsKpis()}
      viewsOverTime={getCmsViewsOverTime()}
      audienceByDevice={getCmsAudienceByDevice()}
    />
  );
}
