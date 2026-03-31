import { ReactNode } from "react"
import clsx from "clsx"

interface IconWrapperProps {
  icon: ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
}

export function IconWrapper({ icon, size = "md", className }: IconWrapperProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full ",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-10 w-10",
        size === "lg" && "h-12 w-12",
        className
      )}
      style={{
        background: "linear-gradient(180deg,rgb(245, 242, 242) 0%, rgba(189, 189, 189, 0.73) 100%)",
      }}
    >
      {icon}
    </div>
  )
}
