"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group flex w-fit cursor-pointer items-center justify-between gap-2  rounded-xs border border-border px-3 py-2 text-sm text-muted-foreground whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span className="relative inline-flex size-4 items-center justify-center min-[1920px]:size-5">
          <ChevronDownIcon className="size-3.5 opacity-100 transition-opacity duration-150 group-data-[state=open]:opacity-0 min-[1920px]:size-4" />
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute size-3.5 opacity-0 transition-opacity duration-150 group-data-[state=open]:opacity-100 min-[1920px]:size-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.55778 4.55778C4.67497 4.44074 4.83382 4.375 4.99945 4.375C5.16508 4.375 5.32393 4.44074 5.44112 4.55778L15.4411 14.5578C15.5025 14.615 15.5518 14.684 15.5859 14.7607C15.6201 14.8373 15.6385 14.9201 15.6399 15.004C15.6414 15.0879 15.626 15.1713 15.5946 15.2491C15.5631 15.3269 15.5163 15.3976 15.457 15.457C15.3976 15.5163 15.3269 15.5631 15.2491 15.5946C15.1713 15.626 15.0879 15.6414 15.004 15.6399C14.9201 15.6385 14.8373 15.6201 14.7607 15.5859C14.684 15.5518 14.615 15.5025 14.5578 15.4411L4.55778 5.44112C4.44074 5.32393 4.375 5.16508 4.375 4.99945C4.375 4.83382 4.44074 4.67497 4.55778 4.55778Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.4456 4.55778C15.5627 4.67497 15.6284 4.83382 15.6284 4.99945C15.6284 5.16508 15.5627 5.32393 15.4456 5.44112L5.44561 15.4411C5.32713 15.5515 5.17042 15.6116 5.00851 15.6088C4.84659 15.6059 4.6921 15.5403 4.57759 15.4258C4.46308 15.3113 4.39749 15.1568 4.39463 14.9949C4.39177 14.833 4.45187 14.6763 4.56227 14.5578L14.5623 4.55778C14.6795 4.44074 14.8383 4.375 15.0039 4.375C15.1696 4.375 15.3284 4.44074 15.4456 4.55778Z"
              fill="black"
            />
          </svg>
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full min-w-0 cursor-default items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden select-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="flex w-full min-w-0 flex-1 items-center [&>*]:w-full [&>*]:min-w-0">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-pointer items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-pointer items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
