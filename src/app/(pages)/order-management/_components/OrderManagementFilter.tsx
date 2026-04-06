"use client";

import { useState, type ReactNode, cloneElement, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/components/shared/FilterIcon";
import { FilterPanel } from "@/components/shared/FilterPanel";
import type { FilterValues, FilterConfig } from "@/components/shared/FilterPanel";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Default filter values for order-management (Payment Method, Date Range, Price Range only). */
export const DEFAULT_ORDER_FILTER_VALUES: FilterValues = {
  type: [],
  orderStatus: [],
  paymentMethod: [],
  dateFrom: "",
  dateTo: "",
  priceMin: "0",
  priceMax: "100000",
};

/** Filter config for order-management: only Payment Method, Date Range, Price Range (no Type, no Order Status). */
export const DEFAULT_ORDER_FILTER_CONFIG: FilterConfig = {
  type: [],
  orderStatus: [],
  paymentMethod: [
    { value: "card", label: "Cards" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
  ],
  showDateRange: true,
  showPriceRange: true,
};

export interface OrderManagementFilterProps {
  readonly filters: FilterValues;
  readonly onFilterChange: (filters: Partial<FilterValues>) => void;
  readonly onReset: () => void;
  readonly onApply: () => void;
  readonly config?: FilterConfig;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly children?: ReactNode;
}

function OrderManagementFilterRoot({
  filters,
  onFilterChange,
  onReset,
  onApply,
  config,
  open: controlledOpen,
  onOpenChange,
  children,
}: OrderManagementFilterProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  const trigger =
    children && isValidElement(children)
      ? cloneElement(children as React.ReactElement<{ onClick?: () => void; className?: string }>, {
          onClick: handleToggle,
        })
      : null;

  const mergedConfig = { ...DEFAULT_ORDER_FILTER_CONFIG, ...config };

  return (
    <>
      {trigger ?? (
        <OrderManagementFilterTrigger
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
        config={mergedConfig}
        showCloseButton={false}
        resetAsLink
      />
    </>
  );
}

export interface OrderManagementFilterTriggerProps {
  readonly onClick?: () => void;
  readonly className?: string;
  readonly label?: string;
  readonly variant?: "outline" | "default" | "ghost" | "link" | "secondary" | "destructive";
  readonly size?: "default" | "sm" | "lg" | "icon";
  readonly showCloseWhenOpen?: boolean;
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

function OrderManagementFilterTrigger({
  onClick,
  className,
  label = "Filters",
  variant = "outline",
  size = "default",
  showCloseWhenOpen = false,
  isOpen = false,
  onClose,
}: OrderManagementFilterTriggerProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        className={cn("bg-white border-0 shadow-none hover:bg-gray-50 hover:border-0", className)}
      >
        <FilterIcon className="h-4 w-4 mr-2" />
        {label}
      </Button>
      {showCloseWhenOpen && isOpen && onClose && (
        <Button variant="outline" size="icon" onClick={onClose} aria-label="Close filter">
          <X className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}

interface OrderManagementFilterPanelProps {
  readonly appliedFilters: FilterValues;
  readonly onApply: (filters: FilterValues) => void;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onReset?: () => void;
  readonly config?: FilterConfig;
}

function OrderManagementFilterPanel({
  isOpen,
  onClose,
  onReset,
  onApply,
  appliedFilters,
  config,
}: OrderManagementFilterPanelProps) {
  const [draftFilters, setDraftFilters] = useState<FilterValues>(appliedFilters);

  const handleFilterChange = (partial: Partial<FilterValues>) => {
    setDraftFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  const handleReset = () => {
    setDraftFilters(DEFAULT_ORDER_FILTER_VALUES);
    onReset?.();
  };

  const mergedConfig = { ...DEFAULT_ORDER_FILTER_CONFIG, ...config };
  return (
    <FilterPanel
      isOpen={isOpen}
      onClose={onClose}
      onReset={handleReset}
      onApply={handleApply}
      filters={draftFilters}
      onFilterChange={handleFilterChange}
      config={mergedConfig}
      showCloseButton={false}
      resetAsLink
    />
  );
}
export const OrderManagementFilter = Object.assign(OrderManagementFilterRoot, {
  Trigger: OrderManagementFilterTrigger,
  Panel: OrderManagementFilterPanel,
});
