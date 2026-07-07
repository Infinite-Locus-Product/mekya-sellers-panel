"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectFilterProps {
  placeholder: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function MultiSelectFilter({
  placeholder,
  options,
  selected,
  onChange,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? "1 selected")
        : `${selected.length} selected`;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            "inline-flex h-7 min-w-0 max-w-full w-full items-center justify-between gap-1 rounded-md bg-[#E8E9E8] px-1.5 text-[10px] font-normal text-[#000000] transition-colors hover:bg-[#dde0dd]",
            "sm:h-8 sm:text-xs min-[1920px]:h-10 min-[1920px]:px-3 min-[1920px]:text-sm",
            "flex-1 basis-0",
            selected.length > 0 && "font-medium",
            className
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          <ChevronDown
            className="h-3 w-3 shrink-0 opacity-60 sm:h-3.5 sm:w-3.5"
            aria-hidden
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 max-h-60 min-w-[10rem] overflow-y-auto rounded-md border border-border bg-white py-1 shadow-md outline-none"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No options</p>
          ) : (
            options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 sm:text-sm"
                >
                  <span
                    className={cn(
                      "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-input",
                      checked && "border-foreground bg-foreground"
                    )}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-white" aria-hidden />}
                  </span>
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              );
            })
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
