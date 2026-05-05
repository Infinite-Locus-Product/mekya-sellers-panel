import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { CmsReel } from "@/lib/data/cms";

export function ReelEngagementIcons({ reel }: Readonly<{ reel: CmsReel }>) {
  const { likes, comments, shares } = reel.engagement;
  const fmt = (n: number | null) => (n != null ? String(n) : "—");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground min-[1920px]:text-xs">
      <span className="inline-flex items-center gap-1">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.06732 12.3667L8.00065 12.4333L7.92732 12.3667C4.76065 9.49333 2.66732 7.59333 2.66732 5.66667C2.66732 4.33333 3.66732 3.33333 5.00065 3.33333C6.02732 3.33333 7.02732 4 7.38065 4.90667H8.62065C8.97398 4 9.97398 3.33333 11.0007 3.33333C12.334 3.33333 13.334 4.33333 13.334 5.66667C13.334 7.59333 11.2407 9.49333 8.06732 12.3667ZM11.0007 2C9.84065 2 8.72732 2.54 8.00065 3.38667C7.27398 2.54 6.16065 2 5.00065 2C2.94732 2 1.33398 3.60667 1.33398 5.66667C1.33398 8.18 3.60065 10.24 7.03398 13.3533L8.00065 14.2333L8.96732 13.3533C12.4007 10.24 14.6673 8.18 14.6673 5.66667C14.6673 3.60667 13.054 2 11.0007 2Z" fill="black"/>
</svg>

        <span className="tabular-nums">{fmt(likes)}</span>
      </span>
      <span className="inline-flex items-center gap-1">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 14C9.18669 14 10.3467 13.6481 11.3334 12.9888C12.3201 12.3295 13.0892 11.3925 13.5433 10.2961C13.9974 9.19975 14.1162 7.99335 13.8847 6.82946C13.6532 5.66558 13.0818 4.59648 12.2426 3.75736C11.4035 2.91825 10.3344 2.3468 9.17054 2.11529C8.00666 1.88378 6.80026 2.0026 5.7039 2.45673C4.60754 2.91085 3.67047 3.67989 3.01118 4.66658C2.35189 5.65328 2 6.81331 2 8C2 8.992 2.24 9.92734 2.66667 10.7513L2 14L5.24867 13.3333C6.07267 13.76 7.00867 14 8 14Z" stroke="black" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span className="tabular-nums">{fmt(comments)}</span>
      </span>
      <span className="inline-flex items-center gap-1">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.33333 3.33203V5.9987C4.66667 6.66536 2.66667 9.9987 2 13.332C3.66667 10.9987 6 9.93203 9.33333 9.93203V12.6654L14 7.9987L9.33333 3.33203ZM10.6667 6.55203L12.1133 7.9987L10.6667 9.44536V8.5987H9.33333C7.95333 8.5987 6.71333 8.85203 5.56 9.23203C6.49333 8.30537 7.69333 7.5787 9.52 7.33203L10.6667 7.15203V6.55203Z" fill="black"/>
</svg>

        <span className="tabular-nums">{fmt(shares)}</span>
      </span>
    </div>
  );
}
