"use client";

import { useCallback, useMemo, useState } from "react";
import { DateRange } from "react-date-range";
import type { Range, RangeKeyDict } from "react-date-range";
import {
  addMonths,
  endOfMonth,
  endOfYear,
  format,
  isSameDay,
  setMonth,
  setYear,
  endOfDay,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavChevron } from "./NavChevron";
import { DATE_RANGE_BRAND } from "./colors";
import type { DateRangePreset, DateRangeValue } from "./types";
import {
  FULL_PRESETS,
  getPresetRange,
  MONTH_YEAR_PRESETS,
  normalizeRange,
} from "./utils";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./calender-styles.css";

const PRESET_BUTTON_BASE =
  "text-left px-2.5 py-1.5 rounded-lg border text-[10px] transition-all w-full";
const PRESET_DEFAULT =
  "border-transparent text-black hover:border-[#E5E7EB] hover:bg-[#F3F4F6] font-medium";
const PRESET_SELECTED =
  "border-[#004B5E]/30 bg-[#E6F2F4] font-semibold text-black";

const GRID_CELL_BASE =
  "text-[11px] py-2 rounded-md border transition-all font-medium text-black";
const GRID_CELL_NORMAL =
  "border-[#E5E7EB] bg-white text-black hover:border-[#004B5E]/30 hover:bg-[#E6F2F4]";
const GRID_CELL_SELECTED =
  "border-[#004B5E] bg-[#E6F2F4] font-semibold text-black shadow-sm";
const GRID_CELL_DISABLED =
  "opacity-40 cursor-not-allowed bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E7EB]";

export interface CustomDateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  pickerMode?: "full" | "month-year-forward";
  onCancel?: () => void;
  onApply?: () => void;
}

const PANEL_CONTENT_WIDTH = "w-[240px]";

type PanelView = "calendar" | "month-grid" | "year-grid";

function isMonthInRange(
  monthIndex: number,
  year: number,
  range: DateRangeValue,
  today: Date
): boolean {
  const monthStart = startOfMonth(new Date(year, monthIndex, 1));
  let monthEnd = endOfMonth(monthStart);
  if (monthEnd > today) monthEnd = endOfDay(today);
  return (
    isSameDay(startOfDay(range.startDate), monthStart) &&
    isSameDay(startOfDay(range.endDate), startOfDay(monthEnd))
  );
}

function isYearInRange(year: number, range: DateRangeValue, today: Date): boolean {
  const yearStart = startOfYear(new Date(year, 0, 1));
  let yearEnd = endOfYear(yearStart);
  if (yearEnd > today) yearEnd = endOfDay(today);
  return (
    isSameDay(startOfDay(range.startDate), yearStart) &&
    isSameDay(startOfDay(range.endDate), startOfDay(yearEnd))
  );
}

