"use client";

import { useState } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaggedProduct } from "./EditReelTagProductsStep";

export interface EditReelPreviewAsideProps {
  durationSeconds: number;
  taggedProducts?: TaggedProduct[];
  videoSrc?: string | null;
}

export function EditReelPreviewAside({
  durationSeconds,
  taggedProducts = [],
  videoSrc,
}: Readonly<EditReelPreviewAsideProps>) {
  const [trayOpen, setTrayOpen] = useState(false);

  return (
    <aside className="flex flex-col border-b border-[#E8E9E8] bg-[#F5F5F5] px-6 py-6 md:border-b-0 md:border-r md:border-[#E8E9E8]">
      <p className="text-xs font-medium text-[#666666]">Reel Preview</p>
      <div className="relative mx-auto mt-3 aspect-[9/16] w-full max-w-[180px] shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] ring-1 ring-[#E8E9E8] shadow-inner">
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            aria-label="Reel preview video"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#71717A]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.71973 16.9502V9.0498L16.5596 13L9.71973 16.9502Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-[10px]">No preview</span>
          </div>
        )}

        {/* Shopping bag toggle — only when products are tagged */}
        {taggedProducts.length > 0 && !trayOpen ? (
          <button
            type="button"
            aria-label="Show tagged products"
            onClick={() => setTrayOpen(true)}
            className="absolute bottom-3 right-2.5 z-20 flex size-8 items-center justify-center rounded-full border border-[#E8E9E8] bg-white/95 shadow-md backdrop-blur-sm transition-transform hover:scale-105"
          >
            <ShoppingBag className="size-3.5 text-[#2A2A2A]" aria-hidden />
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border border-white bg-[#EF4444] text-[9px] font-bold text-white">
              {taggedProducts.length}
            </span>
          </button>
        ) : null}

        {/* Slide-up product tray */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1.5 bg-gradient-to-t from-black/85 to-transparent pb-2.5 pt-6 transition-all duration-300",
            trayOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
          )}
        >
          {/* Tray header */}
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-semibold text-white drop-shadow">
              Shop this reel
            </span>
            <button
              type="button"
              aria-label="Close product tray"
              onClick={() => setTrayOpen(false)}
              className="rounded-full bg-black/40 p-1 text-white backdrop-blur transition-colors hover:bg-black/60"
            >
              <ChevronDown className="size-3" aria-hidden />
            </button>
          </div>

          {/* Horizontal product cards */}
          <div className="flex gap-2 overflow-x-auto px-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {taggedProducts.map((product) => (
              <div
                key={product.id}
                className="flex w-[90px] shrink-0 flex-col overflow-hidden rounded-md bg-white shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt=""
                  className="h-[80px] w-full object-cover"
                />
                <div className="flex flex-col gap-1 p-1.5">
                  <span className="line-clamp-2 text-[8px] leading-tight text-[#2A2A2A]">
                    {product.name}
                  </span>
                  <span className="text-[9px] text-[#666666]">{product.sku}</span>
                  <button
                    type="button"
                    className="mt-0.5 w-full rounded bg-[#121C2D] py-0.5 text-[8px] font-medium text-white transition-colors hover:bg-[#121C2D]/80"
                  >
                    Quick add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-[#666666]">
        Duration : {durationSeconds} Seconds
      </p>
    </aside>
  );
}
