import { useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EditReelThumbnailStepProps {
  thumbnailUrl: string | null;
  isUploadingThumbnail: boolean;
  onThumbnailFileSelected: (file: File) => void;
}

export function EditReelThumbnailStep({
  thumbnailUrl,
  isUploadingThumbnail,
  onThumbnailFileSelected,
}: Readonly<EditReelThumbnailStepProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="text-base font-bold text-[#2A2A2A]">Thumbnail</h4>
        <p className="mt-1 text-sm text-[#666666]">
          Upload a thumbnail image for your reel
        </p>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border border-[#E8E9E8] bg-white p-4 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          aria-label="Choose thumbnail image"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onThumbnailFileSelected(file);
            e.target.value = "";
          }}
        />

        {thumbnailUrl ? (
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt="Uploaded thumbnail"
              className="aspect-[9/16] h-[100px] w-auto shrink-0 rounded-md object-cover ring-2 ring-[#004C5E] ring-offset-2"
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-[#2A2A2A]">Thumbnail uploaded</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingThumbnail}
                className="h-8 border-[#2A2A2A] bg-white text-xs font-medium text-[#2A2A2A] shadow-none hover:bg-[#F9FAF9]"
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploadingThumbnail}
            className="flex min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#D4D4D4] bg-white px-4 py-6 text-center transition-colors hover:border-[#004C5E]/40 hover:bg-[#F9FAF9] disabled:pointer-events-none"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploadingThumbnail ? (
              <>
                <Loader2 className="size-8 animate-spin text-[#71717A]" aria-hidden />
                <span className="text-sm text-[#666666]">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="size-8 text-[#71717A]" aria-hidden />
                <span className="text-sm font-medium text-[#2A2A2A]">Upload thumbnail</span>
                <span className="text-xs text-[#666666]">JPG, PNG or WebP</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
