"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/shared/AppSelect";

export interface CursorPagerProps {
    readonly pageNumber: number;
    readonly hasPrev: boolean;
    readonly hasNext: boolean;
    readonly onPrev: () => void;
    readonly onNext: () => void;
    readonly pageSize: number;
    readonly onPageSizeChange: (size: number) => void;
    readonly rowCount: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** Prev/Next pager for opaque cursor-based pagination — no total-page-count assumption. */
export function CursorPager({
    pageNumber,
    hasPrev,
    hasNext,
    onPrev,
    onNext,
    pageSize,
    onPageSizeChange,
    rowCount,
}: Readonly<CursorPagerProps>) {
    return (
        <div className="flex flex-col-reverse items-center justify-between gap-2 px-1 py-3 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-[1920px]:text-sm">
                <span>Rows per page</span>
                <AppSelect
                    placeholder={String(pageSize)}
                    value={String(pageSize)}
                    onChange={(v) => onPageSizeChange(Number(v))}
                    options={PAGE_SIZE_OPTIONS.map((n) => ({ label: String(n), value: String(n) }))}
                    className="h-8 w-[4.5rem] min-[1920px]:h-8 min-[1920px]:w-[4.5rem]"
                />
                <span>
                    {rowCount} row{rowCount === 1 ? "" : "s"}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground min-[1920px]:text-sm">Page {pageNumber}</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={onPrev}
                    className="h-8 gap-1 px-2 text-xs min-[1920px]:h-9 min-[1920px]:text-sm"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" aria-hidden />
                    Prev
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    onClick={onNext}
                    className="h-8 gap-1 px-2 text-xs min-[1920px]:h-9 min-[1920px]:text-sm"
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight className="size-4" aria-hidden />
                </Button>
            </div>
        </div>
    );
}
