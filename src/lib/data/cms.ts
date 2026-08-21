export type ReelStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "resubmitted"
  | "scheduled"
  | "published"
  | "unpublished";

/** Statuses editing is locked on — PATCH requires force_resubmit: true, which flips status to "resubmitted". */
export const LOCKED_REEL_STATUSES: readonly ReelStatus[] = ["approved", "published", "unpublished", "scheduled"];

/** A reel's active schedule row, as returned by the seller schedule endpoints. */
export interface Schedule {
  reel_id: string;
  /** "scheduled" while pending, "failed" if the worker couldn't publish it. */
  status: string;
  /** ISO 8601 — when the worker will (or tried to) publish the reel. */
  scheduled_at: string;
  /** Present when status === "failed"; the reel stays scheduled until retried. */
  last_error?: string | null;
}

export interface CmsReelEngagement {
  likes: number | null;
  /** Times buyers bookmarked the reel. Null until the list endpoint reports it. */
  saves: number | null;
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
  /** True only when status === "approved" — use this instead of hardcoding the status check. */
  canSchedule?: boolean;
  /** Populated on demand via getReelSchedule() — not part of the list/detail payload. */
  schedule?: Schedule | null;
}

export interface CmsAnalyticsKpis {
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
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
