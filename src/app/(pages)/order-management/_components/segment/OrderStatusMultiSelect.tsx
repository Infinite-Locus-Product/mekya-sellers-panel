"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { OrderStatus } from "@/lib/tableTypes";
import { ORDER_STATUS_FILTER_OPTIONS, ORDER_FILTER_SELECT_TRIGGER_CLASS } from "./constants";

export interface OrderStatusMultiSelectProps {
    readonly value: OrderStatus[];
    readonly onChange: (value: OrderStatus[]) => void;
}

/** Multi-select checkbox popover — /seller/orders' `statuses` param accepts repeated values. */
export function OrderStatusMultiSelect({ value, onChange }: Readonly<OrderStatusMultiSelectProps>) {
    const toggle = (status: OrderStatus) => {
        onChange(value.includes(status) ? value.filter((s) => s !== status) : [...value, status]);
    };

    const label =
        value.length === 0
            ? "All Status"
            : value.length === 1
                ? value[0]
                : `${value.length} statuses`;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={`${ORDER_FILTER_SELECT_TRIGGER_CLASS} justify-between gap-1 bg-[#E8E9E8] font-normal`}
                >
                    <span className="truncate">{label}</span>
                    <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2">
                <div className="flex items-center justify-between px-1 pb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Order Status</span>
                    {value.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="text-xs text-muted-foreground underline hover:text-foreground"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted"
                        >
                            <input
                                type="checkbox"
                                className="size-3.5 cursor-pointer accent-primary"
                                checked={value.includes(option.value)}
                                onChange={() => toggle(option.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
