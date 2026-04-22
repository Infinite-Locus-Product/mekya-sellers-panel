import { redirect } from "next/navigation";

/** Canonical B2C list lives at `/order-management/b2c`. */
export default function OrderManagementPage() {
    redirect("/order-management/b2c");
}
