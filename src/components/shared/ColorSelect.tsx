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
  { label: "Beige", value: "Beige", hex: "#D4C4A8" },
  { label: "Black", value: "Black", hex: "#1a1a1a" },
  { label: "Blue", value: "Blue", hex: "#2563eb" },
  { label: "Brown", value: "Brown", hex: "#78350f" },
  { label: "Cream", value: "Cream", hex: "#FFFDD0" },
  { label: "Gold", value: "Gold", hex: "#c9a227" },
  { label: "Green", value: "Green", hex: "#16a34a" },
  { label: "Grey", value: "Grey", hex: "#9ca3af" },
  { label: "Maroon", value: "Maroon", hex: "#7f1d1d" },
  { label: "Multicolor", value: "Multicolor", hex: "#9333ea" },
  { label: "Navy", value: "Navy", hex: "#1e3a5f" },
  { label: "Olive", value: "Olive", hex: "#4d5d29" },
  { label: "Orange", value: "Orange", hex: "#ea580c" },
  { label: "Pink", value: "Pink", hex: "#ec4899" },
  { label: "Purple", value: "Purple", hex: "#9333ea" },
  { label: "Red", value: "Red", hex: "#dc2626" },
  { label: "Silver", value: "Silver", hex: "#c0c0c0" },
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
