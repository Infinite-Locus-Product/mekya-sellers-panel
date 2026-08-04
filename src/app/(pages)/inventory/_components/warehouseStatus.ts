import type { StatusVariant } from "@/components/shared/StatusBadge";
import type { WarehouseFulfillmentModel, WarehouseStatus } from "@/lib/api/warehouses";

export const WAREHOUSE_STATUS_LABEL: Record<WarehouseStatus, string> = {
    pending_approval: "Pending Approval",
    active: "Active",
    rejected: "Rejected",
};

export const FULFILLMENT_MODEL_LABEL: Record<WarehouseFulfillmentModel, string> = {
    self_fulfilled: "Self-fulfilled",
    marketplace_fulfilled: "Marketplace-fulfilled",
};

export const WAREHOUSE_STATUS_VARIANT: Record<WarehouseStatus, StatusVariant> = {
    pending_approval: "pending",
    active: "delivered",
    rejected: "canceled",
};

export function formatWarehouseAddress(
    address: {
        streetAddress1: string;
        streetAddress2?: string;
        city: string;
        postalCode: string;
        countryArea: string;
    } | null
    // Newly-registered warehouses can have a null address until Saleor's sync catches up.
): string {
    if (!address) return "—";
    return [address.streetAddress1, address.streetAddress2, address.city, address.countryArea, address.postalCode]
        .filter(Boolean)
        .join(", ");
}
