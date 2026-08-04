import type { AllOrder } from "@/lib/tableTypes";

const DEMO_CONTACT_NAMES = ["Manas Singh", "Priya Sharma", "Rahul Verma", "Anita Desai"] as const;

export function getOrderProductNames(order: AllOrder): string[] {
    return (order.productList ?? []).map((item) => item.name);
}

export function demoContactPersonForOrder(orderId: string): string {
    const n = orderId.split("").reduce((acc, ch) => acc + (ch.codePointAt(0) ?? 0), 0);
    return DEMO_CONTACT_NAMES[Math.abs(n) % DEMO_CONTACT_NAMES.length] ?? DEMO_CONTACT_NAMES[0];
}

export function customizationStatusLabel(status: AllOrder["status"]): string {
    if (status === "Unfulfilled") return "In Process";
    return String(status);
}
