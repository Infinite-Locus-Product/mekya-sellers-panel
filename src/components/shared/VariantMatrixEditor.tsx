"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Clipboard, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppSelect } from "@/components/shared/AppSelect";
import { ColorSelect } from "@/components/shared/ColorSelect";
import { cn } from "@/lib/utils";
import {
  cellKey,
  emptyCell,
  emptyColorBlock,
  hasColor,
  pasteCellIntoTargets,
  type ColorBlock,
  type MatrixCell,
  type PendingImage,
} from "@/lib/variantMatrix";

const MAX_NEW_IMAGES_PER_COLOR = 5;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPT_IMAGES = ["image/png", "image/jpeg", "image/jpg"];

export interface VariantMatrixEditorProps {
  blocks: ColorBlock[];
  onBlocksChange: (updater: (prev: ColorBlock[]) => ColorBlock[]) => void;
  colorOptions: { label: string; value: string }[];
  sizeOptions: string[];
  channels: "b2c" | "b2b" | "both";
  mrp: string;
  /** Removing a variant that's soft-deleted (published) vs hard-deleted
   * (draft) reads very differently to a seller — the confirm dialog copy
   * must match the backend's actual behavior, never imply the wrong one. */
  isPublished: boolean;
}

type PendingRemoval = { kind: "color"; color: string } | { kind: "size"; color: string; size: string };

