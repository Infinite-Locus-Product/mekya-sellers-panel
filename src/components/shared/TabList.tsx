"use client"

import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
}

export interface TabListProps {

  tabs: TabItem[]
  value: string
  onValueChange: (id: string) => void
  variant?: "pill" | "muted"
  className?: string
  tabClassName?: string
  "aria-label"?: string
}

const variantStyles = {
  pill: {
    list: "flex items-center gap-1 rounded-full p-2 bg-[#E4E4E4]",
    tab: "px-8 py-1 text-xs font-medium transition-colors rounded-full",
    active: "bg-white text-foreground shadow-sm",
    inactive: "bg-transparent text-foreground hover:bg-white/50",
  },
  muted: {
    list: "inline-flex rounded-full bg-[#E8E9E8] p-2",
    tab: "flex flex-1 items-center justify-center rounded-full p-2 text-sm font-medium transition-colors",
    active: "bg-background text-foreground shadow-sm",
    inactive: " hover:text-foreground",
  },
} as const

export function TabList({
  tabs,
  value,
  onValueChange,
  variant = "pill",
  className,
  tabClassName,
  "aria-label": ariaLabel,
}: TabListProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(styles.list, className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onValueChange(tab.id)}
          className={cn(
            styles.tab,
            value === tab.id ? styles.active : styles.inactive,
            tabClassName
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