export function CustomDateRangePicker({
  value,
  onChange,
  pickerMode = "full",
  onCancel,
  onApply,
}: CustomDateRangePickerProps) {
  const presets = pickerMode === "month-year-forward" ? MONTH_YEAR_PRESETS : FULL_PRESETS;
  const today = useMemo(() => new Date(), []);

  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("month");
  const [panelView, setPanelView] = useState<PanelView>("month-grid");
  const [calendarRange, setCalendarRange] = useState<Range>({
    startDate: value.startDate,
    endDate: value.endDate,
    key: "selection",
  });
  const [customAnchor, setCustomAnchor] = useState<Date | null>(null);
  const [shownDate, setShownDate] = useState(value.startDate);
  const [yearDecadeStart, setYearDecadeStart] = useState(() => {
    const y = new Date().getFullYear();
    return pickerMode === "month-year-forward" ? y - 9 : y - 11;
  });

  // Note: We intentionally do NOT sync `value` -> internal state via useEffect.
  // The picker mounts only while the parent panel is open (`open ? <Picker/> : null`),
  // so state is initialized fresh per open cycle from `value` via the useState
  // initializer above. While open, `updateDraftRange` already keeps the internal
  // `calendarRange`/`shownDate` in sync with the parent prior to invoking `onChange`,
  // so an effect-based prop->state sync would only cause redundant setStates and
  // violates react-hooks/set-state-in-effect.

  const updateDraftRange = useCallback(
    (range: DateRangeValue, preset: DateRangePreset) => {
      setSelectedPreset(preset);
      setCustomAnchor(null);
      setCalendarRange({
        startDate: range.startDate,
        endDate: range.endDate,
        key: "selection",
      });
      setShownDate(range.startDate);
      onChange(range);
    },
    [onChange]
  );

  const yearPageSize = pickerMode === "month-year-forward" ? 10 : 12;

  const alignYearPageToYear = useCallback(
    (year: number) => {
      const maxStart = today.getFullYear() - yearPageSize + 1;
      const centeredStart = year - Math.floor(yearPageSize / 2);
      setYearDecadeStart(Math.min(centeredStart, maxStart));
    },
    [today, yearPageSize]
  );

  const handlePresetSelect = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    setCustomAnchor(null);

    if (preset === "month") {
      setPanelView("month-grid");
      return;
    }

    if (preset === "year") {
      alignYearPageToYear(value.startDate.getFullYear());
      setPanelView("year-grid");
      return;
    }

    setPanelView("calendar");

    if (preset === "custom") {
      setShownDate(value.startDate);
      return;
    }

    updateDraftRange(getPresetRange(preset), preset);
  };

  const handleCalendarChange = (item: RangeKeyDict) => {
    const selection = item.selection;
    if (!selection.startDate || !selection.endDate) return;

    setSelectedPreset("custom");
    setPanelView("calendar");
    setCalendarRange({
      startDate: selection.startDate,
      endDate: selection.endDate,
      key: "selection",
    });

    const start = selection.startDate;
    const end = selection.endDate;

    if (!isSameDay(start, end)) {
      updateDraftRange(normalizeRange(start, end), "custom");
      return;
    }

    if (!customAnchor) {
      setCustomAnchor(start);
      return;
    }

    if (isSameDay(customAnchor, start)) {
      updateDraftRange(normalizeRange(customAnchor, start), "custom");
      return;
    }

    updateDraftRange(normalizeRange(customAnchor, start), "custom");
  };

  const handleMonthSelect = (monthIndex: number) => {
    const ref = new Date(shownDate.getFullYear(), monthIndex, 1);
    const monthStart = startOfMonth(ref);
    let monthEnd = endOfMonth(ref);
    if (monthEnd > today) monthEnd = today;
    if (monthStart > today) return;

    updateDraftRange(normalizeRange(monthStart, monthEnd), "month");
  };

  const handleYearSelect = (year: number) => {
    const ref = setYear(shownDate, year);
    const yearStart = startOfYear(ref);
    let yearEnd = endOfYear(ref);
    if (yearEnd > today) yearEnd = today;
    if (yearStart > today) return;

    updateDraftRange(normalizeRange(yearStart, yearEnd), "year");
  };

  const isApplyDisabled =
    selectedPreset === "custom" && panelView === "calendar" && customAnchor !== null;

  // Stable reference — a new `ranges={[...]}` array each render makes react-date-range
  // treat ranges as changed and reset the visible month via updateShownDate.
  const calendarRanges = useMemo(
    () => [
      {
        startDate: calendarRange.startDate,
        endDate: calendarRange.endDate,
        key: calendarRange.key ?? "selection",
      },
    ],
    [calendarRange.startDate, calendarRange.endDate, calendarRange.key]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        index,
        label: format(setMonth(new Date(2000, 0, 1), index), "MMM"),
        disabled:
          pickerMode === "month-year-forward" &&
          (shownDate.getFullYear() > today.getFullYear() ||
            (shownDate.getFullYear() === today.getFullYear() && index > today.getMonth())),
      })),
    [pickerMode, shownDate, today]
  );

  const yearPageEnd = yearDecadeStart + yearPageSize - 1;

  const years = useMemo(
    () => Array.from({ length: yearPageSize }, (_, offset) => yearDecadeStart + offset),
    [yearDecadeStart, yearPageSize]
  );

  const yearHeaderLabel = `${yearDecadeStart} – ${yearPageEnd}`;
  const isYearPageAtLatest = yearPageEnd >= today.getFullYear();

  return (
    <div className="flex w-fit flex-col overflow-hidden rounded-2xl border border-[#004B5E]/25 bg-white shadow-lg">
      <div className="flex">
      <aside className="flex w-[128px] shrink-0 flex-col gap-1 border-r border-[#E5E7EB] bg-[#FAFBFC] p-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetSelect(preset.id)}
            className={cn(
              PRESET_BUTTON_BASE,
              selectedPreset === preset.id ? PRESET_SELECTED : PRESET_DEFAULT
            )}
          >
            {preset.label}
          </button>
        ))}
      </aside>

      <div className={cn("shrink-0 p-3 text-black", PANEL_CONTENT_WIDTH)}>
        {panelView === "calendar" && (
          <div className="mekya-date-range rounded-xl border border-[#E5E7EB] bg-white p-1.5 text-black">
            <DateRange
              ranges={calendarRanges}
              onChange={handleCalendarChange}
              moveRangeOnFirstSelection={false}
              months={1}
              direction="horizontal"
              showMonthArrow
              showMonthAndYearPickers={false}
              showDateDisplay={false}
              rangeColors={[DATE_RANGE_BRAND]}
              weekdayDisplayFormat="E"
              maxDate={today}
              shownDate={shownDate}
              onShownDateChange={setShownDate}
            />
          </div>
        )}

        {panelView === "month-grid" && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-black">
            <div className="mb-2.5 flex items-center justify-between text-black">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#F3F4F6]"
                onClick={() => setShownDate(addMonths(shownDate, -12))}
                aria-label="Previous year"
              >
                <NavChevron direction="left" />
              </button>
              <span className="text-xs font-bold text-black">{format(shownDate, "yyyy")}</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#F3F4F6] disabled:opacity-40"
                disabled={shownDate.getFullYear() >= today.getFullYear()}
                onClick={() => setShownDate(addMonths(shownDate, 12))}
                aria-label="Next year"
              >
                <NavChevron direction="right" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {months.map((month) => {
                const selected = isMonthInRange(
                  month.index,
                  shownDate.getFullYear(),
                  value,
                  today
                );
                return (
                  <button
                    key={month.index}
                    type="button"
                    disabled={month.disabled}
                    onClick={() => handleMonthSelect(month.index)}
                    className={cn(
                      GRID_CELL_BASE,
                      month.disabled
                        ? GRID_CELL_DISABLED
                        : selected
                          ? GRID_CELL_SELECTED
                          : GRID_CELL_NORMAL
                    )}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {panelView === "year-grid" && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-black">
            <div className="mb-2.5 flex items-center justify-between">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#F3F4F6]"
                onClick={() => setYearDecadeStart((prev) => prev - yearPageSize)}
                aria-label="Previous years"
              >
                <NavChevron direction="left" />
              </button>
              <span className="text-xs font-bold text-black">{yearHeaderLabel}</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#F3F4F6] disabled:opacity-40"
                disabled={isYearPageAtLatest}
                onClick={() => setYearDecadeStart((prev) => prev + yearPageSize)}
                aria-label="Next years"
              >
                <NavChevron direction="right" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {years.map((year) => {
                const disabled = year > today.getFullYear();
                const selected = isYearInRange(year, value, today);
                return (
                  <button
                    key={year}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      GRID_CELL_BASE,
                      disabled
                        ? GRID_CELL_DISABLED
                        : selected
                          ? GRID_CELL_SELECTED
                          : GRID_CELL_NORMAL
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[#E5E7EB] bg-white text-black hover:bg-[#F3F4F6]"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-[#004B5E] text-white hover:bg-[#004B5E]/90"
          disabled={isApplyDisabled}
          onClick={onApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
