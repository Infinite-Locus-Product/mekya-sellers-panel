"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

/** Matches design: 456×112px toast, 5px radius, 1px border, top/right 24px (≈ left 1440px at 1920px wide). */
const toasterStyle = {
    "--width": "min(456px, calc(100vw - 2rem))",
    "--border-radius": "5px",
} as CSSProperties;

export function Toaster() {
    return (
        <Sonner
            theme="light"
            position="top-right"
            closeButton
            offset={{ top: 24, right: 24 }}
            mobileOffset={{ top: 24, right: 16, left: 16 }}
            style={toasterStyle}
            toastOptions={{
                classNames: {
                    toast:
                        "group toast relative box-border flex w-full min-h-[112px] h-[112px] max-h-[112px] items-center rounded-[5px] border border-border bg-white text-foreground opacity-100 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] data-[type=success]:bg-white data-[type=success]:border-border data-[type=success]:text-foreground",
                    title: "min-w-0 flex-1 pr-11 text-foreground font-medium leading-snug line-clamp-2",
                    description: "pr-11 text-muted-foreground line-clamp-2",
                    closeButton:
                        "!left-auto !right-3 !top-3 z-10 size-8 !translate-x-0 !translate-y-0 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground",
                },
            }}
        />
    );
}
