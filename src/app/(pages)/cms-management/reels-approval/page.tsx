"use client"

import { useState, useCallback, useRef, useEffect, useMemo, Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Filter,
  ArrowUpDown,
  Settings,
  ChevronDown,
  Bell,
  Check,
  CircleStop,
  Pencil,
  ArrowLeft,
  Calendar,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ReelPlayCircleIcon } from "@/assets/icons"

const DEFAULT_REEL_THUMBNAIL = "/images/reelthumbnail.png"

type ReelStatus = "pending" | "active" | "rejected"

interface VideoReelRow {
  id: string
  thumbnailSrc: string | null
  title: string
  seller: string
  uploadDate: string
  duration: string
  status: ReelStatus
  rejectReason?: string
  views: number
}

const MOCK_VIDEO_REELS: VideoReelRow[] = [
  { id: "1", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "pending", views: 48 },
  { id: "2", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "active", views: 48 },
  { id: "3", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "rejected", rejectReason: "The reel includes content that goes against our platform's guidelines (e.g., hate speech, harassment, graphic content).", views: 48 },
  { id: "4", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "active", views: 48 },
  { id: "5", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "rejected", rejectReason: "The reel does not showcase a product or relate to the eCommerce platform's core themes (shopping, reviews, tutorials, etc.).", views: 48 },
  { id: "6", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "rejected", rejectReason: "The audio or captions contain profanity, slurs, or suggestive language not allowed on the platform.", views: 48 },
  { id: "7", thumbnailSrc: DEFAULT_REEL_THUMBNAIL, title: "Cotton t-shirt video test upload", seller: "Raag Fashion", uploadDate: "01-Jan-2025", duration: "0:45", status: "rejected", rejectReason: "The reel lacks clear messaging or doesn't add any value for other users (e.g., no product shown, no tutorial, no engagement).", views: 48 },
]

function ensureExtraRejectedWhenOnlyThree(rows: VideoReelRow[]): VideoReelRow[] {
  if (rows.length !== 3) return rows
  let maxNumericId = 0
  for (const r of rows) {
    const n = Number(r.id)
    if (!Number.isNaN(n)) maxNumericId = Math.max(maxNumericId, n)
  }
  const baseRow = {
    thumbnailSrc: DEFAULT_REEL_THUMBNAIL,
    title: "Cotton t-shirt video test upload",
    seller: "Raag Fashion",
    uploadDate: "01-Jan-2025",
    duration: "0:45",
    views: 48,
  } as const
  return [
    ...rows,
    {
      ...baseRow,
      id: String(maxNumericId + 1),
      status: "rejected" as const,
      rejectReason: "Content does not meet quality guidelines for product reels.",
    },
    {
      ...baseRow,
      id: String(maxNumericId + 2),
      status: "rejected" as const,
      rejectReason: "Video appears duplicated or spam-like relative to existing listings.",
    },
  ]
}

const THUMBNAIL_WIDTH_PX = "100px"
const THUMBNAIL_HEIGHT_PX = "100px"
const PLAY_ICON_SIZE_PX = 24

const REEL_MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
}

function parseReelUploadDate(uploadDate: string): Date | null {
  const match = uploadDate.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = REEL_MONTHS[match[2] ?? ""]
  if (month === undefined) return null
  const year = Number(match[3])
  const d = new Date(year, month, day)
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null
  return d
}

