"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useCallback } from "react"
import { ChevronUp, List, RotateCcw, Palette } from "lucide-react"
import Image from "next/image"
import {
  DashboardIcon,
  UserManagementIcon,
  OrderManagementIcon,
  CmsManagementIcon,
  BannerIcon,
  ReelsIcon,
  BlogManagementIcon,
  ContributorsIcon,
  ProfileIcon,
} from "@/assets/icons/sidebar"

/** Main app navigation: fixed sidebar with expandable sections for Order Management and CMS. */
interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}

const iconClass = "h-5 w-5 shrink-0"

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Product Listing", href: "/user-management", icon: UserManagementIcon },
  {
    label: "Order Management",
    href: "/order-management",
    icon: OrderManagementIcon,
    subItems: [
      { label: "All Orders", href: "/order-management", icon: List },
      { label: "Returns & Exchanges", href: "/order-management/returns", icon: RotateCcw },
      { label: "Custom Orders", href: "/order-management/custom-orders", icon: Palette },
    ],
  },
  {
    label: "CMS Management",
    href: "/cms-management",
    icon: CmsManagementIcon,
    subItems: [
      { label: "Overview", href: "/cms-management/overview", icon: BannerIcon },
      { label: "Banner Management", href: "/cms-management/banner-management", icon: BannerIcon },
      { label: "Reels Approval", href: "/cms-management/reels-approval", icon: ReelsIcon },
      { label: "Blog Management", href: "/cms-management/blog-management", icon: BlogManagementIcon },
      { label: "Contributors", href: "/cms-management/contributors", icon: ContributorsIcon },
    ],
  },
  { label: "Profile", href: "/profile", icon: ProfileIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["/order-management"])

  const toggleExpanded = useCallback((href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [href]
    )
  }, [])

  const isItemExpanded = (href: string) => expandedItems.includes(href)

  const isSubItemActive = useCallback(
    (subItemHref: string) => {
      if (pathname === subItemHref) return true
      if (subItemHref === "/order-management" || subItemHref === "/cms-management") return false
      return pathname.startsWith(`${subItemHref}/`)
    },
    [pathname]
  )

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-[var(--neutral-light)]/30">
      <div className="flex h-full flex-col">
        <div className="border-b pt-6 pb-4 pl-4 pr-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo/mekyalogo.png"
              alt="Mekya Seller Dashboard"
              width={24}
              height={24}
              className="shrink-0 opacity-100"
              style={{ transform: "rotate(0deg)" }}
            />
            <span
              className="font-semibold text-[#004C5E]"
              
            >
              Mekya Seller Dashboard
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isExpanded = hasSubItems && isItemExpanded(item.href)
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <div key={item.href} className="space-y-1">
                {hasSubItems ? (
                  <>
                    <div
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#E8E9E8] shadow-sm"
                          : ""
                      )}
                    >
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.href)}
                        className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                        aria-expanded={isExpanded}
                      >
                        <ChevronUp
                          className={cn(
                            "h-3.5 w-3.5 text-foreground transition-transform",
                            isExpanded ? "rotate-0" : "rotate-180"
                          )}
                        />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="ml-4 space-y-0.5 border-l-2 border-gray-200/60 pl-4">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = isSubItemActive(subItem.href)

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isSubActive
                                  ? "bg-[#E8E9E8] text-foreground"
                                  : ""
                              )}
                            >
                              <SubIcon className="h-5 w-5" />
                              <span>{subItem.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#E8E9E8] text-foreground shadow-sm"
                          : ""
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
