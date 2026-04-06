"use client";

import { OrderDetails } from "@/components/shared";
import type { OrderStatus } from "@/lib/tableTypes";
import type { OrderDetailsData } from "@/components/shared/OrderDetails";

export interface OrderDetailClientProps {
  order: OrderDetailsData;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const handleStatusUpdate = (_orderId: string, _status: OrderStatus, _notes: string) => {
    // Placeholder: replace with API call when backend is integrated
  };

  const handleExportPDF = (_orderId: string) => {
    // Placeholder: replace with PDF export when implemented
  };

  const handleSendUpdate = (_orderId: string) => {
    // Placeholder: replace with send update when backend is integrated
  };

  return (
    <OrderDetails
      order={order}
      onStatusUpdate={handleStatusUpdate}
      onExportPDF={handleExportPDF}
      onSendUpdate={handleSendUpdate}
    />
  );
}
