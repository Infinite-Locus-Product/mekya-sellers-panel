import { CMS_DUMMY_REEL_VIDEO_SRC } from "../../lib/constants";
import type { CaptionDraftState } from "../../lib/utils";

export interface EditReelPreviewAsideProps {
  durationSeconds: number;
  showCaptionOnReelPreview: boolean;
  captionDraft: CaptionDraftState;
}

export function EditReelPreviewAside({
  durationSeconds,
  showCaptionOnReelPreview,
  captionDraft,
}: Readonly<EditReelPreviewAsideProps>) {
  return (
    <aside className="flex flex-col border-b border-[#E8E9E8] bg-[#F5F5F5] px-6 py-6 md:border-b-0 md:border-r md:border-[#E8E9E8]">
      <p className="text-xs font-medium text-[#666666]">Reel Preview</p>
      <div className="relative mx-auto mt-3 aspect-[9/16] w-full max-w-[180px] shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] ring-1 ring-[#E8E9E8] shadow-inner">
        <video
          src={CMS_DUMMY_REEL_VIDEO_SRC}
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
          aria-label="Reel preview video"
        />
        {showCaptionOnReelPreview ? (
          <div
            className="pointer-events-none absolute z-10 max-w-[calc(100%-12px)] whitespace-pre-wrap break-words text-center font-medium leading-snug"
            style={{
              left: `${captionDraft.posX}%`,
              top: `${captionDraft.posY}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${captionDraft.fontSize}px`,
              color: captionDraft.color,
              textShadow:
                captionDraft.color === "#FFFFFF" || captionDraft.color === "#EAB308"
                  ? "0 1px 3px rgba(0,0,0,0.95)"
                  : captionDraft.color === "#000000"
                    ? "0 1px 2px rgba(255,255,255,0.35)"
                    : "0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            {captionDraft.text}
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-center text-xs text-[#666666]">
        Duration : {durationSeconds} Seconds
      </p>
    </aside>
  );
}
