import { DESCRIPTION_MAX_CHARS } from "../../lib/constants";

export interface EditReelDescriptionStepProps {
  reelDescription: string;
  onReelDescriptionChange: (value: string) => void;
}

export function EditReelDescriptionStep({
  reelDescription,
  onReelDescriptionChange,
}: Readonly<EditReelDescriptionStepProps>) {
  return (
    <div className="flex flex-col">
      <h4 className="text-base font-bold text-[#2A2A2A]">Add Description</h4>
      <p className="mt-1 text-sm text-[#666666]">Add description for your reel</p>
      <div className="mt-6 rounded-xl border border-[#E8E9E8] bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#2A2A2A]">Text</span>
          <span className="tabular-nums text-xs text-[#666666]">
            {reelDescription.length}/{DESCRIPTION_MAX_CHARS} characters
          </span>
        </div>
        <textarea
          value={reelDescription}
          onChange={(e) => onReelDescriptionChange(e.target.value.slice(0, DESCRIPTION_MAX_CHARS))}
          placeholder="Enter description"
          rows={8}
          className="min-h-[180px] w-full resize-y rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#2A2A2A] placeholder:text-[#71717A] shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2A2A]/20"
          aria-label="Reel description"
        />
      </div>
    </div>
  );
}