function parseDdMmYyyy(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const d = new Date(year, month, day)
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null
  return d
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

type StatusFilterValue = "all" | ReelStatus

function ThumbnailWithPlay({ src, title }: { src: string | null; title: string }) {
  const imageSrc = src ?? DEFAULT_REEL_THUMBNAIL
  return (
    <div className="flex items-center gap-2">
      <div
        className="shrink-0 overflow-hidden rounded border border-border bg-muted"
        style={{ width: THUMBNAIL_WIDTH_PX }}
      >
        <img
          src={imageSrc}
          alt={title}
          className="h-auto w-full object-contain"
          style={{ width: THUMBNAIL_WIDTH_PX, height: "auto", display: "block" }}
        />
      </div>
      <div
        className=""
        style={{ width: `${PLAY_ICON_SIZE_PX}px`, height: `${PLAY_ICON_SIZE_PX}px` }}
        aria-hidden
      >
        <ReelPlayCircleIcon />

      </div>
    </div>
  )
}

function StatusBadge({ status, rejectReason }: { status: ReelStatus; rejectReason?: string }) {
  if (status === "pending") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm w-fit">
          <Bell className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
          Pending
        </span>
      </div>
    )
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
        Active
      </span>
    )
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/50 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 shadow-sm w-fit">
        <CircleStop className="h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden />
        Rejected
      </span>
      {rejectReason && (
        <span className="text-xs text-muted-foreground">{rejectReason}</span>
      )}
    </div>
  )
}

function SortableHeader({ label, className }: { label: string; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-medium text-foreground", className)}>
      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground/80">
        {label}
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </button>
    </th>
  )
}

type TabMode = "approval" | "disapproval"

const INPUT_GRAY = "bg-[#E8E9E8] border-border"

