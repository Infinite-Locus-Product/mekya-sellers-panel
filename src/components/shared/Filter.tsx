"use client"

import { useState, type ReactNode, cloneElement, isValidElement } from "react"
import { Button } from "@/components/ui/button"
import { FilterIcon } from "@/components/shared/FilterIcon"
import { FilterPanel } from "@/components/shared/FilterPanel"
import type { FilterValues, FilterConfig } from "@/components/shared/FilterPanel"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export const DEFAULT_FILTER_VALUES: FilterValues = {
  type: [],
  orderStatus: [],
  paymentMethod: [],
  timeRange: "custom_range",
  dateFrom: "",
  dateTo: "",
  priceMin: "0",
  priceMax: "100000",
}

export interface FilterProps {
  filters: FilterValues
  onFilterChange: (filters: Partial<FilterValues>) => void
  onReset: () => void
  onApply: () => void
  config?: FilterConfig
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

function FilterRoot({
  filters,
  onFilterChange,
  onReset,
  onApply,
  config,
  open: controlledOpen,
  onOpenChange,
  children,
}: FilterProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const handleToggle = () => setIsOpen(!isOpen)
  const handleClose = () => setIsOpen(false)

  const trigger =
    children && isValidElement(children)
      ? cloneElement(children as React.ReactElement<{ onClick?: () => void; className?: string }>, {
          onClick: handleToggle,
        })
      : null

  return (
    <>
      {trigger ?? (
        <FilterTrigger
          onClick={handleToggle}
          isOpen={isOpen}
          onClose={handleClose}
          showCloseWhenOpen
        />
      )}
      <FilterPanel
        isOpen={isOpen}
        onClose={handleClose}
        onReset={onReset}
        onApply={onApply}
        filters={filters}
        onFilterChange={onFilterChange}
        config={config}
      />
    </>
  )
}

export interface FilterTriggerProps {
  onClick?: () => void
  className?: string
  label?: string
  variant?: "outline" | "default" | "ghost" | "link" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  showCloseWhenOpen?: boolean
  isOpen?: boolean
  onClose?: () => void
}

function FilterTrigger({
  onClick,
  className,
  label = "Filters",
  variant = "outline",
  size = "default",
  showCloseWhenOpen = false,
  isOpen = false,
  onClose,
}: FilterTriggerProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        className={cn("bg-[#E8E9E8] border-0 text-[#000000] shadow-none hover:bg-[#dfe1df] hover:border-0", className)}
      >
        <FilterIcon className="h-4 w-4 mr-2" />
        {label}
      </Button>
      {showCloseWhenOpen && isOpen && onClose && (
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="Close filter"
          className="bg-[#E8E9E8] border-0 text-[#000000] shadow-none hover:bg-[#dfe1df]"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  )
}

export const Filter = Object.assign(FilterRoot, {
  Trigger: FilterTrigger,
})
