"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import { ExportPdfIcon } from "@/assets/icons"
import type { StatusVariant } from "@/components/shared/StatusBadge"
import { CustomerInformationSection } from "./order-details/CustomerInformationSection"
import { FulfillmentTimelineSection } from "./order-details/FulfillmentTimelineSection"
import { OrderItemSection } from "./order-details/OrderItemSection"
import { OrderStatusSection } from "./order-details/OrderStatusSection"
import { PaymentInformationSection } from "./order-details/PaymentInformationSection"
import type { OrderDetailsData } from "./order-details/types"

export type {
  OrderItem,
  FulfillmentTimelineItem,
  CustomerInfo,
  PaymentInfo,
  B2BBundleKind,
  B2BIncludedLine,
  B2BConfigurationDisplay,
  B2BOrderLineDisplay,
  B2BFulfillmentStats,
  B2BPartialColorRow,
  OrderDetailsData,
} from "./order-details/types"

interface OrderDetailsProps {
  order: OrderDetailsData
  onStatusUpdate?: (orderId: string, status: StatusVariant, notes: string) => void
  onExportPDF?: (orderId: string) => void
  onSendUpdate?: (orderId: string) => void
}

export function OrderDetails({ order, onStatusUpdate, onExportPDF, onSendUpdate }: Readonly<OrderDetailsProps>) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<StatusVariant>(order.status)
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "")

  const handleStatusUpdate = () => {
    onStatusUpdate?.(order.id, selectedStatus, adminNotes)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="flex items-center gap-2"
              aria-label="Back"
            >
              <div className="flex items-center ml-24 hover:bg-gray-100 rounded-md px-4 py-2">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span className="ml-2 text-base font-medium  py-1 cursor-pointer">Back to Orders</span>
              </div>
            </Button>
          </div>
          <div className="items-center gap-2 py-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-normal text-foreground">Order {order.id}</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {order.placedDate}, {order.placedTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm flex items-center gap-2 cursor-pointer rounded-md px-4 py-2 bg-[#E8E9E8]"
            onClick={() => onExportPDF?.(order.id)}
          >
            <ExportPdfIcon className="shrink-0" aria-hidden />
            Export PDF
          </button>
          <Button
            variant="default"
            size="lg"
            className="gap-2 bg-black text-white hover:bg-gray-800"
            onClick={() => onSendUpdate?.(order.id)}
          >
            <Mail className="h-4 w-4" />
            Send Update
          </Button>
        </div>
      </header>

      {order.customer.tag !== "general" ? (
        <FulfillmentTimelineSection timeline={order.timeline} orderType={order.orderType} />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CustomerInformationSection customer={order.customer} orderType={order.orderType} />
        <OrderStatusSection
          order={order}
          orderType={order.orderType}
          b2bFulfillmentStats={order.b2bFulfillmentStats}
          selectedStatus={selectedStatus}
          onSelectedStatusChange={setSelectedStatus}
          adminNotes={adminNotes}
          onAdminNotesChange={setAdminNotes}
          onUpdateStatus={handleStatusUpdate}
        />
        <PaymentInformationSection payment={order.payment} formatCurrency={formatCurrency} orderType={order.orderType} />
      </div>

      <OrderItemSection
        orderType={order.orderType}
        items={order.items}
        b2bLineItems={order.b2bLineItems}
        b2bFulfillmentStats={order.b2bFulfillmentStats}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
