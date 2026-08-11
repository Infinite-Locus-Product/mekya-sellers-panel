"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react"
import { ChevronUp, Package, Warehouse } from "lucide-react"
import Image from "next/image"
import {
  CmsAnalyticsIcon,
  CmsManagementIcon,
  CmsReelsLibraryIcon,
  DashboardIcon,
  OrderManagementIcon,
  ProfileIcon,
} from "@/assets/icons/sidebar"

/** Main app navigation: fixed sidebar with expandable Product Listing section. */
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

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Product Listing", href: "/product-listing", icon: Package },
  {
    label: "Order Management",
    href: "/order-management",
    icon: OrderManagementIcon,
    subItems: [
      { label: "B2C Orders", href: "/order-management/b2c", icon: OrderManagementIcon },
      { label: "B2B Orders", href: "/order-management/b2b", icon: Package },
    ],
  },
  { label: "Warehouse", href: "/inventory", icon: Warehouse },
  {
    label: "CMS Management",
    href: "/cms-management",
    icon: CmsManagementIcon,
    subItems: [
      {
        label: "Reels Library",
        href: "/cms-management/reels",
        icon: CmsReelsLibraryIcon,
      },
      {
        label: "Analytics",
        href: "/cms-management/analytics",
        icon: CmsAnalyticsIcon,
      },
    ],
  },
  { label: "Profile", href: "/profile", icon: ProfileIcon },
]

/** Expand the parent nav group whose route matches the current path (including nested routes). */
function expandedHrefsForPathname(pathname: string): string[] {
  for (const item of navItems) {
    if (!item.subItems?.length) continue
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return [item.href]
    }
  }
  return []
}

const ORDER_MANAGEMENT_DETAIL_PATH = /^\/order-management\/([^/]+)$/

/** True when pathname is `/order-management/<orderId>` (not list routes b2b / b2c). */
function isOrderDetailPathname(pathname: string): boolean {
  const match = ORDER_MANAGEMENT_DETAIL_PATH.exec(pathname)
  if (!match) return false
  const first = match[1]
  return first !== "b2b" && first !== "b2c"
}

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    expandedHrefsForPathname(pathname)
  )

  useEffect(() => {
    setExpandedItems(expandedHrefsForPathname(pathname))
  }, [pathname])

  const toggleExpanded = useCallback((href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [href]
    )
  }, [])

  const isItemExpanded = (href: string) => expandedItems.includes(href)

  const isSubItemActive = useCallback(
    (subItemHref: string) => {
      if (pathname === subItemHref) return true
      if (subItemHref === "/product-listing") return false
      const listSegment = searchParams.get("segment")
      const onOrderDetail = isOrderDetailPathname(pathname)

      if (subItemHref === "/order-management/b2c") {
        if (pathname === "/order-management/b2c") return true
        if (pathname.startsWith("/order-management/b2b")) return false
        if (onOrderDetail) {
          return listSegment !== "b2b"
        }
        return false
      }
      if (subItemHref === "/order-management/b2b") {
        if (pathname === "/order-management/b2b" || pathname.startsWith("/order-management/b2b/")) {
          return true
        }
        if (onOrderDetail && listSegment === "b2b") return true
        return false
      }
      return pathname.startsWith(`${subItemHref}/`)
    },
    [pathname, searchParams]
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
              className="h-5 w-5 shrink-0 opacity-100 min-[1920px]:h-6 min-[1920px]:w-6"
              style={{ transform: "rotate(0deg)" }}
            />
            <span
              className={cn(
                "font-mekya-brand text-sm font-extrabold tracking-tight text-[#004C5E] min-[1920px]:text-base"
              )}
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
                        isActive ? "bg-[#E8E9E8] shadow-sm" : ""
                      )}
                    >
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <Icon className="h-4 w-4 shrink-0 min-[1920px]:h-5 min-[1920px]:w-5" />
                        <span>{item.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.href)}
                        className="flex size-5 items-center justify-center rounded bg-gray-100 transition-colors hover:bg-gray-200 min-[1920px]:size-6"
                        aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                        aria-expanded={isExpanded}
                      >
                        <ChevronUp
                          className={cn(
                            "size-3 text-foreground transition-transform min-[1920px]:size-3.5",
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
                                isSubActive ? "bg-[#E8E9E8] text-foreground" : ""
                              )}
                            >
                              <SubIcon className="h-4 w-4 shrink-0 min-[1920px]:h-5 min-[1920px]:w-5" />
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
                      isActive ? "bg-[#E8E9E8] text-foreground shadow-sm" : ""
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 min-[1920px]:h-5 min-[1920px]:w-5" />
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
