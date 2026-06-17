import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CmsReelIconClose } from "./cms-reels-icons";

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
        className="max-w-[min(calc(100vw-1.5rem),420px)] gap-0 overflow-hidden rounded-xl border border-[#E8E9E8] bg-white p-0 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]"
      >
        <div className="flex items-center justify-between border-b border-[#E8E9E8] px-4 py-3">
          <span className="min-w-0 truncate text-sm font-medium text-[#2A2A2A]">{title}</span>
          <button
            type="button"
            className="rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6]"
            aria-label="Close preview"
            onClick={() => onOpenChange(false)}
          >
            <CmsReelIconClose className="size-5" aria-hidden />
          </button>
        </div>
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            className="mx-auto max-h-[min(70vh,520px)] w-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            aria-label="Reel preview"
          />
        ) : (
          <div className="flex min-h-[200px] items-center justify-center bg-black text-sm text-[#666666]">
            No video available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
