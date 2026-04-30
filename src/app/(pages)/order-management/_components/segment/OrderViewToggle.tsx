"use client";

import { ORDER_VIEW_TAB_ACTIVE_CLASS, ORDER_VIEW_TAB_IDLE_CLASS } from "./constants";

export interface OrderViewToggleProps {
    readonly orderView: "all" | "returns";
    readonly labels: { readonly all: string; readonly returns: string };
    readonly onSelectAllView: () => void;
    readonly onSelectReturnsView: () => void;
}

export function OrderViewToggle({
    orderView,
    labels,
    onSelectAllView,
    onSelectReturnsView,
}: Readonly<OrderViewToggleProps>) {
    return (
        <div className="shrink-0">
            <div className="flex h-8 min-w-[12rem] max-w-[260px] items-center rounded-full bg-[#E5E5E5] p-0.5 sm:max-w-[280px] min-[1920px]:h-[39px] min-[1920px]:max-w-[320px] min-[1920px]:p-1">
                <button
                    type="button"
                    onClick={onSelectAllView}
                    className={orderView === "all" ? ORDER_VIEW_TAB_ACTIVE_CLASS : ORDER_VIEW_TAB_IDLE_CLASS}
                >
                    {labels.all}
                </button>
                <button
                    type="button"
                    onClick={onSelectReturnsView}
                    className={orderView === "returns" ? ORDER_VIEW_TAB_ACTIVE_CLASS : ORDER_VIEW_TAB_IDLE_CLASS}
                >
                    {labels.returns}
                </button>
            </div>
        </div>
    );
}
