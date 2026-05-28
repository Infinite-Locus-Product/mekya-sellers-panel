import type { CmsReel } from "@/lib/data/cms";

/** Display-only: yyyy-mm-dd → dd/mm/yyyy */
export function isoToDdMmYyyy(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

/** "0:45" / "1:02:03" → total seconds for edit / crop UI */
export function parseDurationToSeconds(d: string): number {
  const parts = d.split(":").map((x) => Number.parseInt(x.trim(), 10));
  if (parts.some((n) => Number.isNaN(n))) return 45;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function reelDisplayFileName(title: string): string {
  if (/\.(mov|mp4|avi)$/i.test(title)) return title;
  return `${title}.mov`;
}

/** Parse filter field; empty input → ok ""; invalid → error */
export function parseDdMmYyyyToIso(raw: string): { ok: true; iso: string } | { ok: false } {
  const t = raw.trim();
  if (!t) return { ok: true, iso: "" };
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (!m) return { ok: false };
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { ok: false };
  const dt = new Date(yyyy, mm - 1, dd);
  if (
    dt.getFullYear() !== yyyy ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== dd
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    iso: `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`,
  };
}

/** Stub row for success/preview until CMS persists an uploaded file */
export function syntheticCmsReelFromUploadedFile(file: File): CmsReel {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const titleFromName = file.name.replace(/\.[^/.]+$/, "").trim();
  return {
    id: `local-upload-${now.getTime()}`,
    title: titleFromName || "Uploaded reel",
    duration: "0:45",
    status: "draft",
    uploadedAt: iso,
    uploadDate: now.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    views: null,
    engagement: { likes: null, comments: null, shares: null },
  };
}

export function defaultCaptionDraft() {
  return {
    editorOpen: false,
    text: "",
    fontSize: 24,
    color: "#FFFFFF" as string,
    posX: 50,
    posY: 85,
  };
}

export type CaptionDraftState = ReturnType<typeof defaultCaptionDraft>;
