"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, BookOpen, Users, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CmsLandingData } from "@/lib/data";

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: BarChart3,
  banners: Image,
  reels: Video,
  blogs: BookOpen,
  contributors: Users,
};

export interface CMSManagementClientProps {
  data: CmsLandingData;
}

export function CMSManagementClient({ data }: CMSManagementClientProps) {
  const {
    sections,
    totalPages,
    totalPagesChange,
    activeBanners,
    activeBannersChange,
    pendingReels,
    pendingReelsChange,
    publishedBlogs,
    publishedBlogsChange,
  } = data;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">CMS Management</h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPages}</div>
              <p className="text-xs text-muted-foreground">{totalPagesChange}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBanners}</div>
              <p className="text-xs text-muted-foreground">{activeBannersChange}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reels</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReels}</div>
              <p className="text-xs text-muted-foreground">{pendingReelsChange}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Blogs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedBlogs}</div>
              <p className="text-xs text-muted-foreground">{publishedBlogsChange}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">CMS Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => {
              const Icon = SECTION_ICONS[section.id] ?? BarChart3;
              return (
                <Card key={section.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" aria-hidden />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{section.stats}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                    <Link href={section.href}>
                      <Button className="w-full">
                        Manage {section.title}
                        <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-medium">New blog post published</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-medium">Banner updated for homepage</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-medium">3 reels pending approval</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
