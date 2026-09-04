import type {
    ApiCustomOrderNote,
    ApiCustomOrderRequest,
    ApiCustomOrderRequestDetail,
    ApiCustomOrderStatusEvent,
    ApiOrderLine,
    ApiUploadedFile,
    CustomOrderRequestStatus,
} from "@/lib/api/orders";

/**
 * The one wording for each custom-order status, used by the sub-tab row, the Status filter, the
 * table's status badge and the detail modal alike.
 *
 * There used to be three separate maps for these five states, so the same order read
 * "Awaiting Confirmation" on its tab, "Awaiting Buyer Confirmation" in its badge and
 * "Confirmed"/"Declined by Buyer"/"Rejected by Seller" in the filter. Matches the admin
 * portal's labels too, so the two portals describe one status the same way.
 */
export const CUSTOM_ORDER_REQUEST_STATUS_LABEL: Record<CustomOrderRequestStatus, string> = {
    pending_review: "Pending Review",
    awaiting_buyer_confirmation: "Awaiting Confirmation",
    buyer_confirmed: "Buyer Confirmed",
    buyer_declined: "Buyer Declined",
    rejected: "Rejected",
};

export interface CustomOrderRequestRow {
    id: string;
    /** Human reference for the request itself ("CUST-20260902-K8M2N1"). Shown in place of
     *  the raw UUID, which is what the ID column used to render. */
    customDisplayId: string | null;
    status: CustomOrderRequestStatus;
    saleorOrderId: string;
    displayOrderId: string | null;
    saleorOrderNumber: string | null;
    vendorName: string | null;
    customerName: string | null;
    totalAmount: number | null;
    currency: string | null;
    requirementsPreview: string | null;
    /** Saleor global ID — opaque base64. Keyed on by the API, never shown to the user. */
    linkedSaleorOrderId: string | null;
    /** Human order number ("ORD-20260811-AFQPMY") of the linked order — what we display. */
    linkedDisplayOrderId: string | null;
    createdAt: string;
    updatedAt: string;
}

export function mapApiCustomOrderRequest(r: ApiCustomOrderRequest): CustomOrderRequestRow {
    return {
        id: r.id,
        customDisplayId: r.custom_display_id ?? null,
        status: r.custom_status,
        saleorOrderId: r.saleor_order_id,
        displayOrderId: r.display_order_id ?? null,
        saleorOrderNumber: r.saleor_order_number ?? null,
        vendorName: r.vendor_name ?? null,
        customerName: r.customer_name ?? null,
        totalAmount: r.total_amount ?? null,
        currency: r.currency ?? null,
        requirementsPreview: r.requirements_preview ?? null,
        linkedSaleorOrderId: r.linked_saleor_order_id ?? null,
        linkedDisplayOrderId: r.linked_display_order_id ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

export interface CustomOrderLineRow {
    lineId: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number | null;
    totalPrice: number | null;
    currency: string | null;
    thumbnailUrl: string | null;
}

function mapOrderLine(l: ApiOrderLine): CustomOrderLineRow {
    return {
        lineId: l.line_id,
        productName: l.product_name,
        variantName: l.variant_name ?? null,
        sku: l.sku ?? null,
        quantity: l.quantity,
        unitPrice: l.unit_price ?? null,
        totalPrice: l.total_price ?? null,
        currency: l.currency ?? null,
        thumbnailUrl: l.thumbnail_url ?? null,
    };
}

export interface CustomOrderStatusEventRow {
    id: string;
    fromStatus: CustomOrderRequestStatus | null;
    toStatus: CustomOrderRequestStatus;
    changedBy: string;
    changedAt: string;
    note: string | null;
}

function mapStatusEvent(e: ApiCustomOrderStatusEvent): CustomOrderStatusEventRow {
    return {
        id: e.id,
        fromStatus: e.from_status,
        toStatus: e.to_status,
        changedBy: e.changed_by,
        changedAt: e.changed_at,
        note: e.note ?? null,
    };
}

export interface CustomOrderNoteRow {
    id: string;
    author: string;
    body: string;
    edited: boolean;
    createdAt: string;
    updatedAt: string;
}

function mapNote(n: ApiCustomOrderNote): CustomOrderNoteRow {
    return {
        id: n.id,
        author: n.author,
        body: n.body,
        edited: n.edited,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
    };
}

export interface UploadedFileRow {
    name: string;
    url: string;
}

function mapUploadedFile(f: ApiUploadedFile): UploadedFileRow {
    return { name: f.name, url: f.url };
}

export interface CustomOrderRequestDetail extends CustomOrderRequestRow {
    contactPerson: string | null;
    customerEmail: string | null;
    requirementsText: string | null;
    packagingNotes: string | null;
    uploadedFiles: UploadedFileRow[];
    statusEvents: CustomOrderStatusEventRow[];
    notes: CustomOrderNoteRow[];
    orderLines: CustomOrderLineRow[];
    allowedNextStatuses: CustomOrderRequestStatus[];
}

export function mapApiCustomOrderRequestDetail(d: ApiCustomOrderRequestDetail): CustomOrderRequestDetail {
    return {
        ...mapApiCustomOrderRequest(d),
        contactPerson: d.contact_person ?? null,
        customerEmail: d.customer_email ?? null,
        requirementsText: d.requirements_text ?? null,
        packagingNotes: d.packaging_notes ?? null,
        uploadedFiles: (d.uploaded_files ?? []).map(mapUploadedFile),
        statusEvents: (d.status_events ?? []).map(mapStatusEvent),
        notes: (d.notes ?? []).map(mapNote),
        orderLines: (d.order_lines ?? []).map(mapOrderLine),
        allowedNextStatuses: d.allowed_next_statuses ?? [],
    };
}
