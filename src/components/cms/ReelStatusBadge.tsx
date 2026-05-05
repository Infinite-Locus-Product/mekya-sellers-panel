import { cn } from "@/lib/utils";
import type { ReelStatus } from "@/lib/data/cms";
import { BadgeCheck, Clock, FileText } from "lucide-react";

const STYLES: Record<
  ReelStatus,
  { className: string; label: string; Icon: typeof Clock }
> = {
  scheduled: {
    className: "bg-[#FEF9C2] text-[#686000]",
    label: "Scheduled",
    Icon: Clock,
  },
  draft: {
    className: "bg-[#DBEAFE] text-[#1D4ED8]",
    label: "Draft",
    Icon: FileText,
  },
  published: {
    className: "bg-[#DBFCE7] text-[#016630]",
    label: "Published",
    Icon: BadgeCheck,
  },
};

interface ReelStatusBadgeProps {
  status: ReelStatus;
  className?: string;
}

export function ReelStatusBadge({ status, className }: Readonly<ReelStatusBadgeProps>) {
  const cfg = STYLES[status];
  const Icon = cfg.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium min-[1920px]:text-xs",
        cfg.className,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0 opacity-90" aria-hidden />
      {cfg.label}
    </span>
  );
}
