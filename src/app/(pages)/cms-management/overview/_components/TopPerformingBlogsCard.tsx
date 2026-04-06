"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LayoutList } from "lucide-react"
import { TopBlogItem } from "./TopBlogItem"

export interface TopBlogEntry {
  imageSrc: string
  imageAlt?: string
  title: string
  views: number
}

export interface TopPerformingBlogsCardProps {
  title?: string
  subtitle?: string
  blogs: TopBlogEntry[]
  className?: string
}

export function TopPerformingBlogsCard({
  title = "Top Performing Blogs",
  subtitle = "Monitor recent activity in real-time",
  blogs,
  className,
}: TopPerformingBlogsCardProps) {
  return (
    <Card className={cn("bg-muted/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <LayoutList className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-muted/30 rounded-b-lg">
        <ul className="space-y-3" role="list">
          {blogs.map((blog, index) => (
            <li key={`${blog.title}-${index}`}>
              <TopBlogItem
                imageSrc={blog.imageSrc}
                imageAlt={blog.imageAlt}
                title={blog.title}
                views={blog.views}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
