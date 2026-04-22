"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  /** Display label for the segment */
  label: string;
  /** Optional href; when omitted, the item is rendered as current (non-link) */
  href?: string;
}

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb segments. Last item is typically the current page (no href). */
  items: readonly BreadcrumbItem[];
  /** Optional separator between items. Default: ">" */
  separator?: React.ReactNode;
  /** Optional class name for the root nav element */
  className?: string;
}

const DEFAULT_SEPARATOR = ">";

export function Breadcrumb({ items, separator = DEFAULT_SEPARATOR, className }: Readonly<BreadcrumbProps>) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-xs min-[1920px]:gap-2 min-[1920px]:text-sm",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const href = item.href;
        const isLink = !isLast && href != null;

        return (
          <span key={`breadcrumb-${index}-${item.label}`} className="flex items-center gap-2">
            {index > 0 && (
              <span
                className="text-muted-foreground select-none"
                aria-hidden
              >
                {separator}
              </span>
            )}
            {isLink && href ? (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-foreground",
                  isLast && "font-medium"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
