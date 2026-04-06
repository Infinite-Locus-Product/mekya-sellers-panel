"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { orderStatusToBadgeVariant } from "@/lib/orderStatusBadge";
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Clock,
  User,
  FileText,
  Package,
  ShoppingCart,
  RefreshCw,
  Truck,
  BarChart3,
  Flag,
  MapPin,
  Phone,
} from "lucide-react";
import { ExportPdfIcon } from "@/assets/icons";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import type { OrderStatus, PaymentStatus, OrderType } from "@/lib/tableTypes";

export interface OrderItem {
  product: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface FulfillmentTimelineItem {
  stage: string;
  date: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export interface CustomerInfo {
  name: string;
  company?: string;
  tag?: OrderType | "general";
  email: string;
  phone: string;
  address: string;
}

export interface PaymentInfo {
  method: string;
  status: PaymentStatus;
  subtotal: number;
  gst: number;
  shippingCharges: number;
  total: number;
}

export interface OrderDetailsData {
  id: string;
  placedDate: string;
  placedTime: string;
  status: OrderStatus;
  customer: CustomerInfo;
  payment: PaymentInfo;
  items: OrderItem[];
  timeline: FulfillmentTimelineItem[];
  sellerNotes?: string;
}

interface OrderDetailsProps {
  order: OrderDetailsData;
  onStatusUpdate?: (
    orderId: string,
    status: OrderStatus,
    notes: string
  ) => void;
  onExportPDF?: (orderId: string) => void;
  onExportCSV?: (orderId: string) => void;
  onSendUpdate?: (orderId: string) => void;
}

const timelineIcons = {
  "Order Placed": ShoppingCart,
  "Order Processing": RefreshCw,
  "Ready for Dispatch": Package,
  Shipped: Truck,
  "In Transit": BarChart3,
  Delivered: Flag,
} as const;

const READY_FOR_DISPATCH = "Ready for Dispatch";

function filterFulfillmentTimeline(
  items: FulfillmentTimelineItem[]
): FulfillmentTimelineItem[] {
  return items.filter(
    (item) => item.stage !== "Canceled" && item.stage !== "Cancelled"
  );
}

export function OrderDetails({
  order,
  onStatusUpdate,
  onExportPDF,
  onSendUpdate,
}: OrderDetailsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status
  );
  const [sellerNotes, setSellerNotes] = useState(order.sellerNotes || "");

  const handleStatusUpdate = () => {
    onStatusUpdate?.(order.id, selectedStatus, sellerNotes);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-semibold text-foreground">
                Order {order.id}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {order.placedDate}, {order.placedTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm flex items-center gap-2 cursor-pointer rounded-md px-4 py-2 bg-[#E8E9E8]" onClick={() => onExportPDF?.(order.id)}><ExportPdfIcon className="shrink-0" aria-hidden />
            Export PDF</button>
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
      </div>

      {/* Fulfillment Timeline - Hide if type is general */}
      {order.customer.tag !== "general" && (
        <Card className="bg-[#E8E9E8]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Fulfillment Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-visible">
              <div className="flex items-start justify-between overflow-visible pb-8">
                {filterFulfillmentTimeline(order.timeline).map((item, index, arr) => {
                  const Icon =
                    timelineIcons[item.stage as keyof typeof timelineIcons] ||
                    Clock;
                  const isLast = index === arr.length - 1;
                  const isCompleted = item.completed;
                  const isCurrent = item.current;
                  const showReadyForDispatchRing =
                    isCurrent && item.stage === READY_FOR_DISPATCH;

                  // Line from this node to the next: green only once this stage is completed
                  const segmentToNextIsComplete = isCompleted;

                  return (
                    <div
                      key={`${item.stage}-${index}`}
                      className="relative flex flex-1 flex-col items-center"
                    >
                      <div className="relative flex h-[3.75rem] w-full items-center justify-center overflow-visible">
                        {!isLast && (
                          <div
                            className={`absolute left-1/2 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 ${segmentToNextIsComplete
                              ? "bg-green-500"
                              : "bg-gray-300"
                              }`}
                            aria-hidden
                          />
                        )}
                        {isCurrent && showReadyForDispatchRing ? (
                          <div
                            className="relative z-10 box-border rounded-full border-2 border-green-500 bg-white p-1"
                            aria-current="step"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500 bg-green-500">
                              <Icon
                                className="h-5 w-5 text-gray-900"
                                aria-hidden
                              />
                            </div>
                          </div>
                        ) : isCurrent ? (
                          <div
                            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-500 bg-green-500"
                            aria-current="step"
                          >
                            <Icon
                              className="h-5 w-5 text-gray-900"
                              aria-hidden
                            />
                          </div>
                        ) : (
                          <div
                            className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${isCompleted
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300 bg-white"
                              }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${isCompleted ? "text-white" : "text-gray-400"
                                }`}
                              aria-hidden
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-foreground">
                          {item.stage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.date?.trim() ? item.date : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.time?.trim() ? item.time : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#E8E9E8]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 ">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-base font-semibold text-foreground">
                {order.customer.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ABC Retailers Pvt. Ltd.
              </p>

              {order.customer.tag && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-black text-white rounded mt-2">
                  {order.customer.tag}
                </span>
              )}
            </div>
            <div className="w-full h-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {order.customer.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {order.customer.phone}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.customer.address}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#E8E9E8]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Current Status
              </p>
              <StatusBadge variant={orderStatusToBadgeVariant(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </StatusBadge>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Update Status
              </p>
              <Select
                value={selectedStatus}
                onValueChange={(value: string) =>
                  setSelectedStatus(value as OrderStatus)
                }
              >
                <SelectTrigger className="w-full bg-[#E8E9E8]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Seller Notes
              </p>
              <textarea
                value={sellerNotes}
                onChange={(e) => setSellerNotes(e.target.value)}
                placeholder="Add notes of status update..."
                className="w-full min-h-[100px] p-3 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-[#E8E9E8]"
              />
            </div>

            <Button
              onClick={handleStatusUpdate}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Update Status
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#E8E9E8]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="text-foreground">{order.payment.method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              <PaymentStatusBadge variant={order.payment.status}>
                {order.payment.status}
              </PaymentStatusBadge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {formatCurrency(order.payment.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST 18%</span>
                <span className="text-foreground">
                  {formatCurrency(order.payment.gst)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping charges</span>
                <span className="text-foreground">
                  {order.payment.shippingCharges === 0
                    ? "Free"
                    : formatCurrency(order.payment.shippingCharges)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span className="text-foreground">Total amount</span>
                <span className="text-foreground">
                  {formatCurrency(order.payment.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#E8E9E8]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {order.items.length} item(s) in this order
          </p>
          <div className="w-full h-px bg-gray-300 mb-4"></div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-[#E8E9E8]">
                  <th className="p-3 text-xs font-medium text-muted-foreground text-left">
                    Product
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground text-left">
                    SKU
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground text-left">
                    Quantity
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground text-left">
                    Price
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.sku} className="border-b">
                    <td className="p-3 text-sm text-foreground">
                      {item.product}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {item.sku}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="p-3 text-sm text-foreground text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2">
                  <td
                    colSpan={4}
                    className="p-3 text-sm font-semibold text-foreground text-right bg-[#E8E9E8]"
                  >
                    TOTAL
                  </td>
                  <td className="p-3 text-sm font-semibold text-foreground text-right bg-[#E8E9E8]">
                    {formatCurrency(
                      order.items.reduce((sum, item) => sum + item.total, 0)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
