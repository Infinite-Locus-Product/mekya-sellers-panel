import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EditReelDialogFooterProps {
  editStep: number;
  isSubmitting?: boolean;
  onSaveDraft: () => void;
  onScheduleClick: () => void;
  onPublish: () => void;
  onNextStep: () => void;
}

export function EditReelDialogFooter({
  editStep,
  isSubmitting = false,
  onSaveDraft,
  onScheduleClick,
  onPublish,
  onNextStep,
}: Readonly<EditReelDialogFooterProps>) {
  return (
    <div className="flex w-full flex-col gap-3 px-6 py-5 sm:flex-row sm:items-stretch sm:gap-3">
      {editStep === 3 ? (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 w-full min-w-0 flex-1 basis-0 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
            onClick={onSaveDraft}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Save as Draft"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 w-full min-w-0 flex-1 basis-0 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
            onClick={onScheduleClick}
          >
            Schedule for Later
          </Button>
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
              "Publish Reel"
            )}
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 w-full min-w-0 flex-1 basis-0 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
            onClick={onSaveDraft}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 w-full min-w-0 flex-1 basis-0 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
            onClick={onScheduleClick}
          >
            Schedule for Later
          </Button>
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
