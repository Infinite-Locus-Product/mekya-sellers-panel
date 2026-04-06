"use client"

import { formatNumber } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusVariant } from "@/components/shared/StatusBadge"
import { Pencil, FileDown } from "lucide-react"
import type { CustomOrder } from "@/lib/data"

interface RequirementRow {
  product: string
  sku: string
  quantity: number
  price: string
  total: string
}

interface CustomizationRequestDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: CustomOrder | null
}

// Extended mock data for modal (in real app would come from API)
const getModalDetail = (order: CustomOrder | null) => {
  if (!order) return null
  const contactMap: Record<string, string> = {
    "Rajesh Kumar": "Rajesh Kumar",
    "ABC Retailers Pvt Ltd": "Manas Singh",
    "XYZ Store": "Priya Sharma",
    "Test Vendor": "Amit Verma",
    "Sample Store": "Sneha Patel",
    "Demo Vendor": "Vikram Rao",
  }
  return {
    contactPerson: contactMap[order.vendor] ?? "—",
    uploadedFiles: ["RelianceLogo.png", "Specifications.pdf"],
    packagingPreferences: "Individual packaging with company branding",
    requirementRows: [
      { product: "Navy Blue Polo", sku: "POLO-NV-001", quantity: 1500, price: "₹370", total: "₹5,55,000" },
      { product: "Logo Print", sku: "PRINT-01", quantity: 1, price: "₹3,498", total: "₹3,498" },
    ] as RequirementRow[],
  }
}

const statusToVariant: Record<CustomOrder["customizationStatus"], StatusVariant> = {
  "In Process": "processing",
  Fulfilled: "delivered",
  "Pending Further information": "pending",
}

export function CustomizationRequestDetailModal({
  open,
  onOpenChange,
  order,
}: CustomizationRequestDetailModalProps) {
  const detail = order ? getModalDetail(order) : null
  const displayDate = order?.date?.split(",")[0] ?? order?.date ?? "—"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2">
            Customization Requests
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </DialogTitle>
        </DialogHeader>

        {order && detail && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Vendor Name</p>
                <p className="font-medium text-foreground">{order.vendor}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Contact Person</p>
                <p className="font-medium text-foreground">{detail.contactPerson}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Current Status</p>
                <StatusBadge variant={statusToVariant[order.customizationStatus] ?? "pending"}>
                  {order.customizationStatus}
                </StatusBadge>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Order Date</p>
                <p className="font-medium text-foreground">{displayDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Order Value</p>
                <p className="font-medium text-foreground">{order.orderValue}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Customization Requirements</h3>
              <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-sm text-foreground">
                {order.requirements}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Uploaded Files</h3>
              <div className="flex flex-wrap gap-2">
                {detail.uploadedFiles.map((file) => (
                  <Button
                    key={file}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-[#F3F4F6] border-[#E5E7EB]"
                  >
                    <FileDown className="h-4 w-4" />
                    {file}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Packaging Preferences</h3>
              <div className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-sm text-foreground">
                {detail.packagingPreferences}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Requirement</h3>
              <div className="rounded-md border border-[#E5E7EB] overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#E8E9E8] text-muted-foreground">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-left p-3 font-medium">SKU</th>
                      <th className="text-right p-3 font-medium">Quantity</th>
                      <th className="text-right p-3 font-medium">Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.requirementRows.map((row) => (
                      <tr key={`${row.sku}-${row.product}`} className="border-t border-[#E5E7EB]">
                        <td className="p-3 text-foreground">{row.product}</td>
                        <td className="p-3 text-foreground">{row.sku}</td>
                        <td className="p-3 text-right text-foreground">{formatNumber(row.quantity)}</td>
                        <td className="p-3 text-right text-foreground">{row.price}</td>
                        <td className="p-3 text-right text-foreground">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
