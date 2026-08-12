"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILTER_CONTROL_CLASS } from "../filterControlClass";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { DATE_RANGE_BRAND } from "./colors";
import type { CustomDateRangeSelectorProps, DateRangeValue } from "./types";
import { formatRangeLabel, toDateRangePayload } from "./utils";

const VIEWPORT_PADDING = 12;
const PANEL_GAP = 8;

function cloneRange(range: DateRangeValue): DateRangeValue {
  return {
    startDate: new Date(range.startDate),
    endDate: new Date(range.endDate),
  };
}

export function CustomDateRangeSelector({
  value,
  onChange,
  className,
  pickerMode = "full",
}: CustomDateRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRangeValue>(() => cloneRange(value));
  // `null` means "not measured yet" – the panel renders invisible until the
  // first useLayoutEffect pass writes a real position. Using a nullable
  // position replaces the previous `isPositioned` boolean state and avoids
  // an explicit setState in the layout effect's early-return branch.
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePanelPosition = useCallback(() => {
    const triggerEl = containerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !panelEl) return;

    const trigger = triggerEl.getBoundingClientRect();
    const panel = panelEl.getBoundingClientRect();

    let top = trigger.bottom + PANEL_GAP;
    let left = trigger.right - panel.width;

    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - panel.width - VIEWPORT_PADDING)
    );

    if (top + panel.height > window.innerHeight - VIEWPORT_PADDING) {
      const aboveTop = trigger.top - panel.height - PANEL_GAP;
      top =
        aboveTop >= VIEWPORT_PADDING
          ? aboveTop
          : Math.max(VIEWPORT_PADDING, window.innerHeight - panel.height - VIEWPORT_PADDING);
    }

    setPanelPosition({ top, left });
  }, []);

  // Reset draft when opening is handled in `handleToggleOpen` (and via the
  // useState initializer on first mount). External `value` mutations while
  // the popover is closed are picked up the next time the user opens it,
  // so a prop->state sync effect would be redundant here.

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
  }, [open, updatePanelPosition, draftRange]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleReposition = () => updatePanelPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePanelPosition]);

  const handleToggleOpen = () => {
    setOpen((prev) => {
      if (!prev) {
        // Opening: reset draft from current value and clear stale position so
        // the next layout effect pass re-measures with the current trigger rect.
        setDraftRange(cloneRange(value));
        setPanelPosition(null);
      }
      return !prev;
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleApply = () => {
    onChange(draftRange, toDateRangePayload(draftRange));
    setOpen(false);
  };

  const panel = open ? (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 max-h-[min(90dvh,calc(100dvh-2rem))] overflow-auto rounded-2xl",
        panelPosition === null && "pointer-events-none invisible"
      )}
      style={{ top: panelPosition?.top ?? 0, left: panelPosition?.left ?? 0 }}
      role="dialog"
      aria-label="Date range picker"
    >
      <CustomDateRangePicker
        value={draftRange}
        onChange={setDraftRange}
        pickerMode={pickerMode}
        onCancel={handleCancel}
        onApply={handleApply}
      />
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex cursor-pointer items-center gap-2 whitespace-nowrap transition-all",
          // Height, background and typography are shared with the channel select so the
          // two controls line up wherever they sit side by side.
          FILTER_CONTROL_CLASS,
          "hover:border-[#004B5E]/40 hover:shadow-md",
          open && "border-[#004B5E]/50"
        )}
      >
        <span>{formatRangeLabel(value)}</span>
        <ChevronDown
          className={cn("h-2.5 w-2.5 shrink-0 transition-transform", open && "rotate-180")}
          style={{ color: DATE_RANGE_BRAND }}
          aria-hidden
        />
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
}
