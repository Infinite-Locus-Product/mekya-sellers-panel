"use client"

import { useState } from "react"
import { formatCurrencyINR, cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Search,
  Crown,
  MapPin,
} from "lucide-react"
import type { ChartDataPoint } from "@/components/analytics"

/**
 * Regional drill-down for this seller's own sales — the admin portal's regional layout,
 * but every figure here is scoped to the signed-in seller's lines by the backend
 * (`GET /seller/analytics/sales-volume`), never the marketplace total.
 *
 * Unlike the admin copy this renders no placeholder regions: if the period has no
 * regional data, it says so. A mock region list on a seller's own revenue screen would be
 * indistinguishable from real earnings.
 */

export interface StateData {
  name: string
  revenue: number
}

export interface RegionalPerformanceDataPoint {
  region: string
  sales?: number
  revenue?: number
  growth?: number
  contribution?: number
  states?: StateData[]
  color?: string
}

interface RegionalPerformanceTabProps {
  data?: RegionalPerformanceDataPoint[]
  chartData?: ChartDataPoint[]
}

interface RegionData {
  id: string
  region: string
  revenue: number
  contribution: number
  growth: number
  states: StateData[]
}

const REGION_THEMES = {
  north: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    headerBg: "bg-blue-50/70",
    expandedBg: "bg-blue-50/40",
    border: "border-blue-200",
    progress: "bg-blue-500",
    progressTrack: "bg-blue-100",
    contributionBar: "bg-blue-400",
  },
  east: {
    dot: "bg-purple-500",
    text: "text-purple-700",
    headerBg: "bg-purple-50/70",
    expandedBg: "bg-purple-50/40",
    border: "border-purple-200",
    progress: "bg-purple-500",
    progressTrack: "bg-purple-100",
    contributionBar: "bg-purple-400",
  },
  south: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    headerBg: "bg-emerald-50/70",
    expandedBg: "bg-emerald-50/40",
    border: "border-emerald-200",
    progress: "bg-emerald-500",
    progressTrack: "bg-emerald-100",
    contributionBar: "bg-emerald-400",
  },
  west: {
    dot: "bg-orange-500",
    text: "text-orange-700",
    headerBg: "bg-orange-50/70",
    expandedBg: "bg-orange-50/40",
    border: "border-orange-200",
    progress: "bg-orange-500",
    progressTrack: "bg-orange-100",
    contributionBar: "bg-orange-400",
  },
  central: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    headerBg: "bg-amber-50/70",
    expandedBg: "bg-amber-50/40",
    border: "border-amber-200",
    progress: "bg-amber-500",
    progressTrack: "bg-amber-100",
    contributionBar: "bg-amber-400",
  },
} as const

type RegionTheme = (typeof REGION_THEMES)[keyof typeof REGION_THEMES]

/** "Central India" is a real bucket in the backend's state map, so it gets its own theme
 *  here rather than silently borrowing North's. */
function getTheme(region: string): RegionTheme {
  const r = region.toLowerCase()
  if (r.includes("north")) return REGION_THEMES.north
  if (r.includes("east")) return REGION_THEMES.east
  if (r.includes("south")) return REGION_THEMES.south
  if (r.includes("west")) return REGION_THEMES.west
  if (r.includes("central")) return REGION_THEMES.central
  return REGION_THEMES.north
}

