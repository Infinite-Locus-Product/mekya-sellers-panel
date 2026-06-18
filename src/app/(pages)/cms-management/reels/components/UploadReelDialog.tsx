import type { RefObject } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VIDEO_ACCEPT } from "../lib/constants";
import { CmsReelIconClose, CmsReelIconUpload } from "./cms-reels-icons";

export interface UploadReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadInputRef: RefObject<HTMLInputElement | null>;
  uploadFile: File | null;
  uploadPreviewUrl: string | null;
  onPickFile: (file: File | undefined) => void;
  onNext: () => void;
  onDurationDetected: (seconds: number) => void;
  isUploading: boolean;
  reelTitle: string;
  onReelTitleChange: (value: string) => void;
  reelDescription: string;
  onReelDescriptionChange: (value: string) => void;
}

export function UploadReelDialog({
  open,
  onOpenChange,
  uploadInputRef,
  uploadFile,
  uploadPreviewUrl,
  onPickFile,
  onNext,
  onDurationDetected,
  isUploading,
  reelTitle,
  onReelTitleChange,
  reelDescription,
  onReelDescriptionChange,
}: Readonly<UploadReelDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={isUploading ? undefined : onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="flex max-h-[calc(100svh-2rem)] max-w-[min(calc(100vw-1.5rem),480px)] flex-col gap-0 overflow-hidden rounded-xl border border-[#E8E9E8] bg-white p-0 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8E9E8] px-5 py-4">
          <div className="flex items-center gap-2 text-base font-medium text-[#2A2A2A]">
            <CmsReelIconUpload className="size-5 shrink-0 text-[#2A2A2A]" aria-hidden />
            Upload Your Reel
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6] disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
            disabled={isUploading}
            onClick={() => onOpenChange(false)}
          >
            <CmsReelIconClose className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <input
            ref={uploadInputRef}
            type="file"
            className="sr-only"
            accept={VIDEO_ACCEPT}
            aria-label="Choose video file"
            onChange={(e) => {
              onPickFile(e.target.files?.[0]);
            }}
          />
          <button
            type="button"
            disabled={isUploading}
            className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#D4D4D4] bg-white px-4 py-8 text-center transition-colors hover:border-[#004C5E]/40 hover:bg-[#F9FAF9] disabled:pointer-events-none"
            onClick={() => uploadInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPickFile(e.dataTransfer.files[0]);
            }}
          >
            {uploadFile ? (
              <>
                <video
                  src={uploadPreviewUrl ?? ""}
                  className="mb-3 max-h-[200px] w-full rounded-md bg-black object-contain"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Selected file preview"
                  onLoadedMetadata={(e) => {
                    const dur = (e.currentTarget as HTMLVideoElement).duration;
                    if (isFinite(dur) && dur > 0) onDurationDetected(Math.round(dur));
                  }}
                />
                <span className="max-w-full truncate px-3 text-center text-sm font-normal text-[#2A2A2A]">
                  {uploadFile.name}
                </span>
              </>
            ) : (
              <>
                <CmsReelIconUpload className="mb-4 size-12 text-[#71717A]" aria-hidden />
                <span className="text-base font-bold text-[#2A2A2A]">Drop your video file here</span>
                <span className="mt-1.5 text-sm text-[#666666]">or click to browse your gallery</span>
              </>
            )}
          </button>

          {uploadFile && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="upload-reel-title" className="text-sm font-medium text-[#2A2A2A]">
                  Reel Title <span className="text-[#EF4444]">*</span>
                </label>
                <Input
                  id="upload-reel-title"
                  value={reelTitle}
                  onChange={(e) => onReelTitleChange(e.target.value)}
                  placeholder="Enter a title for this reel"
                  maxLength={200}
                  disabled={isUploading}
                  className="h-10 rounded-lg border-[#E8E9E8] bg-[#F3F4F6] text-sm text-[#2A2A2A] shadow-none placeholder:text-[#71717A] focus-visible:ring-[#2A2A2A]/20"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#666666]">
                  <label htmlFor="upload-reel-description" className="text-sm font-medium text-[#2A2A2A]">
                    Description
                  </label>
                  <span className="tabular-nums">{reelDescription.length}/1000</span>
                </div>
                <textarea
                  id="upload-reel-description"
                  value={reelDescription}
                  onChange={(e) => onReelDescriptionChange(e.target.value.slice(0, 1000))}
                  placeholder="Describe your reel (optional)"
                  rows={3}
                  disabled={isUploading}
                  className="w-full resize-none rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#2A2A2A] placeholder:text-[#71717A] shadow-none focus:outline-none focus:ring-2 focus:ring-[#2A2A2A]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-normal text-[#666666]">Upload Requirements :</p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#666666]">
              <li>Supported formats: MP4, MOV, AVI</li>
              <li>Maximum file size: 100MB</li>
              <li>Duration: 15-60 seconds</li>
              <li>Recommended resolution: 1080×1920 (9:16)</li>
            </ul>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#E8E9E8] px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="h-11 w-full border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!uploadFile || isUploading}
            className="h-11 w-full bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90 disabled:cursor-not-allowed disabled:bg-[#E8E9E8] disabled:text-[#71717A] disabled:opacity-100 disabled:hover:bg-[#E8E9E8]"
            onClick={onNext}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Uploading…
              </span>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
