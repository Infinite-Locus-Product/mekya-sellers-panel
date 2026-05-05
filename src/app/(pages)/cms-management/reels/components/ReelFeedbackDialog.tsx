import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ReelFeedbackVariant } from "../lib/constants";
import { REEL_FEEDBACK_TITLE } from "../lib/constants";
import { CmsReelIconCheck, CmsReelIconClose } from "./cms-reels-icons";

export interface ReelFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ReelFeedbackVariant;
  onPreview: () => void;
}

export function ReelFeedbackDialog({
  open,
  onOpenChange,
  variant,
  onPreview,
}: Readonly<ReelFeedbackDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="max-w-[min(calc(100vw-1.5rem),400px)] gap-0 overflow-hidden rounded-xl border border-[#E8E9E8] bg-white p-0 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]"
      >
        <div className="relative px-6 pb-8 pt-6">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6]"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <CmsReelIconClose className="size-5" aria-hidden />
          </button>
          <div className="flex flex-col items-center px-2 pt-6 text-center">
            <div
              className="mb-5 flex size-[72px] items-center justify-center rounded-full bg-[#22C55E]"
              aria-hidden
            >
              <CmsReelIconCheck className="size-10 text-white [&_path]:stroke-[2.5]" aria-hidden />
            </div>
            <h3 className="text-base font-bold leading-snug text-[#2A2A2A] min-[1920px]:text-lg">
              {REEL_FEEDBACK_TITLE[variant]}
            </h3>
            <div className="mt-8 w-full space-y-3">
              <Button
                type="button"
                className="h-11 w-full bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
                onClick={onPreview}
              >
                Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
                onClick={() => onOpenChange(false)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
