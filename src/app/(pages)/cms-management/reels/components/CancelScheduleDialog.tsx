import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Schedule } from "@/lib/data/cms";
import { formatScheduleDateTime } from "../lib/utils";
import { CmsReelIconAlertTriangle } from "./cms-reels-icons";

export interface CancelScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isCancelling?: boolean;
  /** The active schedule, when known — used to show the target time / failure reason. */
  schedule?: Schedule | null;
}

export function CancelScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  isCancelling = false,
  schedule,
}: Readonly<CancelScheduleDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={isCancelling ? undefined : onOpenChange}>
      <DialogContent className="max-w-[min(calc(100vw-1.5rem),400px)] rounded-xl border border-[#E8E9E8] bg-white px-6 pb-6 pt-9 text-center shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col items-center">
          <div
            className="mb-4 flex size-[72px] items-center justify-center rounded-full bg-[#991B1B]/10"
            aria-hidden
          >
            <CmsReelIconAlertTriangle className="size-11 text-[#991B1B]" />
          </div>
          <h3 className="px-1 text-base font-bold leading-snug text-[#2A2A2A] min-[1920px]:text-lg">
            Cancel this reel&apos;s schedule?
          </h3>
          <p className="mt-2 text-sm text-[#71717A]">
            {schedule?.status === "failed" && schedule.last_error
              ? schedule.last_error
              : schedule?.scheduled_at
                ? `It was set to publish on ${formatScheduleDateTime(schedule.scheduled_at)}. The reel will revert to Draft.`
                : "The reel will revert to Draft."}
          </p>
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isCancelling}
              className="h-11 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
              onClick={() => onOpenChange(false)}
            >
              Keep Schedule
            </Button>
            <Button
              type="button"
              disabled={isCancelling}
              className="h-11 bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
              onClick={onConfirm}
            >
              {isCancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Cancelling…
                </span>
              ) : (
                "Yes, Cancel Schedule"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
