import type { AllOrder } from "@/lib/tableTypes";
import type { ReturnItemLine } from "@/app/(pages)/order-management/_components/ReturnDetailsModal";
import { RETURN_ITEMS_DEMO_FILL } from "./constants";

const DEMO_CONTACT_NAMES = ["Manas Singh", "Priya Sharma", "Rahul Verma", "Anita Desai"] as const;

export function getOrderProductNames(order: AllOrder): string[] {
    return (order.productList ?? []).map((item) => item.name);
}

export function demoContactPersonForOrder(orderId: string): string {
    const n = orderId.split("").reduce((acc, ch) => acc + (ch.codePointAt(0) ?? 0), 0);
    return DEMO_CONTACT_NAMES[Math.abs(n) % DEMO_CONTACT_NAMES.length] ?? DEMO_CONTACT_NAMES[0];
}

export function customizationStatusLabel(status: AllOrder["status"]): string {
    if (status === "Processing") return "In Process";
    return String(status);
}

export function padReturnItemsToFive(mapped: ReturnItemLine[]): ReturnItemLine[] {
    const capped = mapped.slice(0, 5);
    if (capped.length >= 5) return capped;
    const merged = [...capped];
    let i = 0;
    while (merged.length < 5 && i < RETURN_ITEMS_DEMO_FILL.length) {
        merged.push(RETURN_ITEMS_DEMO_FILL[i]);
        i += 1;
    }
    return merged;
}