function StateBreakdown({
  states,
  totalRegionRevenue,
  theme,
}: Readonly<{ states: StateData[]; totalRegionRevenue: number; theme: RegionTheme }>) {
  const [query, setQuery] = useState("")

  if (states.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 opacity-30" aria-hidden />
        <p className="text-sm">No state-level data for this period</p>
      </div>
    )
  }

  const topRevenue = Math.max(...states.map((s) => s.revenue))
  const filtered = query.trim()
    ? states.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : states

  return (
    <div className="space-y-3 px-4 pb-4 pt-1">
      {/* Only worth a search box once the list is long enough to scan. */}
      {states.length > 5 ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search states…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background/70 py-1 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            aria-label="Search states"
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No states match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((state) => {
            const pct =
              totalRegionRevenue > 0
                ? Math.round((state.revenue / totalRegionRevenue) * 100)
                : 0
            const barPct = topRevenue > 0 ? (state.revenue / topRevenue) * 100 : 0
            const isTop = state.revenue === topRevenue

            return (
              <div key={state.name}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    {isTop ? (
                      <Crown
                        className="h-3 w-3 shrink-0 text-amber-500"
                        aria-label="Top performing state"
                      />
                    ) : null}
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        isTop ? "text-amber-600" : "text-foreground"
                      )}
                    >
                      {state.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="tabular-nums text-sm font-semibold text-foreground">
                      {formatCurrencyINR(state.revenue)}
                    </span>
                    <span className="w-8 text-right tabular-nums text-xs text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-1.5 w-full overflow-hidden rounded-full",
                    theme.progressTrack
                  )}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500 ease-out",
                      theme.progress
                    )}
                    style={{ width: `${barPct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${state.name}: ${pct}% of region revenue`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RegionCard({
  region,
  isOpen,
  onToggle,
}: Readonly<{ region: RegionData; isOpen: boolean; onToggle: () => void }>) {
  const theme = getTheme(region.region)
  const isPositive = region.growth >= 0
  const stateCount = region.states.length

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-shadow duration-200 hover:shadow-md",
        theme.border,
        isOpen && "shadow-sm"
      )}
    >
      <button
        type="button"
        className={cn(
          "w-full border-b border-transparent px-4 py-4 text-left transition-colors duration-150",
          theme.headerBg,
          isOpen && [theme.border, "border-b"],
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`region-${region.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn("mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full", theme.dot)}
              aria-hidden
            />
            <div className="min-w-0">
              <p className={cn("truncate text-sm font-semibold leading-tight", theme.text)}>
                {region.region}
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {formatCurrencyINR(region.revenue)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                isPositive
                  ? "bg-[var(--success-light)] text-[var(--success-dark)]"
                  : "bg-[var(--error-light)] text-[var(--error-dark)]"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              {isPositive && "+"}
              {region.growth}%
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                isOpen && "rotate-180"
              )}
              aria-hidden
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
            <div
              className={cn("h-full rounded-full", theme.contributionBar)}
              style={{ width: `${region.contribution}%` }}
              aria-hidden
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {region.contribution}% of total
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            ·&nbsp;{stateCount} state{stateCount !== 1 ? "s" : ""}
          </span>
        </div>
      </button>

      {/* grid-rows trick: animates open/closed without measuring content height. */}
      <div
        id={`region-${region.id}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        role="region"
        aria-label={`${region.region} state breakdown`}
      >
        <div className="overflow-hidden">
          <div className={cn("pt-3", theme.expandedBg)}>
            <StateBreakdown
              states={region.states}
              totalRegionRevenue={region.revenue}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryFooter({ regions }: Readonly<{ regions: RegionData[] }>) {
  const totalStates = regions.reduce((sum, r) => sum + r.states.length, 0)
  const totalRevenue = regions.reduce((sum, r) => sum + r.revenue, 0)

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{regions.length}</span> Regions
      </span>
      <span className="text-xs text-muted-foreground" aria-hidden>
        ·
      </span>
      <span className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{totalStates}</span> States Covered
      </span>
      <span className="text-xs text-muted-foreground" aria-hidden>
        ·
      </span>
      <span className="text-xs text-muted-foreground">
        Your Revenue:{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {formatCurrencyINR(totalRevenue)}
        </span>
      </span>
    </div>
  )
}

export function RegionalPerformanceTab({ data }: Readonly<RegionalPerformanceTabProps>) {
  const [openRegions, setOpenRegions] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenRegions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const regions: RegionData[] = (data ?? []).map((d) => ({
    id: d.region.toLowerCase().replace(/\s+/g, "-"),
    region: d.region,
    // `revenue` is the field this view wants; `sales` is the same number under the older
    // key, kept as a fallback so a stale API shape degrades to the right figure, not zero.
    revenue: d.revenue ?? d.sales ?? 0,
    growth: d.growth ?? 0,
    contribution: d.contribution ?? 0,
    states: d.states ?? [],
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Regional Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Revenue from your own products only, by the customer&apos;s delivery address.
          </p>
        </CardHeader>
        <CardContent>
          {regions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <MapPin className="h-10 w-10 opacity-30" aria-hidden />
              <p className="text-sm">No regional sales in this period</p>
              <p className="text-xs">
                Orders need a delivery address in India to be counted by region.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {regions.map((region) => (
                  <RegionCard
                    key={region.id}
                    region={region}
                    isOpen={openRegions.has(region.id)}
                    onToggle={() => toggle(region.id)}
                  />
                ))}
              </div>
              <div className="mt-4">
                <SummaryFooter regions={regions} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
