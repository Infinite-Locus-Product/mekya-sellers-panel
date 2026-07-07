"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadedImage = {
  id: string;
  url: string;
};

interface ProductImageUploadCardProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesAdded: (files: FileList | File[]) => void;
  uploadedImages: UploadedImage[];
  onRemoveImage: (id: string) => void;
  onReorder?: (newImages: UploadedImage[]) => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  maxFileSizeLabel?: string;
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  uploadAreaClassName?: string;
}

export function ProductImageUploadCard({
  fileInputRef,
  onFilesAdded,
  uploadedImages,
  onRemoveImage,
  onReorder,
  isDragging,
  setIsDragging,
  maxFileSizeLabel = "5 MB.",
  cardClassName,
  headerClassName,
  contentClassName,
  uploadAreaClassName,
}: Readonly<ProductImageUploadCardProps>) {
  const dragIndexRef = useRef<number | null>(null);

  return (
    <Card className={cn("border bg-white shadow-sm", cardClassName)}>
      <CardHeader className={cn("border-b pb-4", headerClassName)}>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8496 13.2516H6.74961V4.15156H15.8496M15.8496 2.85156H6.74961C6.40483 2.85156 6.07417 2.98853 5.83037 3.23232C5.58657 3.47612 5.44961 3.80678 5.44961 4.15156V13.2516C5.44961 13.5963 5.58657 13.927 5.83037 14.1708C6.07417 14.4146 6.40483 14.5516 6.74961 14.5516H15.8496C16.1944 14.5516 16.5251 14.4146 16.7688 14.1708C17.0126 13.927 17.1496 13.5963 17.1496 13.2516V4.15156C17.1496 3.80678 17.0126 3.47612 16.7688 3.23232C16.5251 2.98853 16.1944 2.85156 15.8496 2.85156ZM4.14961 5.45156H2.84961V15.8516C2.84961 16.1963 2.98657 16.527 3.23037 16.7708C3.47417 17.0146 3.80483 17.1516 4.14961 17.1516H14.5496V15.8516H4.14961M12.5736 8.89006L10.7861 11.1911L9.51211 9.65706L7.72461 11.9516H14.8746L12.5736 8.89006Z" fill="black" />
          </svg>

          Product Image
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4 pt-5", contentClassName)}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) onFilesAdded(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (event.dataTransfer.files?.length) onFilesAdded(event.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-[#F9FAF9] px-6 py-12 text-center transition-colors",
            isDragging && "border-foreground/50 bg-muted/30",
            uploadAreaClassName
          )}
        >
          <Upload className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">Choose a image or drag &amp; drop it here</p>
          <p className="mt-2 text-xs text-muted-foreground">Supported image formats: PNG, JPG</p>
          <p className="text-xs text-muted-foreground">Max file size: {maxFileSizeLabel}</p>
        </button>

        {uploadedImages.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {uploadedImages.length} / 5 Image{uploadedImages.length === 1 ? "" : "s"} uploaded
            </p>
            <ul className="flex flex-wrap gap-3">
              {uploadedImages.map((image, index) => (
                <li
                  key={image.id}
                  draggable={Boolean(onReorder)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border",
                    onReorder && "cursor-grab active:cursor-grabbing"
                  )}
                  onDragStart={(e) => {
                    dragIndexRef.current = index;
                    e.currentTarget.style.opacity = "0.5";
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.outline = "2px solid #122130";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.outline = "";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.outline = "";
                    const from = dragIndexRef.current;
                    dragIndexRef.current = null;
                    if (from === null || from === index) return;
                    const newOrder = [...uploadedImages];
                    const [moved] = newOrder.splice(from, 1);
                    newOrder.splice(index, 0, moved);
                    onReorder?.(newOrder);
                  }}
                >
                  <Image
                    src={image.url}
                    alt=""
                    className="h-full w-full object-cover"
                    width={80}
                    height={80}
                    unoptimized
                  />
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] font-medium leading-none text-white">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded text-destructive cursor-pointer"
                    aria-label="Remove image"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.6668 2.66667H10.3335L9.66683 2H6.3335L5.66683 2.66667H3.3335V4H12.6668M4.00016 12.6667C4.00016 13.0203 4.14064 13.3594 4.39069 13.6095C4.64074 13.8595 4.97987 14 5.3335 14H10.6668C11.0205 14 11.3596 13.8595 11.6096 13.6095C11.8597 13.3594 12.0002 13.0203 12.0002 12.6667V4.66667H4.00016V12.6667Z" fill="#FF0000" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
