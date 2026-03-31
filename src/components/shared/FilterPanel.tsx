"use client"

import { useRef, useEffect } from "react"

/**
 * FilterPanel - A reusable filter component for data tables
 *
 * @example
 * ```tsx
 * import { FilterPanel, type FilterValues } from "@/components/shared"
 *
 * const [isFilterOpen, setIsFilterOpen] = useState(false)
 * const [filters, setFilters] = useState<FilterValues>({
 *   orderStatus: [],
 *   paymentMethod: [],
 *   dateFrom: "",
 *   dateTo: "",
 *   priceMin: "0",
 *   priceMax: "100000",
 * })
 *
 * const handleFilterChange = (newFilters: Partial<FilterValues>) => {
 *   setFilters((prev) => ({ ...prev, ...newFilters }))
 * }
 *
 * return (
 *   <FilterPanel
 *     isOpen={isFilterOpen}
 *     onClose={() => setIsFilterOpen(false)}
 *     onReset={() => setFilters(defaultFilters)}
 *     onApply={() => {}}
 *     filters={filters}
 *     onFilterChange={handleFilterChange}
 *   />
 * )
 * ```
 */

import { Button } from "@/components/ui/button"
import { X, Filter, Calendar, RotateCcw, FilterIcon } from "lucide-react"

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
}

export interface FilterValues {
  type: string[]
  orderStatus: string[]
  paymentMethod: string[]
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

const DEFAULT_CONFIG: FilterConfig = {
  type: [
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
  ],
  orderStatus: [
    { value: "delivered", label: "Delivered" },
    { value: "shipped", label: "Shipped" },
    { value: "pending", label: "Pending" },
    { value: "canceled", label: "Canceled" },
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

  const handleInputChange = (field: keyof FilterValues, value: string) => {
    onFilterChange({ [field]: value })
  }

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-0 w-80 bg-background border-l shadow-lg z-20 max-h-[calc(100vh-300px)] overflow-y-auto"
    >
      <div className="p-6 space-y-6">
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

        {mergedConfig.type && mergedConfig.type.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium ">Type</h4>
            <div className="flex flex-wrap gap-22">
              {mergedConfig.type.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(option.value)}
                    onChange={() => handleCheckboxChange("type", option.value)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mergedConfig.orderStatus && mergedConfig.orderStatus.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Order Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {mergedConfig.orderStatus.map((status) => (
                <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.orderStatus.includes(status.value)}
                    onChange={() => handleCheckboxChange("orderStatus", status.value)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mergedConfig.paymentMethod && mergedConfig.paymentMethod.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Payment Method</h4>
            <div className="grid grid-cols-2 gap-2">
              {mergedConfig.paymentMethod.map((method) => (
                <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.paymentMethod.includes(method.value)}
                    onChange={() => handleCheckboxChange("paymentMethod", method.value)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mergedConfig.showDateRange && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Date Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={filters.dateFrom}
                    onChange={(e) => handleInputChange("dateFrom", e.target.value)}
                    className="w-full rounded-md border border-input bg-[#E8E9E8] pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={filters.dateTo}
                    onChange={(e) => handleInputChange("dateTo", e.target.value)}
                    className="w-full rounded-md border border-input bg-[#E8E9E8] pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        )}

        {mergedConfig.showPriceRange && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Min</label>
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => handleInputChange("priceMin", e.target.value)}
                  className="w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Max</label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => handleInputChange("priceMax", e.target.value)}
                  className="w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
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
