"use client"
import { ChangeEvent, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Filter, Calendar, RotateCcw, FilterIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  type?: FilterOption[]
  orderStatus?: FilterOption[]
  paymentMethod?: FilterOption[]
  showDateRange?: boolean
  showPriceRange?: boolean
  timeRange?: FilterOption[]
}

export interface FilterValues {
  type: string[]
  orderStatus: string[]
  paymentMethod: string[]
  timeRange: string
  dateFrom: string
  dateTo: string
  priceMin: string
  priceMax: string
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  onApply: () => void
  filters: FilterValues
  onFilterChange: (filters: Partial<FilterValues>) => void
  config?: FilterConfig
  /** Show close (X) button in header. Default true. */
  showCloseButton?: boolean
  /** Render Reset as underlined link (true) or ghost button (false). Default false. */
  resetAsLink?: boolean
}

type DateInputWithPicker = HTMLInputElement & { showPicker?: () => void }

const DEFAULT_CONFIG: FilterConfig = {
  type: [
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
  ],
  orderStatus: [
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
    { value: "Canceled", label: "Canceled" },
  ],
  paymentMethod: [
    { value: "card", label: "Cards" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
  ],
  showDateRange: true,
  showPriceRange: true,
}

function toIsoDate(value: string) {
  const cleaned = value.split("/").map((part) => part.trim())
  if (cleaned.length !== 3) return ""
  const [day, month, year] = cleaned
  if (!day || !month || !year) return ""
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

function toDisplayDate(value: string) {
  const parts = value.split("-")
  if (parts.length !== 3) return value
  const [year, month, day] = parts
  if (!day || !month || !year) return value
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
}

interface DatePickerFieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function DatePickerField({ label, value, placeholder, onChange }: DatePickerFieldProps) {
  const nativeRef = useRef<DateInputWithPicker>(null)

  const handleIconClick = () => {
    if (!nativeRef.current) return
    const isoValue = toIsoDate(value)
    if (isoValue) {
      nativeRef.current.value = isoValue
    }
    if (nativeRef.current.showPicker) {
      nativeRef.current.showPicker()
      return
    }
    nativeRef.current.focus()
  }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(toDisplayDate(event.target.value))
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-[#000000]">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-input bg-[#E8E9E8] pl-3 pr-10 py-2 text-sm text-[#000000] placeholder:text-[#000000] focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded"
          aria-label="Open calendar"
        >
          <Calendar className="h-4 w-4 text-[#000000]" aria-hidden />
        </button>
        <input
          ref={nativeRef}
          type="date"
          className="sr-only"
          onChange={handleDateChange}
        />
      </div>
    </div>
  )
}

export function FilterPanel({
  isOpen,
  onClose,
  onReset,
  onApply,
  filters,
  onFilterChange,
  config = DEFAULT_CONFIG,
  showCloseButton = true,
  resetAsLink = false,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  const handleCheckboxChange = (category: "type" | "orderStatus" | "paymentMethod", value: string) => {
    const currentValues = filters[category]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]

    onFilterChange({ [category]: newValues })
  }

  const handleTimeRangeChange = (value: string) => {
    onFilterChange({ timeRange: value })
  }

  const handleInputChange = (field: keyof FilterValues, value: string) => {
    onFilterChange({ [field]: value })
  }

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-0 w-80 bg-background border-l shadow-lg z-20 max-h-[calc(100vh-300px)] overflow-y-auto"
    >
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 mr-2" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            {resetAsLink ? (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-sm underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                Reset
              </button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-sm gap-1.5">
                <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                Reset
              </Button>
            )}
            {showCloseButton && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Close filters">
                <X className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>


        {mergedConfig.timeRange && mergedConfig.timeRange.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Time Range</h4>
            <div className="grid grid-cols-2 gap-2">
              {mergedConfig.timeRange.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 px-3 text-sm text-[#000000] transition-colors cursor-pointer",
                    filters.timeRange === option.value && "border-primary"
                  )}
                >
                  <input
                    type="radio"
                    name="filter-time-range"
                    value={option.value}
                    checked={filters.timeRange === option.value}
                    onChange={() => handleTimeRangeChange(option.value)}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {mergedConfig.showDateRange && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Date Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <DatePickerField
            label="From"
            value={filters.dateFrom}
            placeholder="dd/mm/yyyy"
            onChange={(value) => handleInputChange("dateFrom", value)}
          />
          <DatePickerField
            label="To"
            value={filters.dateTo}
            placeholder="dd/mm/yyyy"
            onChange={(value) => handleInputChange("dateTo", value)}
          />
        </div>
          </div>
        )}


        <Button variant="default" className="w-full bg-primary text-primary-foreground" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}
