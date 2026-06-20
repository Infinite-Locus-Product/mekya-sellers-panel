import { authService } from "@/lib/auth/authService";
import type { CmsReel, ReelStatus } from "@/lib/data/cms";

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
  thumbnail_url: string;
  duration_seconds: number;
  audience: ReelAudience;
  product_ids: string[];
}

export interface CreateReelResponse {
  reel_id: string;
  status: "pending";
  thumbnail_url: string;
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
  },
): Promise<void> {
  await authService.api.patch<unknown>(`/seller/reels/${reelId}`, updates);
}

export async function deleteReel(reelId: string): Promise<void> {
  await authService.api.delete<unknown>(`/seller/reels/${reelId}`);
}

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

export async function scheduleReel(reelId: string, publishAt: string): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/schedule`, {
    publish_at: publishAt,
  });
}

// ─── Captions ────────────────────────────────────────────────────────────────

export async function addCaptions(
  reelId: string,
  captions: Array<{
    text: string;
    start_ms: number;
    end_ms: number;
    font_size?: number;
    color?: string;
    pos_x?: number;
    pos_y?: number;
  }>,
): Promise<void> {
  await authService.api.post<unknown>(`/seller/reels/${reelId}/captions`, { captions });
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
  };
}

export async function listReels(params?: { status?: ReelStatus; limit?: number }): Promise<CmsReel[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
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
