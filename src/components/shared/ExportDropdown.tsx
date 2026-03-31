"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ExportDropdownProps {
 
  onExportPDF?: () => void;
 
  onExportCSV?: () => void;
  
  variant?: "default" | "outline" | "ghost" | "secondary";
 
  size?: "default" | "sm" | "lg" | "icon";
  
  className?: string;

  showIcon?: boolean;
}

export function ExportDropdown({
  onExportPDF,
  onExportCSV,
  variant = "outline",
  size = "lg",
  className,
  showIcon = true,
}: ExportDropdownProps) {
  const hasAnyExport = onExportPDF || onExportCSV;

  if (!hasAnyExport) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className || ""}`}
        >
          {showIcon && <Download className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onExportPDF && (
          <DropdownMenuItem
            onClick={onExportPDF}
            className="cursor-pointer focus:bg-accent"
          >
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Export PDF</span>
          </DropdownMenuItem>
        )}
        {onExportCSV && (
          <DropdownMenuItem
            onClick={onExportCSV}
            className="cursor-pointer focus:bg-accent"
          >
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Export CSV</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
