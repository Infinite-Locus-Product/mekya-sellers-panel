/**
 * CMS data layer. API-ready: replace with fetch when backend is integrated.
 */

export interface CmsSection {
  id: string;
  title: string;
  description: string;
  href: string;
  stats: string;
}

export interface CmsOverviewStats {
  totalPages: number;
  totalPagesChange: string;
  activeBanners: number;
  activeBannersChange: string;
  pendingReels: number;
  pendingReelsChange: string;
  publishedBlogs: number;
  publishedBlogsChange: string;
  contributors: number;
  contributorsChange: string;
}

export interface RecentActivityEntry {
  type: "image" | "blog" | "video";
  title: string;
  status: string;
  timeAgo: string;
}

export interface TopBlogEntry {
  imageSrc: string;
  title: string;
  views: number;
}

const mockSections: CmsSection[] = [
  { id: "overview", title: "Overview", description: "Dashboard overview of all CMS activities", href: "/cms-management/overview", stats: "24 pages, 8 banners, 12 reels" },
  { id: "banners", title: "Banner Management", description: "Manage website banners and promotional content", href: "/cms-management/banner-management", stats: "8 active banners" },
  { id: "reels", title: "Reels Approval", description: "Review and approve video content submissions", href: "/cms-management/reels-approval", stats: "12 pending approvals" },
  { id: "blogs", title: "Blog Management", description: "Create and manage blog posts and articles", href: "/cms-management/blog-management", stats: "156 published posts" },
  { id: "contributors", title: "Contributors", description: "Manage content creators and contributors", href: "/cms-management/contributors", stats: "8 active contributors" },
];

const mockRecentActivities: RecentActivityEntry[] = [
  { type: "image", title: "Summer Sale Banner", status: "Published", timeAgo: "2 hours ago" },
  { type: "blog", title: "Top 10 Summer Trends", status: "Published", timeAgo: "6 hours ago" },
  { type: "video", title: "Product Showcase Reel", status: "Approved", timeAgo: "4 hours ago" },
  { type: "blog", title: "Sustainable Fashion Guide", status: "Submitted for Review", timeAgo: "1 day ago" },
  { type: "image", title: "Summer Sale Banner", status: "Published", timeAgo: "2 hours ago" },
  { type: "video", title: "Product Showcase Reel", status: "Approved", timeAgo: "4 hours ago" },
];

const mockTopBlogs: TopBlogEntry[] = [
  { imageSrc: "/images/cms1.jpg", title: "Complete Guide to Sustainable Fashion", views: 12500 },
  { imageSrc: "/images/cms2.jpg", title: "Complete Guide to Sustainable Fashion", views: 12500 },
  { imageSrc: "/images/cms3.jpg", title: "Complete Guide to Sustainable Fashion", views: 12500 },
  { imageSrc: "/images/cms4.jpg", title: "Complete Guide to Sustainable Fashion", views: 12500 },
  { imageSrc: "/images/cms5.jpg", title: "Complete Guide to Sustainable Fashion", views: 12500 },
];

export interface CmsLandingData {
  sections: CmsSection[];
  totalPages: number;
  totalPagesChange: string;
  activeBanners: number;
  activeBannersChange: string;
  pendingReels: number;
  pendingReelsChange: string;
  publishedBlogs: number;
  publishedBlogsChange: string;
}

export async function getCmsLandingData(): Promise<CmsLandingData> {
  return Promise.resolve({
    sections: mockSections,
    totalPages: 24,
    totalPagesChange: "+2 from last month",
    activeBanners: 8,
    activeBannersChange: "3 scheduled",
    pendingReels: 12,
    pendingReelsChange: "Awaiting approval",
    publishedBlogs: 156,
    publishedBlogsChange: "+12 this week",
  });
}

export async function getCmsOverviewData(): Promise<{
  stats: CmsOverviewStats;
  recentActivities: RecentActivityEntry[];
  topBlogs: TopBlogEntry[];
}> {
  return Promise.resolve({
    stats: {
      totalPages: 24,
      totalPagesChange: "+2 from last month",
      activeBanners: 8,
      activeBannersChange: "3 scheduled",
      pendingReels: 12,
      pendingReelsChange: "Awaiting approval",
      publishedBlogs: 156,
      publishedBlogsChange: "+12 this week",
      contributors: 8,
      contributorsChange: "Active",
    },
    recentActivities: mockRecentActivities,
    topBlogs: mockTopBlogs,
  });
}
