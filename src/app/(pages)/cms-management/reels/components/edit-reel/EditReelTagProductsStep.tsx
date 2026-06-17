"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Loader2, Search, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getSellerProducts, type ReelAudience, type SellerProduct } from "@/lib/api/reels";
import { DESCRIPTION_MAX_CHARS, MAX_TAGGED_PRODUCTS } from "../../lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TaggedProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface EditReelTagProductsStepProps {
  reelTitle: string;
  onReelTitleChange: (value: string) => void;
  reelDescription: string;
  onReelDescriptionChange: (value: string) => void;
  reelAudience: ReelAudience;
  onReelAudienceChange: (value: ReelAudience) => void;
  audienceLocked: boolean;
  taggedProducts: TaggedProduct[];
  onTaggedProductsChange: (products: TaggedProduct[]) => void;
}

export function EditReelTagProductsStep({
  reelTitle,
  onReelTitleChange,
  reelDescription,
  onReelDescriptionChange,
  reelAudience,
  onReelAudienceChange,
  audienceLocked,
  taggedProducts,
  onTaggedProductsChange,
}: Readonly<EditReelTagProductsStepProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SellerProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const taggedIds = new Set(taggedProducts.map((p) => p.id));
  const atMax = taggedProducts.length >= MAX_TAGGED_PRODUCTS;

  // Debounced product search against the real API
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      getSellerProducts({
        search: q,
        channel: reelAudience === "both" ? "all" : reelAudience,
        limit: 10,
      })
        .then((res) => setSearchResults(res.products))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery, reelAudience]);

  const addProduct = (product: SellerProduct) => {
    if (taggedIds.has(product.product_id) || atMax) return;
    onTaggedProductsChange([
      ...taggedProducts,
      { id: product.product_id, name: product.name, sku: product.sku, imageUrl: product.thumbnail_url ?? "" },
    ]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeProduct = (id: string) => {
    onTaggedProductsChange(taggedProducts.filter((p) => p.id !== id));
  };

  const PLATFORM_OPTIONS: { label: string; value: ReelAudience }[] = [
    { label: "B2C Only", value: "b2c" },
    { label: "B2B Only", value: "b2b" },
    { label: "Both", value: "both" },
  ];

  return (
    <div className="flex flex-col gap-5 overflow-y-auto">
      <div>
        <h3 className="text-base font-bold text-[#2A2A2A]">Tag Products</h3>
        <p className="mt-0.5 text-sm text-[#666666]">
          Select products to make your reel shoppable.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#2A2A2A]">
          Reel Title <span className="text-[#EF4444]">*</span>
        </label>
        <Input
          value={reelTitle}
          onChange={(e) => onReelTitleChange(e.target.value)}
          placeholder="Enter reel title"
          maxLength={200}
          className="h-10 rounded-lg border-[#E8E9E8] bg-[#F3F4F6] text-sm text-[#2A2A2A] shadow-none placeholder:text-[#71717A] focus-visible:ring-[#2A2A2A]/20"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#2A2A2A]">Description</label>
          <span className="text-xs tabular-nums text-[#666666]">
            {reelDescription.length}/{DESCRIPTION_MAX_CHARS}
          </span>
        </div>
        <textarea
          value={reelDescription}
          onChange={(e) =>
            onReelDescriptionChange(e.target.value.slice(0, DESCRIPTION_MAX_CHARS))
          }
          placeholder="Describe your reel"
          rows={3}
          className="w-full resize-none rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 py-2.5 text-sm text-[#2A2A2A] placeholder:text-[#71717A] shadow-none focus:outline-none focus:ring-2 focus:ring-[#2A2A2A]/20"
        />
      </div>

      {/* Target Platform */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2A2A2A]">Target Platform</label>
        <div className="flex flex-wrap gap-5">
          {PLATFORM_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-2",
                audienceLocked && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="reel-platform"
                value={opt.value}
                checked={reelAudience === opt.value}
                disabled={audienceLocked}
                onChange={() => onReelAudienceChange(opt.value)}
                className="size-4 accent-[#121C2D]"
              />
              <span className="text-sm text-[#2A2A2A]">{opt.label}</span>
            </label>
          ))}
        </div>
        {audienceLocked && (
          <p className="text-xs text-[#EF4444]">
            Audience cannot be changed after the reel leaves pending.
          </p>
        )}
      </div>

      {/* Search Catalog */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2A2A2A]">Search Catalog</label>
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717A]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search by Product Name or SKU…"
              disabled={atMax}
              className="h-10 rounded-lg border-[#E8E9E8] bg-[#F3F4F6] pl-9 pr-9 text-sm text-[#2A2A2A] shadow-none placeholder:text-[#71717A] focus-visible:ring-[#2A2A2A]/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#2A2A2A]"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchFocused && searchQuery.trim() && (
            <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-[#E8E9E8] bg-white shadow-lg">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-[#666666]">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Searching…
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-[#71717A]">No products found</div>
              ) : (
                searchResults.map((product) => {
                  const isTagged = taggedIds.has(product.product_id);
                  return (
                    <button
                      key={product.product_id}
                      type="button"
                      disabled={isTagged || atMax}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addProduct(product)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        isTagged
                          ? "cursor-default bg-[#F9FAF9] opacity-60"
                          : atMax
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-[#F3F4F6]",
                      )}
                    >
                      {product.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.thumbnail_url}
                          alt=""
                          className="size-9 shrink-0 rounded border border-[#E8E9E8] object-cover"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded border border-[#E8E9E8] bg-[#F3F4F6]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#71717A" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="#71717A" strokeWidth="1.5" />
                            <path d="M3 15L8 10L12 14L16 10L21 15" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#2A2A2A]">{product.name}</p>
                        <p className="text-xs text-[#666666]">{product.sku}</p>
                      </div>
                      {isTagged ? (
                        <span className="shrink-0 rounded-full bg-[#DBFCE7] px-2 py-0.5 text-[10px] font-medium text-[#016630]">
                          Added
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs font-medium text-[#004C5E]">+ Add</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
        {atMax && (
          <p className="text-xs text-[#EF4444]">
            Maximum {MAX_TAGGED_PRODUCTS} products can be tagged per reel.
          </p>
        )}
      </div>

      {/* Tagged Products Tray */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-[#E8E9E8]">
        <div className="flex items-center justify-between bg-[#F9FAF9] px-4 py-2.5 border-b border-[#E8E9E8]">
          <span className="text-sm font-medium text-[#2A2A2A]">Tagged Products</span>
          <span className="text-xs text-[#666666]">
            {taggedProducts.length}/{MAX_TAGGED_PRODUCTS} Added
          </span>
        </div>

        {taggedProducts.length === 0 ? (
          <div className="flex min-h-[80px] items-center justify-center px-4 py-6">
            <p className="text-center text-sm text-[#71717A]">
              No products tagged yet. Search above to add products.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto p-3" style={{ maxHeight: 180 }}>
            {taggedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border border-[#E8E9E8] bg-white p-2 transition-colors hover:bg-[#F9FAF9]"
              >
                <GripVertical className="size-5 shrink-0 cursor-grab text-[#C4C4C4] hover:text-[#71717A]" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt=""
                  className="size-10 shrink-0 rounded border border-[#E8E9E8] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2A2A2A]">{product.name}</p>
                  <p className="text-xs text-[#666666]">{product.sku}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${product.name}`}
                  onClick={() => removeProduct(product.id)}
                  className="shrink-0 rounded-md p-1.5 text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
