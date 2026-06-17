import { AppSelect } from "@/components/shared/AppSelect";
import { Input } from "@/components/ui/input";
import type { ReelAudience } from "@/lib/api/reels";
import { AUDIENCE_OPTIONS, DESCRIPTION_MAX_CHARS } from "../../lib/constants";

export interface EditReelDescriptionStepProps {
  reelTitle: string;
  onReelTitleChange: (value: string) => void;
  reelDescription: string;
  onReelDescriptionChange: (value: string) => void;
  reelAudience: ReelAudience;
  onReelAudienceChange: (value: ReelAudience) => void;
  audienceLocked: boolean;
  reelProductIds: string[];
  onReelProductIdsChange: (ids: string[]) => void;
}

export function EditReelDescriptionStep({
  reelTitle,
  onReelTitleChange,
  reelDescription,
  onReelDescriptionChange,
  reelAudience,
  onReelAudienceChange,
  audienceLocked,
  reelProductIds,
  onReelProductIdsChange,
}: Readonly<EditReelDescriptionStepProps>) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="text-base font-bold text-[#2A2A2A]">Add Description</h4>
        <p className="mt-1 text-sm text-[#666666]">Fill in the details for your reel</p>
      </div>

      <div className="space-y-4 rounded-xl border border-[#E8E9E8] bg-white p-5 shadow-sm">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#2A2A2A]">
            Title <span className="text-[#EF4444]">*</span>
          </label>
          <Input
            value={reelTitle}
            onChange={(e) => onReelTitleChange(e.target.value)}
            placeholder="Enter reel title"
            maxLength={200}
            className="h-10 rounded-lg border-[#E8E9E8] bg-[#F3F4F6] text-sm text-[#2A2A2A] shadow-none placeholder:text-[#71717A] focus-visible:ring-[#2A2A2A]/20"
          />
        </div>

        {/* Audience */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#2A2A2A]">
            Audience <span className="text-[#EF4444]">*</span>
          </label>
          {audienceLocked ? (
            <div className="flex h-10 items-center rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 text-sm text-[#71717A]">
              {AUDIENCE_OPTIONS.find((o) => o.value === reelAudience)?.label ?? reelAudience}
              <span className="ml-2 text-xs text-[#EF4444]">(locked after publish)</span>
            </div>
          ) : (
            <AppSelect
              options={AUDIENCE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
              value={reelAudience}
              onChange={(v) => onReelAudienceChange(v as ReelAudience)}
              placeholder="Select audience"
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-[#2A2A2A]">Description</label>
            <span className="tabular-nums text-xs text-[#666666]">
              {reelDescription.length}/{DESCRIPTION_MAX_CHARS}
            </span>
          </div>
          <textarea
            value={reelDescription}
            onChange={(e) =>
              onReelDescriptionChange(e.target.value.slice(0, DESCRIPTION_MAX_CHARS))
            }
            placeholder="Enter description"
            rows={6}
            className="min-h-[120px] w-full resize-y rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#2A2A2A] placeholder:text-[#71717A] shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A2A2A]/20"
            aria-label="Reel description"
          />
        </div>

        {/* Product IDs */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#2A2A2A]">
            Product IDs
            <span className="ml-1 font-normal text-[#71717A]">(optional, comma-separated)</span>
          </label>
          <Input
            value={reelProductIds.join(", ")}
            onChange={(e) => {
              const raw = e.target.value;
              const ids = raw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onReelProductIdsChange(ids);
            }}
            placeholder="e.g. UHJvZHVjdDox, UHJvZHVjdDoy"
            className="h-10 rounded-lg border-[#E8E9E8] bg-[#F3F4F6] text-sm text-[#2A2A2A] shadow-none placeholder:text-[#71717A] focus-visible:ring-[#2A2A2A]/20"
          />
        </div>
      </div>
    </div>
  );
}
