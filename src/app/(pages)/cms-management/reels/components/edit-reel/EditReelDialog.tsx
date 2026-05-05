import type { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { CmsReel } from "@/lib/data/cms";
import { CmsReelIconClose, CmsReelIconUpload } from "../cms-reels-icons";
import { EDIT_FLOW_STEPS } from "../../lib/constants";
import {
  parseDurationToSeconds,
  reelDisplayFileName,
  type CaptionDraftState,
} from "../../lib/utils";
import { EditReelCaptionsStep } from "./EditReelCaptionsStep";
import { EditReelCropStep } from "./EditReelCropStep";
import { EditReelDescriptionStep } from "./EditReelDescriptionStep";
import { EditReelDialogFooter } from "./EditReelDialogFooter";
import { EditReelPreviewAside } from "./EditReelPreviewAside";
import { EditReelStepper } from "./EditReelStepper";
import { EditReelThumbnailStep } from "./EditReelThumbnailStep";

export interface EditReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reel: CmsReel | null;
  editStep: number;
  cropRange: [number, number];
  onCropRangeChange: (range: [number, number]) => void;
  captionDraft: CaptionDraftState;
  setCaptionDraft: Dispatch<SetStateAction<CaptionDraftState>>;
  reelDescription: string;
  onReelDescriptionChange: (value: string) => void;
  selectedThumbnailFrameIndex: number;
  onSelectThumbnailFrame: (index: number) => void;
  showCaptionOnReelPreview: boolean;
  onSaveDraft: () => void;
  onScheduleClick: () => void;
  onPublish: () => void;
  onNextStep: () => void;
}

export function EditReelDialog({
  open,
  onOpenChange,
  reel,
  editStep,
  cropRange,
  onCropRangeChange,
  captionDraft,
  setCaptionDraft,
  reelDescription,
  onReelDescriptionChange,
  selectedThumbnailFrameIndex,
  onSelectThumbnailFrame,
  showCaptionOnReelPreview,
  onSaveDraft,
  onScheduleClick,
  onPublish,
  onNextStep,
}: Readonly<EditReelDialogProps>) {
  const durationSeconds = reel ? parseDurationToSeconds(reel.duration) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="max-h-[min(90vh,900px)] max-w-[min(calc(100vw-1rem),920px)] gap-0 overflow-hidden overflow-y-auto rounded-xl border border-[#E8E9E8] bg-white p-0 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]"
      >
        {reel ? (
          <>
            <div className="flex items-center justify-between border-b border-[#E8E9E8] px-6 py-4">
              <div className="flex min-w-0 items-center gap-2 text-base font-medium text-[#2A2A2A]">
                <CmsReelIconUpload className="size-5 shrink-0 text-[#2A2A2A]" aria-hidden />
                <span className="truncate">Edit Reel – {reelDisplayFileName(reel.title)}</span>
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6]"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <CmsReelIconClose className="size-5" aria-hidden />
              </button>
            </div>

            <div className="grid min-h-0 grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] md:min-h-[min(70vh,560px)]">
              <EditReelPreviewAside
                durationSeconds={durationSeconds}
                showCaptionOnReelPreview={showCaptionOnReelPreview}
                captionDraft={captionDraft}
              />

              <div className="flex min-h-0 flex-1 flex-col bg-white md:min-h-[420px]">
                <EditReelStepper editStep={editStep} />

                <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
                  {editStep === 0 ? (
                    <EditReelCropStep
                      durationLabel={reel.duration}
                      cropRange={cropRange}
                      onCropRangeChange={onCropRangeChange}
                    />
                  ) : editStep === 1 ? (
                    <EditReelCaptionsStep
                      captionDraft={captionDraft}
                      onCaptionDraftChange={setCaptionDraft}
                    />
                  ) : editStep === 2 ? (
                    <EditReelDescriptionStep
                      reelDescription={reelDescription}
                      onReelDescriptionChange={onReelDescriptionChange}
                    />
                  ) : editStep === 3 ? (
                    <EditReelThumbnailStep
                      selectedThumbnailFrameIndex={selectedThumbnailFrameIndex}
                      onSelectFrame={onSelectThumbnailFrame}
                    />
                  ) : (
                    <p className="text-sm text-[#666666]">
                      {EDIT_FLOW_STEPS[editStep]?.label ?? "This"} — UI when CMS API is connected.
                    </p>
                  )}
                </div>
                <EditReelDialogFooter
              editStep={editStep}
              onSaveDraft={onSaveDraft}
              onScheduleClick={onScheduleClick}
              onPublish={onPublish}
              onNextStep={onNextStep}
            />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
