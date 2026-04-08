"use client"

import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ExportDropdownProps {
  onExportPDF?: () => void
  onExportCSV?: () => void
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
}

export function ExportDropdown({
  onExportPDF,
  onExportCSV,
  variant = "outline",
  size = "lg",
  className,
  showIcon = true,
}: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={["gap-2", className].filter(Boolean).join(" ")}>
          {showIcon && <Download className="h-4 w-4" aria-hidden />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={onExportPDF}
          disabled={!onExportPDF}
          className="cursor-pointer focus:bg-accent"
        >
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span>Export PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onExportCSV}
          disabled={!onExportCSV}
          className="cursor-pointer focus:bg-accent"
        >
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span>Export CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
