import { getOrders } from "@/lib/data/orders";
import { B2BOrderManagementClient } from "../B2BOrderManagementClient";

export default async function B2BOrderManagementPage() {
    const orders = await getOrders();
    return <B2BOrderManagementClient initialOrders={orders} />;
}
