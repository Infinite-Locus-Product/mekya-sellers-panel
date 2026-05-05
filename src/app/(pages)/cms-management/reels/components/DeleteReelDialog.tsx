import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CmsReelIconAlertTriangle } from "./cms-reels-icons";

export interface DeleteReelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteReelDialog({
  open,
  onOpenChange,
  onConfirm,
}: Readonly<DeleteReelDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(calc(100vw-1.5rem),400px)] rounded-xl border border-[#E8E9E8] bg-white px-6 pb-6 pt-9 text-center shadow-[0_10px_40px_-10px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col items-center">
          <div
            className="mb-4 flex size-[72px] items-center justify-center rounded-full bg-[#991B1B]/10"
            aria-hidden
          >
            <CmsReelIconAlertTriangle className="size-11 text-[#991B1B]" />
          </div>
          <h3 className="px-1 text-base font-bold leading-snug text-[#2A2A2A] min-[1920px]:text-lg">
            Are you sure you want to delete this reel?
          </h3>
          <p className="mt-2 text-sm text-[#71717A]">This action cannot be undone</p>
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 border-[#2A2A2A] bg-white font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
              onClick={onConfirm}
            >
              Yes! Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
