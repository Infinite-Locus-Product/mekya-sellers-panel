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

/** Local &lt;input type="date"&gt; + &lt;input type="time"&gt; values → UTC ISO 8601 with a trailing "Z", as the schedule API expects. */
export function localDateTimeToUtcIso(dateIso: string, timeStr: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0, 0, 0).toISOString();
}

/** now() + 1 hour, split into the local date/time strings the schedule inputs use. */
export function defaultScheduleDateTime(): { date: string; time: string } {
  const dt = new Date(Date.now() + 60 * 60 * 1000);
  const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const time = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

/** Display string for a Schedule's scheduled_at, e.g. "14 Jun 2026, 10:30 am" */
export function formatScheduleDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
    engagement: { likes: null, saves: null, shares: null },
  };
}
