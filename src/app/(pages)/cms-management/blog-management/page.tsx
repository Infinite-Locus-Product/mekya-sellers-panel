"use client"

import { useMemo, useState, useCallback, useRef, Suspense } from "react"
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
import { Plus, Eye, Pencil, Trash2, Check, ArrowUp, ArrowDown, ArrowUpDown, Upload, FileText, ArrowLeft, Calendar } from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"

type BlogStatus = "published" | "draft"

interface BlogPostRow {
  id: string
  title: string
  subtitle: string
  author: string
  category: string
  publishDate: string
  views: number
  tags: string
  status: BlogStatus
}

const MOCK_BLOG_POSTS: BlogPostRow[] = [
  {
    id: "1",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Seller",
    category: "Buying",
    publishDate: "01-Jan-2025",
    views: 1854,
    tags: "Best Sellers, Fashion Ethnic Wear",
    status: "published",
  },
  {
    id: "2",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Seller",
    category: "Buying",
    publishDate: "01-Jan-2025",
    views: 110,
    tags: "Best Sellers, Fashion Ethnic Wear",
    status: "published",
  },
  {
    id: "3",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Seller",
    category: "Buying",
    publishDate: "01-Jan-2025",
    views: 49,
    tags: "Best Sellers, Fashion Ethnic Wear",
    status: "published",
  },
  {
    id: "4",
    title: "5 Key Advantages of Buying Fashion in Bulk...",
    subtitle:
      "Buying in bulk doesn't mean compromising on quality or variety — not when you're using Mekya. Our platfo...",
    author: "Seller",
    category: "Buying",
    publishDate: "01-Jan-2025",
    views: 48,
    tags: "Best Sellers, Fashion Ethnic Wear",
    status: "published",
  },
]

const BLOG_CATEGORY_OPTIONS = ["Selling", "Buying", "Manufacturing", "Retailer"] as const

const IMAGE_MAX_SIZE_MB = 2
const VIDEO_MAX_SIZE_MB = 80
const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg"
const VIDEO_ACCEPT = "video/mp4"

type SortKey = "publishDate" | "views" | null
type SortDir = "asc" | "desc"

function StatusBadge({ status }: { status: BlogStatus }) {
  if (status !== "published") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
        Draft
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
      Published
    </span>
  )
}

function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentDir,
  onSort,
  className,
}: {
  label: string
  sortKey: SortKey
  currentSortKey: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
  className?: string
}) {
  const isActive = currentSortKey === sortKey
  return (
    <th className={cn("px-4 py-3 text-xs font-medium text-foreground", className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-label={`Sort by ${label} ${isActive ? (currentDir === "asc" ? "ascending" : "descending") : ""}`}
      >
        {label}
        {isActive && currentDir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        ) : isActive && currentDir === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        )}
      </button>
    </th>
  )
}

const TITLE_SUBTITLE_MAX = 80

function TitleCell({ title, subtitle }: { title: string; subtitle: string }) {
  const truncatedSubtitle =
    subtitle.length > TITLE_SUBTITLE_MAX ? `${subtitle.slice(0, TITLE_SUBTITLE_MAX)}...` : subtitle
  return (
    <div className="flex flex-col gap-0.5 min-w-0 max-w-md">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground line-clamp-2">{truncatedSubtitle}</span>
    </div>
  )
}

const INPUT_GRAY = "bg-[#E8E9E8] border-border"

function ScheduleBlogModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("12:00")

  const handleBack = () => onOpenChange(false)
  const handleSchedule = () => {
    // TODO: API call to schedule blog at date/time
    onConfirm()
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
          <DialogTitle className="text-base font-semibold">Schedule Blog for Later</DialogTitle>
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

function CreateBlogPostModal({
  open,
  onOpenChange,
  onScheduleForLater,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScheduleForLater?: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [hyperlinks, setHyperlinks] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setTitle("")
    setCategory("")
    setContent("")
    setTags("")
    setHyperlinks("")
    setFiles([])
    setFileError(null)
  }, [])

  const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type === "video/mp4"
    if (isImage) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) return "Only PNG, JPG allowed"
      if (file.size > IMAGE_MAX_SIZE_MB * 1024 * 1024) return `Image must be under ${IMAGE_MAX_SIZE_MB} MB`
    } else if (isVideo) {
      if (file.size > VIDEO_MAX_SIZE_MB * 1024 * 1024) return `Video must be under ${VIDEO_MAX_SIZE_MB} MB`
    } else {
      return "Only PNG, JPG or MP4 allowed"
    }
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const chosen = e.target.files
    if (!chosen?.length) return
    const next: File[] = []
    for (let i = 0; i < chosen.length; i++) {
      const err = validateFile(chosen[i])
      if (err) {
        setFileError(err)
        e.target.value = ""
        return
      }
      next.push(chosen[i])
    }
    setFiles((prev) => [...prev, ...next])
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setFileError(null)
    const items = e.dataTransfer.files
    if (!items?.length) return
    const next: File[] = []
    for (let i = 0; i < items.length; i++) {
      const err = validateFile(items[i])
      if (err) {
        setFileError(err)
        return
      }
      next.push(items[i])
    }
    setFiles((prev) => [...prev, ...next])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !content.trim() || !tags.trim()) return
    onOpenChange(false)
    resetForm()
    onScheduleForLater?.()
  }

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !content.trim() || !tags.trim()) return
    // TODO: API call to publish blog
    onOpenChange(false)
    resetForm()
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pr-10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
            Create New Blog Post
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 pt-2" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label htmlFor="blog-title" className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="blog-title"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#E8E9E8] border-border"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="blog-category" className="text-sm font-medium text-foreground">
              Category <span className="text-destructive">*</span>
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="blog-category" className="w-full bg-[#E8E9E8] border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="blog-content" className="text-sm font-medium text-foreground">
              Content <span className="text-destructive">*</span>
            </label>
            <textarea
              id="blog-content"
              placeholder="/sale"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="flex w-full rounded-md border border-input bg-[#E8E9E8] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="blog-tags" className="text-sm font-medium text-foreground">
              Tags <span className="text-destructive">*</span>
            </label>
            <Input
              id="blog-tags"
              placeholder="Separate tags with commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#E8E9E8] border-border"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="blog-hyperlinks" className="text-sm font-medium text-foreground">
              Hyperlinks
            </label>
            <Input
              id="blog-hyperlinks"
              placeholder="Enter hyperlinks separated by commas"
              value={hyperlinks}
              onChange={(e) => setHyperlinks(e.target.value)}
              className="w-full bg-[#E8E9E8] border-border"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Add Images or Videos</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
              multiple
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Upload images or videos"
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                isDragging && "border-primary/50 bg-muted/50"
              )}
              aria-label="Upload images or videos"
            >
              <Upload className="h-8 w-8 shrink-0" aria-hidden />
              <span>Click to upload or drag and drop</span>
              <span className="text-xs">
                PNG, JPG up to {IMAGE_MAX_SIZE_MB} MB / Video supported formats mp4 less than {VIDEO_MAX_SIZE_MB}Mb
              </span>
              {fileError && (
                <span className="text-xs font-medium text-destructive mt-1">{fileError}</span>
              )}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {files.map((f, i) => (
                    <span
                      key={`${f.name}-${i}`}
                      className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
                    >
                      {f.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(i)
                        }}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${f.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-between pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={handleSchedule} className="w-full">
              Schedule for later
            </Button>
            <Button type="button" onClick={handlePublish} className="w-full">
              Publish Blog
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BlogManagementPageContent() {
  const searchParams = useSearchParams()
  const urlStatus = searchParams.get("status")

  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)
  const [scheduleBlogModalOpen, setScheduleBlogModalOpen] = useState(false)

  const handleSort = useCallback((key: SortKey) => {
    if (key == null) return
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        return prev
      }
      setSortDir("asc")
      return key
    })
  }, [])

  const effectiveSortDir = useMemo(() => {
    if (sortKey == null) return "asc"
    return sortDir
  }, [sortKey, sortDir])

  const sortedPosts = useMemo(() => {
    const list = [...MOCK_BLOG_POSTS]
    if (sortKey == null) return list
    list.sort((a, b) => {
      if (sortKey === "publishDate") {
        const aTime = new Date(a.publishDate).getTime()
        const bTime = new Date(b.publishDate).getTime()
        return effectiveSortDir === "asc" ? aTime - bTime : bTime - aTime
      }
      if (sortKey === "views") {
        return effectiveSortDir === "asc"
          ? a.views - b.views
          : b.views - a.views
      }
      return 0
    })
    return list
  }, [sortKey, effectiveSortDir])

  const displayedPosts = useMemo(() => {
    if (urlStatus === "published" || urlStatus === "draft") {
      return sortedPosts.filter((p) => p.status === urlStatus)
    }
    return sortedPosts
  }, [sortedPosts, urlStatus])

  const handleCreatePost = useCallback(() => {
    setCreatePostModalOpen(true)
  }, [])

  const handleView = useCallback((post: BlogPostRow) => {
    // TODO: open view/preview modal
  }, [])

  const handleEdit = useCallback((post: BlogPostRow) => {
    // TODO: open edit modal or navigate to edit page
  }, [])

  const handleDelete = useCallback((post: BlogPostRow) => {
    // TODO: confirm and delete
  }, [])

  return (
    <div className="space-y-6">
      <ScheduleBlogModal
        open={scheduleBlogModalOpen}
        onOpenChange={setScheduleBlogModalOpen}
        onConfirm={() => {
          setScheduleBlogModalOpen(false)
          setCreatePostModalOpen(false)
        }}
      />
      <CreateBlogPostModal
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
        onScheduleForLater={() => setScheduleBlogModalOpen(true)}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blog Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage blog content</p>
        </div>
        <Button type="button" onClick={handleCreatePost} className="shrink-0 w-fit">
          <Plus className="h-4 w-4 mr-2" aria-hidden />
          Create Blog
        </Button>
      </div>

      <Card className="overflow-hidden rounded-lg border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b border-border bg-[#E8E9E8]">
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Author</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Category</th>
                  <SortableHeader
                    label="Publish Date"
                    sortKey="publishDate"
                    currentSortKey={sortKey}
                    currentDir={effectiveSortDir}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Views"
                    sortKey="views"
                    currentSortKey={sortKey}
                    currentDir={effectiveSortDir}
                    onSort={handleSort}
                    className="text-right"
                  />
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Tags</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <TitleCell title={post.title} subtitle={post.subtitle} />
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{post.author}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{post.category}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{post.publishDate}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-right tabular-nums">
                      {formatNumber(post.views)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                      {post.tags}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="View post"
                          onClick={() => handleView(post)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label="Edit post"
                          onClick={() => handleEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete post"
                          onClick={() => handleDelete(post)}
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

export default function BlogManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-56 animate-pulse rounded-md bg-muted" aria-hidden />
          <div className="h-[360px] animate-pulse rounded-lg bg-muted" aria-hidden />
        </div>
      }
    >
      <BlogManagementPageContent />
    </Suspense>
  )
}
