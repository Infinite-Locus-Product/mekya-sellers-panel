export interface SegmentViewCopy {
    pageSubtitle: string;
    cardTitle: string;
    cardDescription: string;
    searchPlaceholder: string;
    emptyMessage: string;
}

export function getSegmentViewCopy(
    segment: "b2c" | "b2b",
    orderView: "all" | "returns"
): SegmentViewCopy {
    if (segment === "b2c") {
        return orderView === "all"
            ? {
                  pageSubtitle: "Manage all B2C orders across the platform",
                  cardTitle: "All Orders",
                  cardDescription: "Manage all B2C orders from a centralized location",
                  searchPlaceholder: "Search by order ID, customer name, or product",
                  emptyMessage: "No orders match your filters",
              }
            : {
                  pageSubtitle: "Review and manage customer return requests",
                  cardTitle: "Return Requests",
                  cardDescription: "Manage all B2C Return Requests orders from a centralized location",
                  searchPlaceholder: "Search by order ID, customer name, or product",
                  emptyMessage:
                      "No results found. Try resetting your filters or adjusting your search.",
              };
    }
    return orderView === "all"
        ? {
              pageSubtitle: "Manage all B2B wholesale orders across the platform",
              cardTitle: "All Orders",
              cardDescription: "Manage all B2B orders from a centralized location",
              searchPlaceholder: "Search by order ID, or vendor name",
              emptyMessage: "No orders match your filters",
          }
        : {
              pageSubtitle: "Review and manage B2B custom orders",
              cardTitle: "Custom Orders",
              cardDescription: "Manage all B2B custom orders from a centralized location",
              searchPlaceholder: "Search by order ID, or vendor name",
              emptyMessage: "No results found. Try resetting your filters or adjusting your search.",
          };
}

export function getOrderViewToggleLabels(segment: "b2c" | "b2b"): { all: string; returns: string } {
    return segment === "b2c"
        ? { all: "All Orders", returns: "Return Requests" }
        : { all: "Bulk Orders", returns: "Custom Orders" };
}
