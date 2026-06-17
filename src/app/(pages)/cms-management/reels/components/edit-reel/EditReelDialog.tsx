import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ReelAudience } from "@/lib/api/reels";
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
import { EditReelDialogFooter } from "./EditReelDialogFooter";
import { EditReelPreviewAside } from "./EditReelPreviewAside";
import { EditReelStepper } from "./EditReelStepper";
import { EditReelTagProductsStep, type TaggedProduct } from "./EditReelTagProductsStep";
import { EditReelThumbnailStep } from "./EditReelThumbnailStep";

export interface EditReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reel: CmsReel | null;
  editStep: number;
  onStepClick: (index: number) => void;
  cropRange: [number, number];
  onCropRangeChange: (range: [number, number]) => void;
  captionDraft: CaptionDraftState;
  setCaptionDraft: Dispatch<SetStateAction<CaptionDraftState>>;
  // Tag Products step
  reelTitle: string;
  onReelTitleChange: (value: string) => void;
  reelDescription: string;
  onReelDescriptionChange: (value: string) => void;
  reelAudience: ReelAudience;
  onReelAudienceChange: (value: ReelAudience) => void;
  audienceLocked: boolean;
  taggedProducts: TaggedProduct[];
  onTaggedProductsChange: (products: TaggedProduct[]) => void;
  // Thumbnail step
  activeThumbnailUrl: string | null;
  isUploadingThumbnail: boolean;
  onThumbnailFileSelected: (file: File) => void;
  // Shared
  videoSrc?: string | null;
  showCaptionOnReelPreview: boolean;
  isSubmitting: boolean;
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
  onStepClick,
  cropRange,
  onCropRangeChange,
  captionDraft,
  setCaptionDraft,
  reelTitle,
  onReelTitleChange,
  reelDescription,
  onReelDescriptionChange,
  reelAudience,
  onReelAudienceChange,
  audienceLocked,
  taggedProducts,
  onTaggedProductsChange,
  activeThumbnailUrl,
  isUploadingThumbnail,
  onThumbnailFileSelected,
  videoSrc,
  showCaptionOnReelPreview,
  isSubmitting,
  onSaveDraft,
  onScheduleClick,
  onPublish,
  onNextStep,
}: Readonly<EditReelDialogProps>) {
  const durationSeconds = reel ? parseDurationToSeconds(reel.duration) : 0;
  const rejectionReason =
    reel?.status === "rejected" || reel?.status === "resubmitted"
      ? (reel.rejection_reason ?? null)
      : null;
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
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
                {reel.status === "rejected" && (
                  <span className="shrink-0 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    Rejected
                  </span>
                )}
                {reel.status === "resubmitted" && (
                  <span className="shrink-0 rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                    Resubmitted
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                className="rounded-md p-1.5 text-[#2A2A2A] transition-colors hover:bg-[#F3F4F6] disabled:pointer-events-none disabled:opacity-50"
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
                taggedProducts={taggedProducts}
                videoSrc={videoSrc}
              />

              <div className="flex min-h-0 flex-1 flex-col bg-white md:min-h-[420px]">
                <EditReelStepper editStep={editStep} onStepClick={onStepClick} />

                {rejectionReason && (
                  <div className="mx-6 mt-4 overflow-hidden rounded-lg border border-red-200 bg-red-50">
                    <button
                      type="button"
                      onClick={() => setFeedbackOpen((v) => !v)}
                      className="flex w-full items-center justify-between px-3 py-2.5 transition-colors hover:bg-red-100"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 shrink-0 text-red-600" aria-hidden />
                        <span className="text-sm font-semibold text-red-800">Admin Feedback</span>
                      </div>
                      <ChevronDown
                        className={`size-4 text-red-600 transition-transform duration-200 ${feedbackOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {feedbackOpen && (
                      <p className="px-3 pb-3 pt-0.5 text-sm text-red-700">{rejectionReason}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-6">
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
                    <EditReelTagProductsStep
                      reelTitle={reelTitle}
                      onReelTitleChange={onReelTitleChange}
                      reelDescription={reelDescription}
                      onReelDescriptionChange={onReelDescriptionChange}
                      reelAudience={reelAudience}
                      onReelAudienceChange={onReelAudienceChange}
                      audienceLocked={audienceLocked}
                      taggedProducts={taggedProducts}
                      onTaggedProductsChange={onTaggedProductsChange}
                    />
                  ) : editStep === 3 ? (
                    <EditReelThumbnailStep
                      thumbnailUrl={activeThumbnailUrl}
                      isUploadingThumbnail={isUploadingThumbnail}
                      onThumbnailFileSelected={onThumbnailFileSelected}
                    />
                  ) : (
                    <p className="text-sm text-[#666666]">
                      {EDIT_FLOW_STEPS[editStep]?.label ?? "This"} — UI when CMS API is connected.
                    </p>
                  )}
                </div>

                <EditReelDialogFooter
                  editStep={editStep}
                  isSubmitting={isSubmitting}
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
