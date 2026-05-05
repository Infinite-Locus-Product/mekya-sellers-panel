import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { CmsReelIconPlus } from "../cms-reels-icons";
import { CAPTION_COLOR_OPTIONS } from "../../lib/constants";
import type { CaptionDraftState } from "../../lib/utils";

export interface EditReelCaptionsStepProps {
  captionDraft: CaptionDraftState;
  onCaptionDraftChange: (updater: (d: CaptionDraftState) => CaptionDraftState) => void;
}

export function EditReelCaptionsStep({
  captionDraft,
  onCaptionDraftChange,
}: Readonly<EditReelCaptionsStepProps>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex w-full flex-row items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-[#2A2A2A]">Add Captions</h4>
          <p className="mt-1 text-sm text-[#666666]">Add captions to your reel</p>
        </div>
        {!captionDraft.editorOpen ? (
          <Button
            type="button"
            className="h-10 shrink-0 gap-1.5 bg-[#121C2D] px-4 font-medium text-white shadow-none hover:bg-[#121C2D]/90"
            onClick={() =>
              onCaptionDraftChange((d) => ({
                ...d,
                editorOpen: true,
                text: d.text.trim() === "" ? "Enter captions" : d.text,
              }))
            }
          >
            <CmsReelIconPlus className="size-4" aria-hidden />
            Add Captions
          </Button>
        ) : null}
      </div>
      {!captionDraft.editorOpen ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="max-w-md text-sm leading-relaxed text-[#666666]">
            No captions added yet. Click &apos;Add Captions&apos; to get started.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-[#E8E9E8] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-5">
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <span className="text-xs font-medium text-[#2A2A2A]">Text</span>
                <textarea
                  value={captionDraft.text}
                  onChange={(e) => onCaptionDraftChange((d) => ({ ...d, text: e.target.value }))}
                  placeholder="Enter captions"
                  rows={6}
                  className="min-h-[140px] w-full resize-y rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#2A2A2A] placeholder:text-[#71717A] shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2A2A]/20"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#2A2A2A]">Position X (%)</span>
                  <span className="tabular-nums text-xs text-[#666666]">{captionDraft.posX}</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[captionDraft.posX]}
                  onValueChange={(v) =>
                    onCaptionDraftChange((d) => ({
                      ...d,
                      posX: v[0] ?? d.posX,
                    }))
                  }
                  aria-label="Caption horizontal position"
                />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#2A2A2A]">Font Size</span>
                  <span className="tabular-nums text-xs text-[#666666]">
                    {captionDraft.fontSize}px
                  </span>
                </div>
                <Slider
                  min={12}
                  max={48}
                  step={1}
                  value={[captionDraft.fontSize]}
                  onValueChange={(v) =>
                    onCaptionDraftChange((d) => ({
                      ...d,
                      fontSize: v[0] ?? d.fontSize,
                    }))
                  }
                  aria-label="Caption font size"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-[#2A2A2A]">Color</span>
                <div className="flex flex-wrap gap-2">
                  {CAPTION_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      aria-label={`Caption color ${opt.label}`}
                      aria-pressed={captionDraft.color === opt.value}
                      className={cn(
                        "size-8 rounded-full border-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2A2A]/30",
                        opt.value === "#FFFFFF" && "ring-1 ring-inset ring-[#D4D4D4]",
                        captionDraft.color === opt.value
                          ? "border-[#2A2A2A] ring-2 ring-[#2A2A2A]/20"
                          : "border-[#D4D4D4]"
                      )}
                      style={{ backgroundColor: opt.value }}
                      onClick={() => onCaptionDraftChange((d) => ({ ...d, color: opt.value }))}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#2A2A2A]">Position Y (%)</span>
                  <span className="tabular-nums text-xs text-[#666666]">{captionDraft.posY}</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[captionDraft.posY]}
                  onValueChange={(v) =>
                    onCaptionDraftChange((d) => ({
                      ...d,
                      posY: v[0] ?? d.posY,
                    }))
                  }
                  aria-label="Caption vertical position"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
