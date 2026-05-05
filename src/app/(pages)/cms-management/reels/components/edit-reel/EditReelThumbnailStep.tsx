import { cn } from "@/lib/utils";
import { REEL_THUMBNAIL_FRAME_SAMPLES } from "../../lib/constants";

export interface EditReelThumbnailStepProps {
  selectedThumbnailFrameIndex: number;
  onSelectFrame: (index: number) => void;
}

export function EditReelThumbnailStep({
  selectedThumbnailFrameIndex,
  onSelectFrame,
}: Readonly<EditReelThumbnailStepProps>) {
  return (
    <div className="flex flex-col">
      <h4 className="text-base font-bold text-[#2A2A2A]">Thumbnail Suggestion</h4>
      <p className="mt-1 text-sm text-[#666666]">
        Select the best frame to use as your reel thumbnail
      </p>
      <ul
        className="mt-6 flex list-none gap-3 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Suggested thumbnail frames"
      >
        {REEL_THUMBNAIL_FRAME_SAMPLES.map((src, index) => (
          <li key={src} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelectFrame(index)}
              className={cn(
                "relative block overflow-hidden rounded-md outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#2A2A2A] focus-visible:ring-offset-2",
                selectedThumbnailFrameIndex === index
                  ? "ring-2 ring-[#004C5E] ring-offset-2"
                  : "ring-1 ring-[#E8E9E8] hover:ring-[#D4D4D4]"
              )}
              aria-pressed={selectedThumbnailFrameIndex === index}
              aria-label={`Thumbnail option ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static samples from /public */}
              <img
                src={src}
                alt=""
                className="aspect-[9/16] h-[140px] w-auto object-cover sm:h-[160px]"
                draggable={false}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
