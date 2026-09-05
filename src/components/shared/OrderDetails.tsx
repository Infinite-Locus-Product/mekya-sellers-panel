"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail } from "lucide-react"
import { ExportPdfIcon } from "@/assets/icons"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { InventoryTypeBadge } from "@/components/shared/InventoryTypeBadge"
import { orderStatusToBadgeVariant } from "@/lib/orderStatusBadge"
import { CustomerInformationSection } from "./order-details/CustomerInformationSection"
import { FulfillmentTimelineSection } from "./order-details/FulfillmentTimelineSection"
import { ShipmentsSection } from "./order-details/ShipmentsSection"
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
  ShipmentStepperStep,
  ShipmentDisplay,
  OrderDetailUnfulfilledLine,
  OrderDetailsData,
} from "./order-details/types"

interface OrderDetailsProps {
  order: OrderDetailsData
  onExportPDF?: (orderId: string) => void
  onSendUpdate?: (orderId: string) => void
  /** Called after a shipment action (ship/cancel) succeeds, so the caller can re-fetch. */
  onRefresh?: () => void
}

export function OrderDetails({
  order,
  onExportPDF,
  onSendUpdate,
  onRefresh,
}: Readonly<OrderDetailsProps>) {
  const router = useRouter()

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
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-normal text-foreground">Order {order.id}</h1>
              <StatusBadge variant={orderStatusToBadgeVariant(order.status)} className="w-fit max-w-full">
                {order.status}
              </StatusBadge>
              {order.inventoryType ? (
                <div className="w-fit max-w-full">
                  <InventoryTypeBadge type={order.inventoryType} />
                </div>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {order.placedDate}, {order.placedTime}
            </p>
            {/* A replacement order is otherwise indistinguishable from an ordinary one —
                same shape, same lines, a total that is zero only because the goods were
                already paid for on the original order. This says where it came from. */}
            {order.exchange ? (
              <div className="mt-2 text-sm">
                <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <span className="font-medium text-foreground">Exchange replacement</span>
                  {order.exchange.originalOrderId ? (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Raised against</dt>
                      <dd className="font-medium text-foreground">{order.exchange.originalOrderId}</dd>
                    </div>
                  ) : null}
                  {order.exchange.returnId ? (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Exchange request</dt>
                      <dd className="font-medium text-foreground">{order.exchange.returnId}</dd>
                    </div>
                  ) : null}
                  {order.exchange.itemName ? (
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Item exchanged</dt>
                      <dd className="font-medium text-foreground">
                        {order.exchange.itemName}
                        {order.exchange.sku ? ` (${order.exchange.sku})` : ""}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm flex h-11 items-center gap-2 cursor-pointer rounded-md bg-[#E8E9E8] px-4"
            onClick={() => onExportPDF?.(order.id)}
          >
            <ExportPdfIcon className="shrink-0" aria-hidden />
            Export PDF
          </button>
          <Button
            variant="default"
            size="lg"
            className="h-11 gap-2 bg-black px-4 text-white hover:bg-gray-800"
            onClick={() => onSendUpdate?.(order.id)}
          >
            <Mail className="h-4 w-4" />
            Send Update
          </Button>
        </div>
      </header>

      {order.shipments ? (
        // `[]` (real API data, genuinely zero shipments yet) still renders ShipmentsSection so its
        // "Create Shipment" prompt shows — only `undefined` (legacy/mock data) falls through below.
        <ShipmentsSection
          shipments={order.shipments}
          orderId={order.id}
          unfulfilledLines={order.unfulfilledLines}
          cancelledLines={order.cancelledLines}
          deliveryPincode={order.deliveryPincode}
          customOrder={order.customOrder}
          orderStatus={order.status}
          onRefresh={onRefresh}
        />
      ) : order.customer.tag !== "general" && !order.b2bFulfillmentStats ? (
        <FulfillmentTimelineSection timeline={order.timeline} orderType={order.orderType} />
      ) : null}

      <div className={`grid grid-cols-1 gap-6 mt-6 ${order.b2bFulfillmentStats ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        <CustomerInformationSection customer={order.customer} orderType={order.orderType} />
        {order.b2bFulfillmentStats ? (
          <OrderStatusSection b2bFulfillmentStats={order.b2bFulfillmentStats} />
        ) : null}
        <PaymentInformationSection payment={order.payment} formatCurrency={formatCurrency} orderType={order.orderType} />
      </div>

      <OrderItemSection
        orderType={order.orderType}
        items={order.items}
        b2bLineItems={order.b2bLineItems}
        b2bFulfillmentStats={order.b2bFulfillmentStats}
        formatCurrency={formatCurrency}
        orderId={order.id}
        onRefresh={onRefresh}
      />
    </div>
  )
}
