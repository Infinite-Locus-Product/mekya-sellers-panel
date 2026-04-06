"use client"

import { useState, useRef, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Eye, Pencil, Trash2, Link2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { BannerImageIcon } from "@/assets/icons"

const PLACEMENT_OPTIONS = [
  "Homepage",
  "Men’s Category Page",
  "Women’s Category Page",
  "Kid’s Category Page",
  "Product Page",
  "Checkout Page"
] as const

type BannerStatus = "active" | "inactive"

interface BannerRow {
  id: string
  previewSrc: string | null
  title: string
  urlPath: string
  placement: string
  status: BannerStatus
  description?: string
}

const MOCK_BANNERS: BannerRow[] = [
  {
    id: "1",
    previewSrc: "/images/banner1.png",
    title: "Summer Sale 2024",
    urlPath: "mekya/home/summer-sale",
    placement: "Homepage",
    status: "active",
  },
  {
    id: "2",
    previewSrc: "/images/banner1.png",
    title: "Category Hero",
    urlPath: "mekya/category/women",
    placement: "Category Page",
    status: "active",
  },
  {
    id: "3",
    previewSrc: "/images/banner1.png",
    title: "Product Spotlight - Women",
    urlPath: "mekya/product/women-banner",
    placement: "Product Page - Women",
    status: "inactive",
  },
  {
    id: "4",
    previewSrc: "/images/banner1.png",
    title: "Wishlist Promo",
    urlPath: "mekya/wishlist/banner",
    placement: "Wishlist",
    status: "active",
  },
  {
    id: "5",
    previewSrc: "/images/banner1.png",
    title: "Men's Collection",
    urlPath: "mekya/product/men-banner",
    placement: "Product Page - Men",
    status: "inactive",
  },
  {
    id: "6",
    previewSrc: "/images/banner1.png",
    title: "Kids - Boys",
    urlPath: "mekya/product/kids-boys",
    placement: "Product Page - Kids - Boys",
    status: "active",
  },
  {
    id: "7",
    previewSrc: "/images/banner1.png",
    title: "Kids - Girls",
    urlPath: "mekya/product/kids-girl",
    placement: "Product Page - Kids - Girl",
    status: "active",
  },
]

function StatusPill({ status }: { status: BannerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-muted text-muted-foreground"
      )}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  )
}

function PreviewThumb({ src, title }: { src: string | null; title: string }) {
  return (
    <div className="h-10 w-[60px] shrink-0 overflow-hidden rounded-md border border-border bg-muted">
      {src ? (
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="h-full w-full bg-gradient-to-r from-blue-400/80 to-purple-500/80"
          aria-hidden
        />
      )}
    </div>
  )
}

/** Banner image shown in preview modal (eye) and as default in edit modal. */
const BANNER_DISPLAY_IMAGE = "/images/denimsbanner.png"

