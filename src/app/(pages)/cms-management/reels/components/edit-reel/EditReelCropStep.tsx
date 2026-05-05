import { Slider } from "@/components/ui/slider";
import { parseDurationToSeconds } from "../../lib/utils";

export interface EditReelCropStepProps {
  durationLabel: string;
  cropRange: [number, number];
  onCropRangeChange: (range: [number, number]) => void;
}

export function EditReelCropStep({
  durationLabel,
  cropRange,
  onCropRangeChange,
}: Readonly<EditReelCropStepProps>) {
  const maxSec = Math.max(1, parseDurationToSeconds(durationLabel));
  const totalSec = parseDurationToSeconds(durationLabel);

  return (
    <div className="flex flex-col">
      <h4 className="text-base font-bold text-[#2A2A2A]">Crop Reel Length</h4>
      <p className="mt-1 text-sm text-[#666666]">
        Adjust the start and end points to highlight key moments (15-60 seconds)
      </p>
      <div className="mt-6">
        <Slider
          min={0}
          max={maxSec}
          step={1}
          minStepsBetweenThumbs={1}
          value={cropRange}
          onValueChange={(v) => onCropRangeChange(v as [number, number])}
          className="py-2"
          aria-label="Crop start and end"
        />
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#666666]">
          <span className="text-left tabular-nums">Start : {cropRange[0]} sec</span>
          <span className="text-center tabular-nums">End : {cropRange[1]} sec</span>
          <span className="text-right tabular-nums">Duration : {totalSec} sec</span>
        </div>
      </div>
    </div>
  );
}
