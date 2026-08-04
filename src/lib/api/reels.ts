import { authService } from "@/lib/auth/authService";
import type { CmsAnalyticsSummary, CmsReel, ReelStatus, Schedule } from "@/lib/data/cms";

export type ReelAudience = "b2b" | "b2c" | "both";

// ─── Presign ─────────────────────────────────────────────────────────────────

export interface PresignUploadResponse {
  upload_url: string;
  s3_url: string;
  key: string;
  content_type: string;
  expires_in: number;
}

export interface PresignThumbnailResponse {
  upload_url: string;
  thumbnail_url: string;
  content_type: string;
  expires_in: number;
}

export async function presignVideoUpload(
  filename: string,
  content_type: string,
  file_size_bytes: number,
): Promise<PresignUploadResponse> {
  const res = await authService.api.post<PresignUploadResponse>(
    "/seller/reels/presign-upload",
    { filename, content_type, file_size_bytes },
  );
  return res.data;
}

export async function presignThumbnailUpload(
  filename: string,
  content_type: string,
): Promise<PresignThumbnailResponse> {
  const res = await authService.api.post<PresignThumbnailResponse>(
    "/seller/reels/presign-thumbnail",
    { filename, content_type },
  );
  return res.data;
}

/** Direct PUT to MinIO/S3 — no auth header, raw file bytes. */
export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload failed (${res.status})`);
}

// ─── Seller Products (for product picker) ────────────────────────────────────

export interface SellerProduct {
  product_id: string;
  name: string;
  thumbnail_url: string | null;
  sku: string;
  channel: ReelAudience | "all";
}

export interface SellerProductsResponse {
  products: SellerProduct[];
  has_next: boolean;
  cursor: string | null;
  total: number;
}

export async function getSellerProducts(params?: {
  channel?: ReelAudience | "all";
  search?: string;
  limit?: number;
  cursor?: string;
}): Promise<SellerProductsResponse> {
  const query = new URLSearchParams();
  if (params?.channel) query.set("channel", params.channel);
  if (params?.search) query.set("search", params.search);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.cursor) query.set("cursor", params.cursor);
  const qs = query.toString();
  const res = await authService.api.get<SellerProductsResponse>(
    `/seller/reels/products${qs ? `?${qs}` : ""}`,
  );
  return res.data ?? { products: [], has_next: false, cursor: null, total: 0 };
}

// ─── Create / update / delete ────────────────────────────────────────────────

export interface CreateReelRequest {
  title: string;
  description: string;
  s3_url: string;
  /** No longer required at creation — the backend now only requires it at submit time. */
  thumbnail_url?: string;
  duration_seconds: number;
  audience: ReelAudience;
  product_ids: string[];
}

export interface CreateReelResponse {
  reel_id: string;
  status: "draft";
  thumbnail_url: string | null;
  video_url: string;
  audience: ReelAudience;
  message: string;
}

export async function createReel(req: CreateReelRequest): Promise<CreateReelResponse> {
  const res = await authService.api.post<CreateReelResponse>("/seller/reels", req);
  return res.data;
}

export async function updateReel(
  reelId: string,
  updates: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    product_ids?: string[];
    audience?: ReelAudience;
    /**
     * Required (true) to edit a reel in a locked status (approved/published/unpublished/
     * scheduled) — the edit then goes through and status flips to "resubmitted". Omit/false
     * on draft/pending/rejected/resubmitted, which aren't locked.
     */
    force_resubmit?: boolean;
  },
): Promise<void> {
  await authService.api.patch<unknown>(`/seller/reels/${reelId}`, updates);
}

export async function deleteReel(reelId: string): Promise<void> {
  await authService.api.delete<unknown>(`/seller/reels/${reelId}`);
}

/** POST /seller/reels/{reel_id}/submit — draft/rejected → pending. 400 REEL_THUMBNAIL_REQUIRED if no thumbnail. */
export async function submitReel(reelId: string): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/submit`);
}

/** POST /seller/reels/{reel_id}/publish — approved/unpublished → published. */
export async function publishReel(reelId: string): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/publish`);
}

/** POST /seller/reels/{reel_id}/unpublish — published → unpublished. */
export async function unpublishReel(reelId: string): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/unpublish`);
}

/** POST /seller/reels/{reel_id}/resubmit — rejected only → resubmitted. */
export async function resubmitReel(reelId: string): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/resubmit`);
}

// ─── State transitions ────────────────────────────────────────────────────────

export async function saveReelAsDraft(
  reelId: string,
  opts?: { title?: string; description?: string },
): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/draft`, opts ?? {});
}

export interface ScheduleReelResponse {
  reel_id: string;
  status: "scheduled";
  publish_at: string;
  schedule: Schedule;
  message: string;
}

/** POST /seller/reels/{reel_id}/schedule — publishAt must be a future ISO 8601 timestamp, <= 1 year out. */
export async function scheduleReel(
  reelId: string,
  publishAt: string,
): Promise<ScheduleReelResponse> {
  const res = await authService.api.post<ScheduleReelResponse>(
    `/seller/reels/${reelId}/schedule`,
    { publish_at: publishAt },
  );
  return res.data;
}

export interface CancelScheduleResponse {
  reel_id: string;
  cancelled: true;
  message: string;
}

