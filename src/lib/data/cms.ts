export type ReelStatus = "scheduled" | "draft" | "published" | "pending" | "rejected" | "resubmitted";

export interface CmsReelEngagement {
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

export interface CmsReel {
  id: string;
  title: string;
  duration: string;
  status: ReelStatus;
  /** ISO date yyyy-mm-dd for range filters */
  uploadedAt: string;
  /** Display string e.g. "14 Jun 2025, 10:30 am" */
  uploadDate: string;
  /** Views hidden for scheduled/draft in design */
  views: number | null;
  engagement: CmsReelEngagement;
  /** API fields — present on reels loaded from backend */
  s3_url?: string;
  thumbnail_url?: string;
  description?: string;
  audience?: "b2b" | "b2c" | "both";
  product_ids?: string[];
  rejection_reason?: string | null;
}

export interface CmsAnalyticsKpis {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgWatchSeconds: number;
  engagementRatePercent: number;
}

export interface CmsViewsOverTimePoint {
  day: string;
  views: number;
}

export interface CmsAudienceByDeviceSlice {
  label: string;
  value: number;
}

export interface CmsTopReel {
  reelId: string;
  title: string;
  thumbnailUrl: string | null;
  views: number;
  likes: number;
  shares: number;
}

export interface CmsAnalyticsSummary {
  kpis: CmsAnalyticsKpis;
  viewsOverTime: CmsViewsOverTimePoint[];
  audienceByDevice: CmsAudienceByDeviceSlice[];
  topReels: CmsTopReel[];
}
