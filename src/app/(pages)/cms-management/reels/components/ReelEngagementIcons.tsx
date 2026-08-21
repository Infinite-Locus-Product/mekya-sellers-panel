import type { CmsReel } from "@/lib/data/cms";

/** Likes / saves / shares for one reel.
 *
 * `justify-center` is load-bearing: DataTable centres columns by putting `text-center` on the
 * `<td>`, which does nothing to a flex container. Without it the icons sat hard left under a
 * centred "Engagement" header.
 *
 * The icons are inline SVGs rather than lucide imports so all three share one 16x16 outline
 * weight — a lucide icon next to these renders at a visibly different stroke.
 */
export function ReelEngagementIcons({ reel }: Readonly<{ reel: CmsReel }>) {
  const { likes, saves, shares } = reel.engagement;
  const fmt = (n: number | null) => (n != null ? String(n) : "—");
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground min-[1920px]:text-xs">
      <span className="inline-flex items-center gap-1" title="Likes">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8.06732 12.3667L8.00065 12.4333L7.92732 12.3667C4.76065 9.49333 2.66732 7.59333 2.66732 5.66667C2.66732 4.33333 3.66732 3.33333 5.00065 3.33333C6.02732 3.33333 7.02732 4 7.38065 4.90667H8.62065C8.97398 4 9.97398 3.33333 11.0007 3.33333C12.334 3.33333 13.334 4.33333 13.334 5.66667C13.334 7.59333 11.2407 9.49333 8.06732 12.3667ZM11.0007 2C9.84065 2 8.72732 2.54 8.00065 3.38667C7.27398 2.54 6.16065 2 5.00065 2C2.94732 2 1.33398 3.60667 1.33398 5.66667C1.33398 8.18 3.60065 10.24 7.03398 13.3533L8.00065 14.2333L8.96732 13.3533C12.4007 10.24 14.6673 8.18 14.6673 5.66667C14.6673 3.60667 13.054 2 11.0007 2Z" fill="black"/>
        </svg>
        <span className="tabular-nums">{fmt(likes)}</span>
      </span>
      <span className="inline-flex items-center gap-1" title="Saves">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M11.3327 2.00065H4.66602C3.93268 2.00065 3.33935 2.60065 3.33935 3.33398L3.33268 14.0007L7.99935 12.0007L12.666 14.0007V3.33398C12.666 2.60065 12.066 2.00065 11.3327 2.00065ZM11.3327 12.0007L7.99935 10.5473L4.66602 12.0007V3.33398H11.3327V12.0007Z" fill="black"/>
        </svg>
        <span className="tabular-nums">{fmt(saves)}</span>
      </span>
      <span className="inline-flex items-center gap-1" title="Shares">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9.33333 3.33203V5.9987C4.66667 6.66536 2.66667 9.9987 2 13.332C3.66667 10.9987 6 9.93203 9.33333 9.93203V12.6654L14 7.9987L9.33333 3.33203ZM10.6667 6.55203L12.1133 7.9987L10.6667 9.44536V8.5987H9.33333C7.95333 8.5987 6.71333 8.85203 5.56 9.23203C6.49333 8.30537 7.69333 7.5787 9.52 7.33203L10.6667 7.15203V6.55203Z" fill="black"/>
        </svg>
        <span className="tabular-nums">{fmt(shares)}</span>
      </span>
    </div>
  );
}
