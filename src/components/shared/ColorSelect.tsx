"use client";

import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Display-only hex lookup for known color names (swatches are approximate).
 * The actual SELECTABLE colors for a product come from the taxonomy manifest's
 * "color" attribute (see src/lib/api/taxonomy.ts) — a name here with no manifest
 * counterpart is simply never offered as an option; a manifest color absent
 * from this table just renders without a swatch dot (see ColorSelect below). */
export const COLOR_PALETTE = [
  { label: "Assorted", value: "Assorted", hex: "#9ca3af" },
  { label: "Beige", value: "Beige", hex: "#D4C4A8" },
  { label: "Black", value: "Black", hex: "#1a1a1a" },
  { label: "Blue", value: "Blue", hex: "#2563eb" },
  { label: "Bronze", value: "Bronze", hex: "#cd7f32" },
  { label: "Brown", value: "Brown", hex: "#78350f" },
  { label: "Burgundy", value: "Burgundy", hex: "#800020" },
  { label: "Camel Brown", value: "Camel Brown", hex: "#c19a6b" },
  { label: "Champagne", value: "Champagne", hex: "#f7e7ce" },
  { label: "Charcoal", value: "Charcoal", hex: "#36454f" },
  { label: "Coffee Brown", value: "Coffee Brown", hex: "#6f4e37" },
  { label: "Copper", value: "Copper", hex: "#b87333" },
  { label: "Coral", value: "Coral", hex: "#ff7f50" },
  { label: "Cream", value: "Cream", hex: "#FFFDD0" },
  { label: "Fluorescent Green", value: "Fluorescent Green", hex: "#39ff14" },
  { label: "Gold", value: "Gold", hex: "#c9a227" },
  { label: "Green", value: "Green", hex: "#16a34a" },
  { label: "Grey", value: "Grey", hex: "#9ca3af" },
  { label: "Grey Melange", value: "Grey Melange", hex: "#a8a8a8" },
  { label: "Khaki", value: "Khaki", hex: "#c3b091" },
  { label: "Lavender", value: "Lavender", hex: "#b57edc" },
  { label: "Lime Green", value: "Lime Green", hex: "#32cd32" },
  { label: "Magenta", value: "Magenta", hex: "#ff00ff" },
  { label: "Maroon", value: "Maroon", hex: "#7f1d1d" },
  { label: "Mauve", value: "Mauve", hex: "#e0b0ff" },
  { label: "Metallic", value: "Metallic", hex: "#aaa9ad" },
  { label: "Multi", value: "Multi", hex: "#9333ea" },
  { label: "Multicolor", value: "Multicolor", hex: "#9333ea" },
  { label: "Mushroom Brown", value: "Mushroom Brown", hex: "#977961" },
  { label: "Mustard", value: "Mustard", hex: "#d4a017" },
  { label: "Navy", value: "Navy", hex: "#1e3a5f" },
  { label: "Navy Blue", value: "Navy Blue", hex: "#1e3a8a" },
  { label: "Nude", value: "Nude", hex: "#e3bc9a" },
  { label: "Off White", value: "Off White", hex: "#f5f0e8" },
  { label: "Olive", value: "Olive", hex: "#4d5d29" },
  { label: "Orange", value: "Orange", hex: "#ea580c" },
  { label: "Peach", value: "Peach", hex: "#ffcba4" },
  { label: "Pink", value: "Pink", hex: "#ec4899" },
  { label: "Purple", value: "Purple", hex: "#9333ea" },
  { label: "Red", value: "Red", hex: "#dc2626" },
  { label: "Rose", value: "Rose", hex: "#ff007f" },
  { label: "Rose Gold", value: "Rose Gold", hex: "#b76e79" },
  { label: "Rust", value: "Rust", hex: "#b7410e" },
  { label: "Sea Green", value: "Sea Green", hex: "#2e8b57" },
  { label: "Silver", value: "Silver", hex: "#c0c0c0" },
  { label: "Skin", value: "Skin", hex: "#f1c27d" },
  { label: "Steel", value: "Steel", hex: "#4682b4" },
  { label: "Tan", value: "Tan", hex: "#d2b48c" },
  { label: "Taupe", value: "Taupe", hex: "#483c32" },
  { label: "Teal", value: "Teal", hex: "#0d9488" },
  { label: "Transparent", value: "Transparent", hex: "#e5e7eb" },
  { label: "Turquoise Blue", value: "Turquoise Blue", hex: "#30d5c8" },
  { label: "Violet", value: "Violet", hex: "#8f00ff" },
  { label: "White", value: "White", hex: "#f5f5f5" },
  { label: "Yellow", value: "Yellow", hex: "#eab308" },
] as const;

const FALLBACK_SWATCH_HEX = "#9ca3af";

function ColorSwatch({ hex, className }: { hex: string; className?: string }) {
  return (
    <span
      className={cn(
        "size-5 shrink-0 rounded-full border border-black/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
        className
      )}
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  );
}

export interface ColorOption {
  label: string;
  value: string;
}

interface ColorSelectProps {
  value?: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Selectable colors — sourced from the taxonomy manifest's "color"
   * attribute values by the caller. Falls back to the static hex-lookup
   * table's names only if the manifest hasn't loaded yet. */
  options?: ColorOption[];
}

export function ColorSelect({
  value,
  placeholder,
  onChange,
  className,
  open,
  onOpenChange,
  options,
}: ColorSelectProps) {
  const colorOptions = options ?? COLOR_PALETTE.map((c) => ({ label: c.label, value: c.value }));
  return (
    <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
      <SelectTrigger
        className={cn(
          "h-9 w-full min-w-0 bg-white text-left text-foreground data-[placeholder]:text-muted-foreground",
          "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:w-full [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:items-center",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        position="popper"
        side="bottom"
        sideOffset={2}
        align="start"
        className="max-h-[min(360px,70vh)] w-[var(--radix-select-trigger-width)] min-w-[260px] rounded-lg border p-1 shadow-md"
      >
        {colorOptions.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={cn(
              "cursor-pointer rounded-md py-2.5 pl-3 pr-2",
              "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
              "[&_[data-slot=select-item-indicator]]:hidden"
            )}
          >
            <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <ColorSwatch hex={COLOR_HEX_BY_NAME[opt.value.toLowerCase()] ?? FALLBACK_SWATCH_HEX} />
                <span className="min-w-0 truncate text-left text-sm font-medium text-foreground">
                  {opt.label}
                </span>
              </span>
              <Plus
                className="size-4 shrink-0 justify-self-end text-muted-foreground"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const COLOR_HEX_BY_NAME: Record<string, string> = Object.fromEntries(
  COLOR_PALETTE.map((c) => [c.value.toLowerCase(), c.hex])
);
