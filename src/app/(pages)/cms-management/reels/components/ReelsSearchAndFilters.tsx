"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { Calendar, Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatusFilter } from "../lib/constants";
import { isoToDdMmYyyy, parseDdMmYyyyToIso } from "../lib/utils";
import { CmsReelIconClose } from "./cms-reels-icons";

type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void };

function FilterDateField({
  value,
  onChange,
  ariaLabel,
}: Readonly<{
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}>) {
  const nativeRef = useRef<DateInputWithPicker>(null);

  const parsed = parseDdMmYyyyToIso(value);
  const nativeValue = parsed.ok && parsed.iso ? parsed.iso : "";

  const openNativePicker = () => {
    const el = nativeRef.current;
    if (!el) return;
    if (nativeValue) {
      el.value = nativeValue;
    }
    try {
      if (typeof el.showPicker === "function") {
        el.showPicker();
        return;
      }
    } catch {
      /* showPicker can throw if not user-gesture or unsupported */
    }
    el.focus();
  };

  const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(isoToDdMmYyyy(e.target.value));
  };

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] pr-10 text-sm text-[#2A2A2A] placeholder:text-[#71717A] shadow-none min-[1920px]:h-11"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={openNativePicker}
        className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[#71717A] outline-none transition-colors hover:bg-[#004C5E]/10 hover:text-[#2A2A2A] focus-visible:ring-2 focus-visible:ring-[#004C5E]/25 focus-visible:ring-offset-1"
        aria-label={`${ariaLabel} — open calendar`}
      >
        <Calendar className="pointer-events-none size-4 shrink-0" aria-hidden />
      </button>
      <input
        ref={nativeRef}
        type="date"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleNativeChange}
      />
    </div>
  );
}

export interface ReelsSearchAndFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
  draftStatus: StatusFilter;
  onDraftStatusChange: (value: StatusFilter) => void;
  draftDateFromStr: string;
  onDraftDateFromStrChange: (value: string) => void;
  draftDateToStr: string;
  onDraftDateToStrChange: (value: string) => void;
  onResetDraftOnly: () => void;
  onApplyFilters: () => void;
}

export function ReelsSearchAndFilters({
  query,
  onQueryChange,
  filterOpen,
  onFilterOpenChange,
  hasActiveFilters,
  onClearAllFilters,
  draftStatus,
  onDraftStatusChange,
  draftDateFromStr,
  onDraftDateFromStrChange,
  draftDateToStr,
  onDraftDateToStrChange,
  onResetDraftOnly,
  onApplyFilters,
}: Readonly<ReelsSearchAndFiltersProps>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717A]"
          aria-hidden
        />
        <Input
          placeholder="Search reels by title"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-9 border-[#E8E9E8] bg-[#E8E9E8] pl-9 text-sm text-[#2A2A2A] placeholder:text-[#71717A] min-[1920px]:h-10"
          aria-label="Search reels by title"
        />
      </div>
      <Popover open={filterOpen} onOpenChange={onFilterOpenChange}>
        <div className="flex h-9 shrink-0 items-stretch overflow-hidden rounded-md border border-[#E8E9E8] bg-[#E8E9E8] min-[1920px]:h-10">
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-2 px-3 text-sm font-medium text-[#2A2A2A] outline-none transition-colors hover:bg-[#004C5E]/5 focus-visible:ring-2 focus-visible:ring-[#004C5E]/25 focus-visible:ring-offset-2 min-[1920px]:px-4 min-[1920px]:text-base"
              aria-expanded={filterOpen}
              aria-haspopup="dialog"
            >
              <Filter className="size-4 shrink-0 text-[#71717A]" aria-hidden />
              Filters
            </button>
          </PopoverTrigger>
          {(filterOpen || hasActiveFilters) && (
            <button
              type="button"
              className="flex items-center border-l border-[#E8E9E8] px-2 text-[#71717A] transition-colors hover:bg-[#004C5E]/5 hover:text-[#2A2A2A]"
              aria-label="Clear filters"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClearAllFilters();
              }}
            >
              <CmsReelIconClose className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <PopoverContent
          className="w-[min(calc(100vw-2rem),380px)] space-y-5 rounded-xl border border-[#E8E9E8] bg-white p-5 text-[#2A2A2A] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.15)] min-[1920px]:box-border min-[1920px]:h-[362px] min-[1920px]:w-[315px] min-[1920px]:max-w-[315px] min-[1920px]:rounded-[5px] min-[1920px]:overflow-y-auto"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#E8E9E8] pb-4">
            <div className="flex items-center gap-2 text-base font-bold tracking-tight text-[#2A2A2A]">
              <Filter className="size-[18px] shrink-0 stroke-[2.25] text-[#2A2A2A]" aria-hidden />
              Filters
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-normal text-[#71717A] underline decoration-[#D4D4D4] underline-offset-[3px] transition-colors hover:text-[#2A2A2A]"
              onClick={onResetDraftOnly}
            >
              <RotateCcw className="size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
              Reset
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#2A2A2A]">Status</span>
            <Select value={draftStatus} onValueChange={(v) => onDraftStatusChange(v as StatusFilter)}>
              <SelectTrigger
                className={cn(
                  "h-10 w-full rounded-lg border border-[#E8E9E8] bg-[#F3F4F6] px-3 text-left text-sm shadow-none hover:bg-[#F3F4F6] min-[1920px]:h-11",
                  draftStatus === "all" ? "text-[#71717A]" : "text-[#2A2A2A]"
                )}
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="rounded-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-[#666666]">Date Range</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#2A2A2A]">From</span>
                <FilterDateField
                  value={draftDateFromStr}
                  onChange={onDraftDateFromStrChange}
                  ariaLabel="From date"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#2A2A2A]">To</span>
                <FilterDateField
                  value={draftDateToStr}
                  onChange={onDraftDateToStrChange}
                  ariaLabel="To date"
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            className="h-11 w-full rounded-lg bg-[#121C2D] font-semibold text-white shadow-none hover:bg-[#121C2D]/90"
            onClick={onApplyFilters}
          >
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
