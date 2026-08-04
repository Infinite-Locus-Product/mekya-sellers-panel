import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CmsReelIconClose, CmsReelIconEye } from "./cms-reels-icons";

export interface ReelPreviewDialogProps {
  open: boolean;
  title: string;
  videoSrc: string | null | undefined;
  onOpenChange: (open: boolean) => void;
}

export function ReelPreviewDialog({
  open,
  title,
  videoSrc,
  onOpenChange,
}: Readonly<ReelPreviewDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="max-w-[min(calc(100vw-1.5rem),460px)] gap-0 overflow-hidden rounded-2xl border border-[#E8E9E8] bg-white p-0 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)]"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#2A2A2A]">
              <CmsReelIconEye className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-[#2A2A2A]">{title}</span>
          </div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6]"
            aria-label="Close preview"
            onClick={() => onOpenChange(false)}
          >
            <CmsReelIconClose className="size-4" aria-hidden />
          </button>
        </div>
        <div className="bg-[#0B0B0F] px-5 pb-5">
          <div className="mx-auto flex max-h-[min(65vh,540px)] w-full items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
            {videoSrc ? (
              <video
                key={videoSrc}
                src={videoSrc}
                className="max-h-[min(65vh,540px)] w-full object-contain"
                controls
                playsInline
                preload="metadata"
                aria-label="Reel preview"
              />
            ) : (
              <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-2 py-16 text-[#8B8D98]">
                <CmsReelIconEye className="size-6" aria-hidden />
                <span className="text-sm">No video available</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
