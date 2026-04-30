import type { BulkActionExecuteMeta } from "@/app/(pages)/order-management/_components/BulkActionModal";

/**
 * Builds the same success copy the bulk-action flow has always shown (including typographic quotes for status).
 * Pure: safe to unit test; no side effects.
 */
export function getBulkActionSuccessMessage(
    action: string,
    count: number,
    meta?: BulkActionExecuteMeta
): string {
    const orderWord = count === 1 ? "order" : "orders";

    if (action === "update_status" && meta?.newOrderStatus) {
        const status = meta.newOrderStatus;
        return `🎉 Updated ${count} ${orderWord} to \u201c${status}\u201d`;
    }

    if (action === "generate_invoice") {
        const invoiceWord = count === 1 ? "invoice" : "invoices";
        return `🎉 Successfully generated ${count} ${invoiceWord} for ${count} ${orderWord}`;
    }

    return `🎉 Bulk action completed for ${count} ${orderWord}`;
}