function BannerPreviewModal({
  banner,
  open,
  onOpenChange,
  onEdit,
}: {
  banner: BannerRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (banner: BannerRow) => void
}) {
  if (!banner) return null

  const imageSrc = BANNER_DISPLAY_IMAGE

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,92vh)] w-[calc(100vw-1.5rem)] max-w-4xl flex-col overflow-hidden rounded-sm border bg-white p-0 sm:w-[calc(100vw-2rem)]">
        <DialogHeader className="mb-0 shrink-0 space-y-0 border-0 px-3 pb-2 pt-4 pr-12 sm:px-4 sm:pr-14">
          <DialogTitle className="flex items-center gap-2 text-left text-base font-semibold">
            <BannerImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="line-clamp-2">{banner.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-4">
          <div className="w-full overflow-hidden rounded-sm bg-white pb-2">
            <img
              src={imageSrc}
              alt={banner.title}
              className="mx-auto h-auto max-h-[min(42vh,360px)] w-full object-contain sm:max-h-[min(58vh,520px)] md:max-h-[70vh]"
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 border-t border-border  px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
          <p className="text-sm text-muted-foreground">
            Placement - {banner.placement}
          </p>
          <Button
            variant="default"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              onOpenChange(false)
              onEdit?.(banner)
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            EDIT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddBannerModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [placement, setPlacement] = useState<string>("")
  const [linkUrl, setLinkUrl] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !placement) return
    // TODO: API call to create banner
    onOpenChange(false)
    setTitle("")
    setPlacement("")
    setLinkUrl("")
    setDescription("")
    setFile(null)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setTitle("")
    setPlacement("")
    setLinkUrl("")
    setDescription("")
    setFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0]
    if (chosen && (chosen.type === "image/png" || chosen.type === "image/jpeg") && chosen.size <= 2 * 1024 * 1024) {
      setFile(chosen)
    }
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const chosen = e.dataTransfer.files?.[0]
    if (chosen && (chosen.type === "image/png" || chosen.type === "image/jpeg") && chosen.size <= 2 * 1024 * 1024) {
      setFile(chosen)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,90vh)] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto">
        <DialogHeader className="space-y-0 pr-10 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold leading-tight">
            <BannerImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            Add Banner
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="banner-title" className="text-sm font-medium text-foreground">
              Title <span className="text-destructive text-red-500">*</span>
            </label>
            <Input
              id="banner-title"
              placeholder="Enter banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="banner-description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="banner-description"
              placeholder="add description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="banner-link" className="text-sm font-medium text-foreground">
              Link URL
            </label>
            <Input
              id="banner-link"
              placeholder="/sale"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="banner-placement" className="text-sm font-medium text-foreground">
              Placement <span className="text-destructive">*</span>
            </label>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger id="banner-placement" className="w-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                {PLACEMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Banner Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Upload banner image"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isDragging && "border-primary/50 bg-muted/50"
              )}
            >
              <Upload className="h-8 w-8 shrink-0" aria-hidden />
              <span>Click to upload or drag and drop</span>
              <span className="text-xs">PNG, JPG up to 2 MB</span>
              {file && (
                <span className="text-xs font-medium text-foreground mt-1">
                  {file.name}
                </span>
              )}
            </button>
          </div>
          <div className="flex gap-2 w-full pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Create Banner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditBannerModal({
  banner,
  open,
  onOpenChange,
}: {
  banner: BannerRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,92vh)] w-[calc(100vw-1.5rem)] max-w-5xl flex-col overflow-hidden rounded-lg border bg-background p-0 sm:w-[calc(100vw-2rem)]">
        <DialogHeader className="mb-0 shrink-0 space-y-0 border-0 px-3 pb-2 pt-4 sm:px-4">
          <DialogTitle className="flex items-center gap-2 pr-8 text-lg font-semibold sm:pr-10">
            <BannerImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            Edit Banner
          </DialogTitle>
        </DialogHeader>
        {open && banner ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EditBannerFormContent key={banner.id} banner={banner} onOpenChange={onOpenChange} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function EditBannerFormContent({
  banner,
  onOpenChange,
}: {
  banner: BannerRow
  onOpenChange: (open: boolean) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rename, setRename] = useState(banner.title)
  const [linkUrl, setLinkUrl] = useState(banner.urlPath)
  const [placement, setPlacement] = useState<string>(banner.placement)
  const [description, setDescription] = useState(banner.description ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const filePreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    }
  }, [filePreviewUrl])

  const previewImageSrc = filePreviewUrl ?? BANNER_DISPLAY_IMAGE

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rename.trim() || !placement) return
    // TODO: API call to update banner
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0]
    if (chosen && (chosen.type === "image/png" || chosen.type === "image/jpeg") && chosen.size <= 2 * 1024 * 1024) {
      if (file) URL.revokeObjectURL(URL.createObjectURL(file))
      setFile(chosen)
    }
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const chosen = e.dataTransfer.files?.[0]
    if (chosen && (chosen.type === "image/png" || chosen.type === "image/jpeg") && chosen.size <= 2 * 1024 * 1024) {
      if (file) URL.revokeObjectURL(URL.createObjectURL(file))
      setFile(chosen)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-4 pb-4">
            <div className="w-full overflow-hidden rounded-md border border-border bg-muted/30">
              <img
                src={previewImageSrc}
                alt={banner.title}
                className="h-auto max-h-[200px] w-full object-contain sm:max-h-[260px] md:max-h-[280px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-rename" className="text-sm font-medium text-foreground">
                  Rename
                </label>
                <Input
                  id="edit-rename"
                  value={rename}
                  onChange={(e) => setRename(e.target.value)}
                  placeholder="Banner name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-link" className="text-sm font-medium text-foreground">
                  Link URL
                </label>
                <Input
                  id="edit-link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/sale"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  placeholder="add description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-placement" className="text-sm font-medium text-foreground">
                  Placement <span className="text-destructive">*</span>
                </label>
                <Select value={placement} onValueChange={setPlacement}>
                  <SelectTrigger id="edit-placement" className="w-full">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Replace Banner</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Replace banner image"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[140px]",
                    isDragging && "border-primary/50 bg-muted/50"
                  )}
                >
                  <Upload className="h-8 w-8 shrink-0" aria-hidden />
                  <span>Click to upload or drag and drop</span>
                  <span className="text-xs">PNG, JPG up to 2 MB</span>
                  {file && (
                    <span className="text-xs font-medium text-foreground mt-1">
                      {file.name}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-4 py-4 bg-muted/20">
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
  )
}

function BannerManagementPageContent() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")
  const filteredBanners = useMemo(() => {
    if (statusParam === "active" || statusParam === "inactive") {
      return MOCK_BANNERS.filter((b) => b.status === statusParam)
    }
    return MOCK_BANNERS
  }, [statusParam])

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [previewBanner, setPreviewBanner] = useState<BannerRow | null>(null)
  const [editBanner, setEditBanner] = useState<BannerRow | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-medium text-foreground">Banner Management</h1>
            <p className="text-xs text-muted-foreground">Update and manage website banners</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Banner
          </Button>
        </div>
      </div>

      <AddBannerModal open={addModalOpen} onOpenChange={setAddModalOpen} />

      <BannerPreviewModal
        banner={previewBanner}
        open={!!previewBanner}
        onOpenChange={(open) => !open && setPreviewBanner(null)}
        onEdit={(b) => {
          setPreviewBanner(null)
          setEditBanner(b)
        }}
      />

      <EditBannerModal
        banner={editBanner}
        open={!!editBanner}
        onOpenChange={(open) => !open && setEditBanner(null)}
      />

      <Card className="overflow-hidden rounded-lg border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-[#E8E9E8]">
                  <th className="px-4 py-3 text-xs  text-foreground">
                    Preview
                  </th>
                  <th className="px-4 py-3 text-xs ">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs  text-foreground">
                    Placement
                  </th>
                  <th className="px-4 py-3 text-xs  text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs  text-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="border-b border-border last:border-b-0 transition-colors "
                  >
                    <td className="px-4 py-3">
                      <PreviewThumb
                        src={banner.previewSrc}
                        title={banner.title}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs  text-foreground">
                          {banner.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Link2 className="h-3 w-3 shrink-0" aria-hidden />
                          {banner.urlPath}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {banner.placement}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={banner.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="View banner"
                          onClick={() => setPreviewBanner(banner)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="Edit banner"
                          onClick={() => setEditBanner(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete banner"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BannerManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" aria-hidden />
          <div className="h-[320px] animate-pulse rounded-lg bg-muted" aria-hidden />
        </div>
      }
    >
      <BannerManagementPageContent />
    </Suspense>
  )
}
