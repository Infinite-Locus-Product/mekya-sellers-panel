"use client";

import { cn } from "@/lib/utils";

export interface EngagementRateOverviewProps {
  /** Engagement rate 0–100 */
  percent: number;
  className?: string;
}

/**
 * Visual-only engagement hero: decorative background image, centered badge with rate.
 * Inputs: percent. Side effects: none.
 */
export function EngagementRateOverview({ percent, className }: Readonly<EngagementRateOverviewProps>) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div
      className={cn(
        "relative mx-auto flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat p-3",
        className
      )}
      style={{ backgroundImage: "url(/images/reel-analytics.png)" }}
    >
      <div
        className={cn(
          "relative z-[1] mx-auto flex aspect-square max-h-full min-h-0 w-full max-w-[132px] flex-col items-center justify-center rounded-full px-2 py-2 shadow-[0_12px_28px_-8px_rgba(22,101,52,0.35)]",
          "bg-[#bbf7d0] ring-1 ring-[#86efac]/80 min-[1920px]:px-3"
        )}
      >
        <span className="text-2xl font-bold leading-none tracking-tight text-[#166534] min-[1920px]:text-[38px]">
          {clamped}%
        </span>
        <span className="mt-1 max-w-[100px] text-center text-[9px] font-medium leading-tight text-[#166534] min-[1920px]:mt-2 min-[1920px]:text-xs">
          Overall Engagement Rate
        </span>
      </div>
    </div>
  );
}
