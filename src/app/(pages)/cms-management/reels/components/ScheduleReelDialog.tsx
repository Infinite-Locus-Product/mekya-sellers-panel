import { CalendarClock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CmsReelIconArrowLeft, CmsReelIconClose } from "./cms-reels-icons";

export interface ScheduleReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleDateIso: string;
  onScheduleDateIsoChange: (value: string) => void;
  scheduleTimeStr: string;
  onScheduleTimeStrChange: (value: string) => void;
  onConfirmSchedule: () => void;
}

export function ScheduleReelDialog({
  open,
  onOpenChange,
  scheduleDateIso,
  onScheduleDateIsoChange,
  scheduleTimeStr,
  onScheduleTimeStrChange,
  onConfirmSchedule,
}: Readonly<ScheduleReelDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="max-w-[min(calc(100vw-1.5rem),480px)] gap-0 overflow-hidden rounded-xl border border-[#E8E9E8] bg-white p-0 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]"
      >
        <div className="relative flex items-center justify-center border-b border-[#E8E9E8] px-12 py-4">
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6]"
            aria-label="Back"
            onClick={() => onOpenChange(false)}
          >
            <CmsReelIconArrowLeft className="size-5" aria-hidden />
          </button>
          <h2 className="text-center text-base font-semibold text-[#2A2A2A]">Schedule Reel for Later</h2>
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6]"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <CmsReelIconClose className="size-5" aria-hidden />
          </button>
        </div>
        <div className="space-y-5 px-6 py-6">
          <div className="flex items-start gap-2 text-sm font-medium text-[#2A2A2A]">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#2A2A2A]" aria-hidden />
            <span>Select Date &amp; Time to Publish</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_minmax(0,140px)]">
            <div className="relative">
              <Input
                type="date"
                value={scheduleDateIso}
                onChange={(e) => onScheduleDateIsoChange(e.target.value)}
                className="h-11 cursor-pointer rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] pr-10 text-sm text-[#2A2A2A] shadow-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:opacity-0"
                aria-label="Publish date"
              />
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#71717A]"
                aria-hidden
              />
            </div>
            <Input
              type="time"
              value={scheduleTimeStr}
              onChange={(e) => onScheduleTimeStrChange(e.target.value)}
              className="h-11 rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] text-sm text-[#2A2A2A] shadow-none"
              aria-label="Publish time"
            />
          </div>
          <Button
            type="button"
            className="mt-2 h-11 w-full bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
            onClick={onConfirmSchedule}
          >
            Schedule for Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
