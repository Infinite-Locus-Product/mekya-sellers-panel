"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Option = {
  label: string
  value: string
}

interface AppSelectProps {
  options: Option[]
  value?: string
  placeholder: string
  onChange: (value: string) => void
  className?: string
}

export function AppSelect({ options, value, placeholder, onChange, className }: AppSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-8 max-w-full bg-[#E8E9E8] px-2 py-1 text-xs text-[#000000] data-[placeholder]:text-[#000000] min-[1920px]:h-10 min-[1920px]:w-[180px] min-[1920px]:px-3 min-[1920px]:py-2 min-[1920px]:text-sm",
          "w-[min(100%,9.5rem)] min-[1920px]:max-w-none",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent position="popper" side="bottom" sideOffset={2} align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
