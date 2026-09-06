import type { OrderManagementTabId } from "./constants";

export interface SegmentViewCopy {
    pageSubtitle: string;
    cardTitle: string;
    cardDescription: string;
    searchPlaceholder: string;
    emptyMessage: string;
}

const RESULTS_EMPTY_MESSAGE = "No results found. Try resetting your filters or adjusting your search.";

export function getSegmentViewCopy(segment: "b2c" | "b2b", tab: OrderManagementTabId): SegmentViewCopy {
    const searchPlaceholder =
        segment === "b2b" ? "Search by order ID, or vendor name" : "Search by order ID, customer name, or product";

    switch (tab) {
        case "orders":
            return {
                pageSubtitle:
                    segment === "b2b"
                        ? "Manage all B2B wholesale orders across the platform"
                        : "Manage all B2C orders across the platform",
                cardTitle: "All Orders",
                cardDescription:
                    segment === "b2b"
                        ? "Manage all B2B orders from a centralized location"
                        : "Manage all B2C orders from a centralized location",
                searchPlaceholder,
                emptyMessage: "No orders match your filters",
            };
        case "exchange":
            return {
                pageSubtitle: "Review and manage customer exchange requests",
                cardTitle: "Exchange Requests",
                cardDescription: "Manage all exchange requests from a centralized location",
                searchPlaceholder,
                emptyMessage: RESULTS_EMPTY_MESSAGE,
            };
        case "returns":
            return {
                pageSubtitle: "Review and manage customer return requests",
                cardTitle: "Return Requests",
                cardDescription: "Manage all return requests from a centralized location",
                searchPlaceholder,
                emptyMessage: RESULTS_EMPTY_MESSAGE,
            };
        case "cancellation":
            return {
                pageSubtitle: "Review cancelled orders and cancelled items",
                cardTitle: "Cancellation",
                cardDescription:
                    "Cancelled Orders covers whole orders and RTOs; Cancelled Items covers individual line items cancelled before dispatch",
                // Its own placeholder rather than the shared one: a cancellation row carries no
                // customer name (it is not on the row or on order_metadata), so promising it
                // here offered a search that always returned nothing.
                searchPlaceholder: "Search by order ID, product, or SKU",
                emptyMessage: "No cancelled orders match your filters",
            };
        case "custom":
            return {
                pageSubtitle: "Review and manage B2B custom orders",
                cardTitle: "Custom Orders",
                cardDescription: "Manage all B2B custom orders from a centralized location",
                searchPlaceholder,
                emptyMessage: RESULTS_EMPTY_MESSAGE,
            };
    }
}

export interface OrderManagementTabConfig {
    readonly id: OrderManagementTabId;
    readonly label: string;
}

/**
 * Sibling top-level tabs for the page. B2B has no post-shipment Exchange/Returns flow — it only
 * gets Orders + Cancellation (+ its own "Custom Orders" tab); B2C gets the full Exchange/Returns
 * lifecycle too.
 */
export function getOrderManagementTabs(segment: "b2c" | "b2b"): OrderManagementTabConfig[] {
    if (segment === "b2b") {
        return [
            { id: "orders", label: "Bulk Orders" },
            { id: "cancellation", label: "Cancellation" },
            { id: "custom", label: "Custom Orders" },
        ];
    }
    return [
        { id: "orders", label: "All Orders" },
        { id: "exchange", label: "Exchange" },
        { id: "returns", label: "Returns" },
        { id: "cancellation", label: "Cancellation" },
    ];
}