/** DELETE /seller/reels/{reel_id}/schedule — reverts the reel to "draft". */
export async function cancelReelSchedule(reelId: string): Promise<CancelScheduleResponse> {
  const res = await authService.api.delete<CancelScheduleResponse>(
    `/seller/reels/${reelId}/schedule`,
  );
  return res.data;
}

/** GET /seller/reels/{reel_id}/schedule */
export async function getReelSchedule(reelId: string): Promise<Schedule | null> {
  const res = await authService.api.get<{ schedule: Schedule | null }>(
    `/seller/reels/${reelId}/schedule`,
  );
  return res.data?.schedule ?? null;
}

// ─── List (maps API shape → CmsReel) ─────────────────────────────────────────

interface ApiReel {
  reel_id: string;
  title: string;
  description?: string;
  status: string;
  audience: string;
  duration_seconds: number;
  views: number | null;
  likes: number | null;
  thumbnail_url: string | null;
  video_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  published_at: string | null;
  /** True only when status === "approved" — drives whether Schedule for Later is offered. */
  can_schedule: boolean;
}

function mapApiReel(r: ApiReel): CmsReel {
  const secs = r.duration_seconds ?? 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const iso = r.created_at ?? new Date().toISOString();
  return {
    id: r.reel_id,
    title: r.title,
    duration: `${m}:${s.toString().padStart(2, "0")}`,
    status: r.status as ReelStatus,
    uploadedAt: iso.slice(0, 10),
    uploadDate: new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    views: r.views ?? null,
    engagement: { likes: r.likes ?? null, comments: null, shares: null },
    thumbnail_url: r.thumbnail_url ?? undefined,
    s3_url: r.video_url ?? undefined,
    description: r.description,
    audience: r.audience as ReelAudience,
    rejection_reason: r.rejection_reason,
    canSchedule: r.can_schedule ?? false,
  };
}

export async function listReels(params?: {
  status?: ReelStatus;
  search?: string;
  limit?: number;
  /** ISO 8601. Not yet confirmed live on the backend — sent speculatively; the caller
   * re-applies the same range client-side so filtering is correct either way. */
  date_from?: string;
  date_to?: string;
}): Promise<CmsReel[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.date_from) query.set("date_from", params.date_from);
  if (params?.date_to) query.set("date_to", params.date_to);
  const qs = query.toString();
  const res = await authService.api.get<{ reels: ApiReel[] }>(
    `/seller/reels${qs ? `?${qs}` : ""}`,
  );
  return (res.data?.reels ?? []).map(mapApiReel);
}

interface ApiReelDetail extends ApiReel {
  product_tags?: Array<{ saleor_product_id: string }>;
}

export interface ReelDetail extends CmsReel {
  product_ids: string[];
}

export async function getReelById(reelId: string): Promise<ReelDetail> {
  const res = await authService.api.get<ApiReelDetail>(`/seller/reels/${reelId}`);
  const r = res.data;
  return {
    ...mapApiReel(r),
    product_ids: (r.product_tags ?? []).map((t) => t.saleor_product_id),
  };
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface ReelAnalytics {
  reel_id: string;
  views: number;
  likes: number;
  avg_watch_time_seconds: number;
  saves: number;
  shares: number;
}

export async function getReelAnalytics(reelId: string): Promise<ReelAnalytics> {
  const res = await authService.api.get<ReelAnalytics>(`/seller/reels/${reelId}/analytics`);
  return res.data;
}

// ─── Aggregate analytics (CMS dashboard) ─────────────────────────────────────

export type AnalyticsDateRange = "7d" | "30d" | "90d" | "all";

interface ApiAnalyticsSummaryKpis {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  avg_watch_time_seconds: number;
  engagement_rate_percent: number;
}

interface ApiAnalyticsSummary {
  kpis: ApiAnalyticsSummaryKpis;
  views_over_time: Array<{ day: string; views: number }>;
  audience_by_device: Array<{ device: string; views: number }>;
  top_reels: Array<{
    reel_id: string;
    title: string;
    thumbnail_url: string | null;
    views: number;
    likes: number;
    shares: number;
  }>;
  date_range: string;
}

export async function getReelAnalyticsSummary(
  dateRange: AnalyticsDateRange = "30d",
): Promise<CmsAnalyticsSummary> {
  const res = await authService.api.get<ApiAnalyticsSummary>(
    `/seller/reels/analytics/summary?range=${dateRange}`,
  );
  const data = res.data;
  return {
    kpis: {
      totalViews: data.kpis.total_views,
      totalLikes: data.kpis.total_likes,
      totalComments: data.kpis.total_comments,
      totalShares: data.kpis.total_shares,
      avgWatchSeconds: data.kpis.avg_watch_time_seconds,
      engagementRatePercent: data.kpis.engagement_rate_percent,
    },
    viewsOverTime: data.views_over_time.map((p) => ({ day: p.day, views: p.views })),
    audienceByDevice: data.audience_by_device.map((s) => ({
      label: s.device,
      value: s.views,
    })),
    topReels: data.top_reels.map((r) => ({
      reelId: r.reel_id,
      title: r.title,
      thumbnailUrl: r.thumbnail_url,
      views: r.views,
      likes: r.likes,
      shares: r.shares,
    })),
  };
}
