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
        className={cn("w-[180px] bg-[#E8E9E8] border-border text-[#000000] data-[placeholder]:text-[#000000]", className)}
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
