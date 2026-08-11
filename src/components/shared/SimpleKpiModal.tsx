"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogCloseButton } from "@/components/ui/dialog"
import { SubKpiCard, type SubKpiCardProps } from "@/components/shared/SubKpiCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export interface SimpleKpiModalDefinition {
  sectionTitle: string
  definition: string
  purpose: string
}

/**
 * Lighter counterpart to `AnalyticsModal` for KPIs that only have real flat summary
 * numbers behind them — no trend chart, no breakdown tabs. Using the full tabbed
 * AnalyticsModal here would mean inventing fake per-tab data; this shows only what's
 * actually backed by a real endpoint.
 */
export function SimpleKpiModal({
  open,
  onOpenChange,
  title,
  definition,
  kpiCards,
  loading,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  definition?: SimpleKpiModalDefinition
  kpiCards: SubKpiCardProps[]
  loading?: boolean
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" hideDefaultClose>
        <DialogHeader className="p-4 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <DialogCloseButton />
          </div>
        </DialogHeader>

        <div className="w-full border-b border-border" aria-hidden />

        <div className="p-4 space-y-6">
          {definition && (
            <div className="overflow-hidden rounded-lg bg-[#F2F2F2]">
              <div className="bg-[#F2F2F2] px-4 py-3">
                <span className="text-sm font-medium text-foreground">{definition.sectionTitle}</span>
              </div>
              <div className="border-b border-border" aria-hidden />
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="block font-regular text-muted-foreground">Definition :</span>
                    <span className="block">{definition.definition}</span>
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm leading-relaxed">
                    <span className="text-muted-foreground">Purpose :</span>{" "}
                    <span className="block">{definition.purpose}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpiCards.map((card) => (
                <SubKpiCard key={card.title} {...card} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
