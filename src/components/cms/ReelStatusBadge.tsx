import { cn } from "@/lib/utils";
import type { ReelStatus } from "@/lib/data/cms";
import { BadgeCheck, Clock, FileText, Hourglass, RotateCcw, XCircle } from "lucide-react";

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
  pending: {
    className: "bg-[#FEE2E2] text-[#991B1B]",
    label: "Pending Review",
    Icon: Hourglass,
  },
  rejected: {
    className: "bg-[#FEE2E2] text-[#7F1D1D]",
    label: "Rejected",
    Icon: XCircle,
  },
  resubmitted: {
    className: "bg-[#F3E8FF] text-[#6B21A8]",
    label: "Resubmitted",
    Icon: RotateCcw,
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
