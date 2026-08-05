import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EditReelDialogFooterProps {
  isLastStep: boolean;
  isSubmitting?: boolean;
  /** True while uploading a brand-new reel — Schedule for Later isn't offered at creation time. */
  isNewUploadFlow: boolean;
  /**
   * Edit flow only: true once this reel has been approved. Schedule for Later stays visible but
   * disabled on any reel still pending/rejected/resubmitted/draft/already-scheduled.
   */
  canSchedule: boolean;
  /** False for reels in a locked status (approved/published/unpublished/scheduled) — drafting a
   *  live/approved/scheduled reel back down isn't a supported transition. */
  canSaveDraft: boolean;
  /** Rightmost primary button's label on the final step — varies with the reel's status. */
  submitLabel: string;
  onSaveDraft: () => void;
  onScheduleClick: () => void;
  onPublish: () => void;
  onNextStep: () => void;
}

export function EditReelDialogFooter({
  isLastStep,
  isSubmitting = false,
  isNewUploadFlow,
  canSchedule,
  canSaveDraft,
  submitLabel,
  onSaveDraft,
  onScheduleClick,
  onPublish,
  onNextStep,
}: Readonly<EditReelDialogFooterProps>) {
  const scheduleDisabled = isSubmitting || !canSchedule;
  const scheduleButton = !isNewUploadFlow ? (
    <Button
      type="button"
      variant="outline"
      disabled={scheduleDisabled}
      title={canSchedule ? undefined : "Available once this reel has been approved"}
      className="h-11 w-full min-w-0 flex-1 basis-0 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9] disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onScheduleClick}
    >
      Schedule for Later
    </Button>
  ) : null;

  const saveDraftDisabled = isSubmitting || !canSaveDraft;
  const saveDraftButton = (
    <Button
      type="button"
      variant="outline"
      disabled={saveDraftDisabled}
      title={canSaveDraft ? undefined : "Not available once a reel has been approved"}
      className="h-11 w-full min-w-0 flex-1 basis-0 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9] disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onSaveDraft}
    >
      Save as Draft
    </Button>
  );

  return (
    <div className="flex w-full flex-col gap-3 px-6 py-5 sm:flex-row sm:items-stretch sm:gap-3">
      {isLastStep ? (
        <>
          {saveDraftButton}
          {scheduleButton}
          <Button
            type="button"
            disabled={isSubmitting}
            className="h-11 w-full min-w-0 flex-1 basis-0 bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
            onClick={onPublish}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Submitting…
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </>
      ) : (
        <>
          {saveDraftButton}
          {scheduleButton}
          <Button
            type="button"
            disabled={isSubmitting}
            className="h-11 w-full min-w-0 flex-1 basis-0 bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
            onClick={onNextStep}
          >
            Next
          </Button>
        </>
      )}
    </div>
  );
}
