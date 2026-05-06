/**
 * CMS (Reels) dummy data for seller portal — mirrors Mekya 2.0 Figma CMS screens.
 * Replace with API calls when backend is available.
 */

export type ReelStatus = "scheduled" | "draft" | "published";

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
}

const BASE_TITLE = "Cotton t-shirt video test upload";
const BASE_DATE = "14 Jun 2025, 10:30 am";
const DURATION = "0:45";

/** Static library rows — matches Figma Reel Library table examples. */
export function getCmsReels(): CmsReel[] {
  return [
    {
      id: "reel-001",
      title: BASE_TITLE,
      duration: DURATION,
      status: "scheduled",
      uploadedAt: "2025-06-14",
      uploadDate: BASE_DATE,
      views: null,
      engagement: { likes: null, comments: null, shares: null },
    },
    {
      id: "reel-002",
      title: BASE_TITLE,
      duration: DURATION,
      status: "draft",
      uploadedAt: "2025-06-14",
      uploadDate: BASE_DATE,
      views: null,
      engagement: { likes: null, comments: null, shares: null },
    },
    {
      id: "reel-003",
      title: BASE_TITLE,
      duration: DURATION,
      status: "scheduled",
      uploadedAt: "2025-06-14",
      uploadDate: BASE_DATE,
      views: null,
      engagement: { likes: null, comments: null, shares: null },
    },
    {
      id: "reel-004",
      title: BASE_TITLE,
      duration: DURATION,
      status: "published",
      uploadedAt: "2025-06-14",
      uploadDate: BASE_DATE,
      views: 48,
      engagement: { likes: 225, comments: 102, shares: 24 },
    },
    {
      id: "reel-005",
      title: BASE_TITLE,
      duration: DURATION,
      status: "published",
      uploadedAt: "2025-06-14",
      uploadDate: BASE_DATE,
      views: 48,
      engagement: { likes: 225, comments: 102, shares: 24 },
    },
    {
      id: "reel-006",
      title: BASE_TITLE,
      duration: DURATION,
      status: "published",
      uploadedAt: "2025-06-14",
      uploadDate: BASE_DATE,
      views: 120,
      engagement: { likes: 310, comments: 88, shares: 41 },
    },
    {
      id: "reel-007",
      title: "Summer collection showcase",
      duration: "1:12",
      status: "draft",
      uploadedAt: "2025-06-12",
      uploadDate: "12 Jun 2025, 4:15 pm",
      views: null,
      engagement: { likes: null, comments: null, shares: null },
    },
  ];
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

export function getCmsAnalyticsKpis(): CmsAnalyticsKpis {
  return {
    totalViews: 10_948,
    totalLikes: 5_937,
    totalComments: 2_037,
    totalShares: 1_678,
    avgWatchSeconds: 12,
    engagementRatePercent: 72,
  };
}

/** Daily views for the past week — aligns with Figma “Views Over Time” chart. */
export function getCmsViewsOverTime(): CmsViewsOverTimePoint[] {
  return [
    { day: "Mon", views: 420 },
    { day: "Tue", views: 510 },
    { day: "Wed", views: 380 },
    { day: "Thu", views: 620 },
    { day: "Fri", views: 540 },
    { day: "Sat", views: 480 },
    { day: "Sun", views: 560 },
  ];
}

/** Audience share by device (percent points summing to 100) — Figma “Audience by Device”. */
export interface CmsAudienceByDeviceSlice {
  label: string;
  value: number;
}

export function getCmsAudienceByDevice(): CmsAudienceByDeviceSlice[] {
  return [
    { label: "Desktop", value: 65 },
    { label: "Mobile", value: 25 },
    { label: "Tablet", value: 10 },
  ];
}