export function VariantMatrixEditor({
  blocks,
  onBlocksChange,
  colorOptions,
  sizeOptions,
  channels,
  mrp,
  isPublished,
}: Readonly<VariantMatrixEditorProps>) {
  const [activeColorSelection, setActiveColorSelection] = useState<string | undefined>(undefined);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [addSizeFor, setAddSizeFor] = useState<Record<string, string | undefined>>({});
  const [clipboard, setClipboard] = useState<MatrixCell | null>(null);
  const [pasteTargets, setPasteTargets] = useState<Set<string>>(new Set());
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);

  const addColor = (color: string) => {
    setActiveColorSelection(color);
    if (hasColor(blocks, color)) {
      toast.error("Color already added.");
      setIsColorDropdownOpen(false);
      setActiveColorSelection(undefined);
      return;
    }
    onBlocksChange((prev) => [...prev, emptyColorBlock(color)]);
    setIsColorDropdownOpen(false);
    setActiveColorSelection(undefined);
  };

  const confirmRemoveColor = (color: string) => {
    onBlocksChange((prev) => prev.filter((b) => b.color !== color));
    setPasteTargets((prev) => {
      const next = new Set(prev);
      for (const key of next) if (key.startsWith(`${color}::`)) next.delete(key);
      return next;
    });
    setPendingRemoval(null);
  };

  const confirmRemoveSize = (color: string, size: string) => {
    onBlocksChange((prev) =>
      prev.map((b) => {
        if (b.color !== color) return b;
        const nextCells = { ...b.cells };
        delete nextCells[size];
        return { ...b, sizes: b.sizes.filter((s) => s !== size), cells: nextCells };
      }),
    );
    setPasteTargets((prev) => {
      const next = new Set(prev);
      next.delete(cellKey(color, size));
      return next;
    });
    setPendingRemoval(null);
  };

  const addSizeToColor = (color: string, size: string) => {
    onBlocksChange((prev) =>
      prev.map((b) =>
        b.color === color && !b.sizes.includes(size)
          ? { ...b, sizes: [...b.sizes, size], cells: { ...b.cells, [size]: emptyCell() } }
          : b,
      ),
    );
    setAddSizeFor((prev) => ({ ...prev, [color]: undefined }));
  };

  const updateCell = (color: string, size: string, patch: Partial<MatrixCell>) => {
    onBlocksChange((prev) =>
      prev.map((b) =>
        b.color === color
          ? { ...b, cells: { ...b.cells, [size]: { ...(b.cells[size] ?? emptyCell()), ...patch } } }
          : b,
      ),
    );
  };

  const togglePasteTarget = (color: string, size: string) => {
    setPasteTargets((prev) => {
      const next = new Set(prev);
      const key = cellKey(color, size);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyCell = (color: string, size: string, cell: MatrixCell) => {
    setClipboard(cell);
    setPasteTargets((prev) => {
      const next = new Set(prev);
      next.delete(cellKey(color, size));
      return next;
    });
  };

  const pasteToTargets = () => {
    if (!clipboard || pasteTargets.size === 0) return;
    onBlocksChange((prev) => pasteCellIntoTargets(prev, clipboard, pasteTargets));
    setPasteTargets(new Set());
  };

  const addImagesToColor = (color: string, files: FileList | File[]) => {
    const list = Array.from(files);
    onBlocksChange((prev) =>
      prev.map((b) => {
        if (b.color !== color) return b;
        const remaining = MAX_NEW_IMAGES_PER_COLOR - b.newImages.length;
        if (remaining <= 0) {
          toast.error(`Maximum ${MAX_NEW_IMAGES_PER_COLOR} new images per color.`);
          return b;
        }
        const toAdd: PendingImage[] = [];
        for (const file of list.slice(0, remaining)) {
          if (!ACCEPT_IMAGES.includes(file.type)) {
            toast.error(`${file.name}: Only JPG/PNG formats supported.`);
            continue;
          }
          if (file.size > MAX_IMAGE_BYTES) {
            toast.error(`${file.name}: File exceeds 2MB size limit.`);
            continue;
          }
          toAdd.push({
            id: `${color}-${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
            url: URL.createObjectURL(file),
            file,
          });
        }
        return toAdd.length > 0 ? { ...b, newImages: [...b.newImages, ...toAdd] } : b;
      }),
    );
  };

  const removeNewImage = (color: string, id: string) => {
    onBlocksChange((prev) =>
      prev.map((b) => {
        if (b.color !== color) return b;
        const img = b.newImages.find((i) => i.id === id);
        if (img) URL.revokeObjectURL(img.url);
        return { ...b, newImages: b.newImages.filter((i) => i.id !== id) };
      }),
    );
  };

  const availableColorOptions = colorOptions.filter((c) => !hasColor(blocks, c.value));

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
        <ColorSelect
          className="w-full min-w-0"
          placeholder="Select color."
          value={activeColorSelection}
          onChange={addColor}
          open={isColorDropdownOpen}
          onOpenChange={setIsColorDropdownOpen}
          options={availableColorOptions}
        />
        <Button
          type="button"
          className="h-9 whitespace-nowrap bg-[#122130] px-3 text-xs hover:bg-[#0d1a28]"
          onClick={() => setIsColorDropdownOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add color
        </Button>
      </div>

      {clipboard && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
          <span>
            Copied — B2C {clipboard.b2c_price || "—"} / B2B {clipboard.b2b_price || "—"}. Select
            target rows, then Paste.
          </span>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={pasteTargets.size === 0}
              onClick={pasteToTargets}
            >
              <Clipboard className="mr-1 h-3 w-3" />
              Paste to {pasteTargets.size || ""} row{pasteTargets.size === 1 ? "" : "s"}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setClipboard(null)}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {blocks.length === 0 && (
        <p className="text-xs text-muted-foreground">No colors added yet.</p>
      )}

      {blocks.map((block) => {
        const availableSizesForColor = sizeOptions.filter((s) => !block.sizes.includes(s));
        const totalImages = block.existingImages.length + block.newImages.length;
        return (
          <div key={block.color} className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{block.color}</span>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                aria-label={`Remove ${block.color}`}
                onClick={() => setPendingRemoval({ kind: "color", color: block.color })}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sizes */}
            <div className="flex flex-wrap items-center gap-2">
              {block.sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {size}
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-background"
                    aria-label={`Remove size ${size} from ${block.color}`}
                    onClick={() => setPendingRemoval({ kind: "size", color: block.color, size })}
                  >
                    <span className="text-muted-foreground">×</span>
                  </button>
                </span>
              ))}
              {availableSizesForColor.length > 0 && (
                <AppSelect
                  className="h-8 w-32 bg-white text-xs"
                  placeholder="Add size"
                  value={addSizeFor[block.color]}
                  onChange={(size) => addSizeToColor(block.color, size)}
                  options={availableSizesForColor.map((s) => ({ label: s, value: s }))}
                />
              )}
            </div>

            {/* Per-size price table */}
            {block.sizes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-2 font-medium">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="pb-2 pr-3 font-medium">Size</th>
                      {channels !== "b2b" && <th className="pb-2 pr-3 font-medium">B2C Price (₹)</th>}
                      {channels !== "b2c" && <th className="pb-2 pr-3 font-medium">B2B Price (₹)</th>}
                      <th className="pb-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {block.sizes.map((size) => {
                      const cell = block.cells[size] ?? emptyCell();
                      const key = cellKey(block.color, size);
                      const exceedsB2c =
                        mrp && cell.b2c_price && parseFloat(cell.b2c_price) > parseFloat(mrp);
                      const exceedsB2b =
                        mrp && cell.b2b_price && parseFloat(cell.b2b_price) > parseFloat(mrp);
                      return (
                        <tr key={key} className="border-b last:border-0">
                          <td className="py-2 pr-2">
                            <input
                              type="checkbox"
                              checked={pasteTargets.has(key)}
                              aria-label={`Select ${block.color} ${size} as paste target`}
                              onChange={() => togglePasteTarget(block.color, size)}
                              className="h-4 w-4 rounded border-input"
                            />
                          </td>
                          <td className="py-2 pr-3 text-xs font-medium">{size}</td>
                          {channels !== "b2b" && (
                            <td className="py-2 pr-3">
                              <Input
                                inputMode="decimal"
                                placeholder="0.00"
                                value={cell.b2c_price}
                                onChange={(e) => updateCell(block.color, size, { b2c_price: e.target.value })}
                                className="h-8 w-24 bg-white"
                              />
                              {exceedsB2c && (
                                <p className="mt-1 w-24 text-[10px] leading-tight text-destructive" role="alert">
                                  Exceeds MRP
                                </p>
                              )}
                            </td>
                          )}
                          {channels !== "b2c" && (
                            <td className="py-2 pr-3">
                              <Input
                                inputMode="decimal"
                                placeholder="0.00"
                                value={cell.b2b_price}
                                onChange={(e) => updateCell(block.color, size, { b2b_price: e.target.value })}
                                className="h-8 w-24 bg-white"
                              />
                              {exceedsB2b && (
                                <p className="mt-1 w-24 text-[10px] leading-tight text-destructive" role="alert">
                                  Exceeds MRP
                                </p>
                              )}
                            </td>
                          )}
                          <td className="py-2">
                            <button
                              type="button"
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Copy ${block.color} ${size}`}
                              onClick={() => copyCell(block.color, size, cell)}
                              title="Copy this row's prices"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Images — this color's own, never shared with other colors */}
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">
                Images ({totalImages} total — {block.newImages.length}/{MAX_NEW_IMAGES_PER_COLOR} new this session)
              </p>
              <div className="flex flex-wrap gap-2">
                {block.existingImages.map((img) => (
                  <div key={img.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {block.newImages.map((img) => (
                  <div key={img.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white"
                      aria-label="Remove image"
                      onClick={() => removeNewImage(block.color, img.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {block.newImages.length < MAX_NEW_IMAGES_PER_COLOR && (
                  <ColorImagePicker color={block.color} onFilesAdded={(files) => addImagesToColor(block.color, files)} />
                )}
              </div>
              {block.existingImages.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Existing images can&apos;t be removed here — add new ones above instead.
                </p>
              )}
            </div>
          </div>
        );
      })}

      <Dialog open={pendingRemoval !== null} onOpenChange={(open) => !open && setPendingRemoval(null)}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              {pendingRemoval?.kind === "color"
                ? `Remove ${pendingRemoval.color}?`
                : `Remove size ${pendingRemoval?.size} from ${pendingRemoval?.color}?`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPublished
                ? "This product is published — the affected variant(s) will be set to zero stock and hidden from buyers, not deleted. Existing order history is preserved."
                : "This product is a draft — the affected variant(s) will be permanently deleted."}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPendingRemoval(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => {
                  if (!pendingRemoval) return;
                  if (pendingRemoval.kind === "color") confirmRemoveColor(pendingRemoval.color);
                  else confirmRemoveSize(pendingRemoval.color, pendingRemoval.size);
                }}
              >
                {isPublished ? "Zero stock & hide" : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColorImagePicker({
  color,
  onFilesAdded,
}: Readonly<{ color: string; onFilesAdded: (files: FileList) => void }>) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) onFilesAdded(e.target.files);
          e.target.value = "";
        }}
        aria-label={`Add images for ${color}`}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md border-2 border-dashed",
          "border-muted-foreground/30 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        )}
        aria-label={`Add image to ${color}`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </>
  );
}
