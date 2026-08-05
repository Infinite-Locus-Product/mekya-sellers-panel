import { cn } from "@/lib/utils";
import type { ReelStatus } from "@/lib/data/cms";
import { BadgeCheck, Clock, EyeOff, FileText, Hourglass, RotateCcw, XCircle } from "lucide-react";

const STYLES: Record<
  ReelStatus,
  { className: string; label: string; Icon: typeof Clock }
> = {
  draft: {
    className: "bg-[#DBEAFE] text-[#1D4ED8]",
    label: "Draft",
    Icon: FileText,
  },
  pending: {
    className: "bg-[#FEF3C7] text-[#92400E]",
    label: "Pending Review",
    Icon: Hourglass,
  },
  approved: {
    className: "bg-[#DCFCE7] text-[#15803D]",
    label: "Approved",
    Icon: BadgeCheck,
  },
  rejected: {
    className: "bg-[#FEE2E2] text-[#B91C1C]",
    label: "Rejected",
    Icon: XCircle,
  },
  resubmitted: {
    className: "bg-[#F3E8FF] text-[#6B21A8]",
    label: "Resubmitted",
    Icon: RotateCcw,
  },
  scheduled: {
    className: "bg-[#E0E7FF] text-[#3730A3]",
    label: "Scheduled",
    Icon: Clock,
  },
  published: {
    className: "bg-[#CCFBF1] text-[#0F766E]",
    label: "Published",
    Icon: BadgeCheck,
  },
  unpublished: {
    className: "bg-[#F3F4F6] text-[#4B5563]",
    label: "Unpublished",
    Icon: EyeOff,
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
        "inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        "sm:text-[10.5px] lg:min-w-[100px] lg:h-[21px] xl:min-w-[112px] xl:h-[23px]",
        "min-[1920px]:min-w-[124px] min-[1920px]:h-[25px] min-[1920px]:px-2 min-[1920px]:py-0.5 min-[1920px]:gap-1 min-[1920px]:text-xs",
        cfg.className,
        className
      )}
    >
      <Icon className="size-3 shrink-0 opacity-90 min-[1920px]:size-3.5" aria-hidden />
      {cfg.label}
    </span>
  );
}