function ScheduleReelModal({
  open,
  onOpenChange,
  reel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reel: VideoReelRow | null
}) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("12:00")

  const handleBack = () => onOpenChange(false)
  const handleSchedule = () => {
    // TODO: API call to schedule reel at date/time
    onOpenChange(false)
    setDate("")
    setTime("12:00")
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDate("")
      setTime("12:00")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden pr-10">
        <div className="flex flex-row items-center justify-between border-b px-6 py-4 pr-12">
          <button
            type="button"
            onClick={handleBack}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <DialogTitle className="text-base font-semibold">Schedule Reel for Later</DialogTitle>
          <div className="w-9" aria-hidden />
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
              Select Date & Time to Publish
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "flex h-10 flex-1 rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  INPUT_GRAY
                )}
                aria-label="Publish date"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={cn(
                  "flex h-10 flex-1 rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  INPUT_GRAY
                )}
                aria-label="Publish time"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center border-t px-6 py-4">
          <Button
            type="button"
            onClick={handleSchedule}
            className="bg-[#004C5E] text-white hover:bg-[#004C5E]/90"
          >
            Schedule for Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReelsApprovalPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [reels, setReels] = useState<VideoReelRow[]>(() =>
    ensureExtraRejectedWhenOnlyThree(MOCK_VIDEO_REELS)
  )
  const [tab, setTab] = useState<TabMode>("approval")
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [reelToReject, setReelToReject] = useState<VideoReelRow | null>(null)
  const [rejectReasonText, setRejectReasonText] = useState("")
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [reelToSchedule, setReelToSchedule] = useState<VideoReelRow | null>(null)

  const filterAnchorRef = useRef<HTMLDivElement>(null)
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)
  const [appliedStatus, setAppliedStatus] = useState<StatusFilterValue>("all")
  const [appliedDateFrom, setAppliedDateFrom] = useState("")
  const [appliedDateTo, setAppliedDateTo] = useState("")
  const [draftStatus, setDraftStatus] = useState<StatusFilterValue>("all")
  const [draftDateFrom, setDraftDateFrom] = useState("")
  const [draftDateTo, setDraftDateTo] = useState("")

  const urlStatusFilter = useMemo((): ReelStatus | null => {
    const s = searchParams.get("status")
    if (s === "pending" || s === "active" || s === "rejected") return s
    return null
  }, [searchParams])

  const effectiveStatusFilter: StatusFilterValue = urlStatusFilter ?? appliedStatus

  const toggleFilterPopover = useCallback(() => {
    if (filterPopoverOpen) {
      setFilterPopoverOpen(false)
      return
    }
    setDraftStatus(effectiveStatusFilter)
    setDraftDateFrom(appliedDateFrom)
    setDraftDateTo(appliedDateTo)
    setFilterPopoverOpen(true)
  }, [filterPopoverOpen, effectiveStatusFilter, appliedDateFrom, appliedDateTo])

  useEffect(() => {
    if (!filterPopoverOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      // Select content is portaled; keep popover open while choosing status
      if (target.closest('[data-slot="select-content"]')) return
      if (filterAnchorRef.current?.contains(target)) return
      setFilterPopoverOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [filterPopoverOpen])

  const openRejectModal = useCallback((reel: VideoReelRow) => {
    setReelToReject(reel)
    setRejectReasonText("")
    setRejectModalOpen(true)
  }, [])

  const closeRejectModal = useCallback(() => {
    setRejectModalOpen(false)
    setReelToReject(null)
    setRejectReasonText("")
  }, [])

  const openScheduleModal = useCallback((reel: VideoReelRow) => {
    setReelToSchedule(reel)
    setScheduleModalOpen(true)
  }, [])

  const submitRejection = useCallback(() => {
    if (!reelToReject) return
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelToReject.id
          ? { ...r, status: "rejected" as ReelStatus, rejectReason: rejectReasonText.trim() || undefined }
          : r
      )
    )
    closeRejectModal()
  }, [reelToReject, rejectReasonText, closeRejectModal])

  const fromBoundary = parseDdMmYyyy(appliedDateFrom)
  const toBoundary = parseDdMmYyyy(appliedDateTo)
  const fromStart = fromBoundary ? startOfDay(fromBoundary) : null
  const toEnd = toBoundary ? endOfDay(toBoundary) : null

  const filteredReels = reels
    .filter((r) =>
      tab === "disapproval" ? r.status === "rejected" : r.status !== "rejected"
    )
    .filter((r) => {
      if (effectiveStatusFilter !== "all" && r.status !== effectiveStatusFilter) return false
      const reelDate = parseReelUploadDate(r.uploadDate)
      if (fromStart && reelDate && reelDate < fromStart) return false
      if (toEnd && reelDate && reelDate > toEnd) return false
      return true
    })

  return (
    <div className="space-y-6">
      <ScheduleReelModal
        open={scheduleModalOpen}
        onOpenChange={(open) => {
          setScheduleModalOpen(open)
          if (!open) setReelToSchedule(null)
        }}
        reel={reelToSchedule}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {tab === "approval" ? "Reels Approval" : "Disapproved Reels"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve reels uploaded by sellers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-muted p-1" role="tablist" aria-label="Reels view">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "approval"}
              onClick={() => setTab("approval")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                tab === "approval"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Reels Approval
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "disapproval"}
              onClick={() => setTab("disapproval")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                tab === "disapproval"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Disapproved Reels
            </button>
          </div>
          <div className="relative" ref={filterAnchorRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={filterPopoverOpen}
              aria-haspopup="dialog"
              aria-controls="reels-filter-popover"
              onClick={toggleFilterPopover}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden />
              Filter
            </Button>
            {filterPopoverOpen ? (
              <div
                id="reels-filter-popover"
                role="dialog"
                aria-label="Filters"
                className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-[10px] border border-border/60 bg-card p-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
                    <span className="text-base font-semibold text-foreground">Filters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftStatus("all")
                      setDraftDateFrom("")
                      setDraftDateTo("")
                    }}
                    className="inline-flex items-center gap-1.5 text-sm text-foreground underline decoration-foreground underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                    Reset
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Select
                      value={draftStatus}
                      onValueChange={(v) => setDraftStatus(v as StatusFilterValue)}
                    >
                      <SelectTrigger
                        size="default"
                        className="h-10 w-full min-w-0 rounded-lg border-border bg-[#F3F4F6] text-sm text-foreground shadow-none"
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="z-[60]">
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Date Range</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="reels-filter-date-from" className="text-xs text-muted-foreground">
                          From
                        </label>
                        <div className="relative">
                          <input
                            id="reels-filter-date-from"
                            type="text"
                            inputMode="numeric"
                            placeholder="dd/mm/yyyy"
                            value={draftDateFrom}
                            onChange={(e) => setDraftDateFrom(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-[#F3F4F6] py-2 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            autoComplete="off"
                          />
                          <Calendar
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="reels-filter-date-to" className="text-xs text-muted-foreground">
                          To
                        </label>
                        <div className="relative">
                          <input
                            id="reels-filter-date-to"
                            type="text"
                            inputMode="numeric"
                            placeholder="dd/mm/yyyy"
                            value={draftDateTo}
                            onChange={(e) => setDraftDateTo(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-[#F3F4F6] py-2 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            autoComplete="off"
                          />
                          <Calendar
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  className="mt-5 h-11 w-full rounded-lg bg-[#111827] font-semibold text-white hover:bg-[#111827]/90"
                  onClick={() => {
                    setAppliedStatus(draftStatus)
                    setAppliedDateFrom(draftDateFrom)
                    setAppliedDateTo(draftDateTo)
                    const params = new URLSearchParams(searchParams.toString())
                    if (draftStatus === "all") {
                      params.delete("status")
                    } else {
                      params.set("status", draftStatus)
                    }
                    const qs = params.toString()
                    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
                    setFilterPopoverOpen(false)
                  }}
                >
                  Apply
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Card className={cn("overflow-hidden rounded-lg border bg-card", tab === "disapproval" && "border-0 shadow-none bg-background")}>
        <div className="overflow-x-auto">
          {tab === "disapproval" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-[#E8E9E8]">
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Thumbnail</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Seller</th>
                  <SortableHeader label="Upload date" />
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Duration</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Reason for rejection</th>
                </tr>
              </thead>
              <tbody>
                {filteredReels.map((reel) => (
                  <tr
                    key={reel.id}
                    className="border-b border-gray-100 last:border-b-0 transition-colors hover:bg-muted/10"
                  >
                    <td className="px-4 py-3">
                      <ThumbnailWithPlay src={reel.thumbnailSrc} title={reel.title} />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.title}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.seller}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.uploadDate}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.duration}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-md">
                      {reel.rejectReason ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-[#E8E9E8]">
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Thumbnail</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Seller</th>
                  <SortableHeader label="Upload date" />
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Duration</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Status</th>
                  <SortableHeader label="Views" className="text-right" />
                  <th className="px-4 py-3 text-xs font-medium text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReels.map((reel) => (
                  <tr
                    key={reel.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <ThumbnailWithPlay src={reel.thumbnailSrc} title={reel.title} />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.title}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.seller}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.uploadDate}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{reel.duration}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reel.status} rejectReason={reel.rejectReason} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">{reel.views}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
                            <Settings className="h-4 w-4" aria-hidden />
                            Action
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="text-green-600">
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openRejectModal(reel)}
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Dialog
        open={rejectModalOpen}
        onOpenChange={(open) => {
          setRejectModalOpen(open)
          if (!open) {
            setReelToReject(null)
            setRejectReasonText("")
          }
        }}
      >
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center gap-2 border-b px-6 pr-12 py-4">
            <Pencil className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <DialogTitle className="text-base font-semibold">Reason for Rejection</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <textarea
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              placeholder="Add reason for rejection"
              rows={4}
              className="w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Reason for rejection"
            />
          </div>
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button
              onClick={submitRejection}
              className="bg-[#004C5E] text-white hover:bg-[#004C5E]/90"
            >
              Reject Reel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ReelsApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-72 animate-pulse rounded-md bg-muted" aria-hidden />
          <div className="h-[400px] animate-pulse rounded-lg bg-muted" aria-hidden />
        </div>
      }
    >
      <ReelsApprovalPageContent />
    </Suspense>
  )
}
