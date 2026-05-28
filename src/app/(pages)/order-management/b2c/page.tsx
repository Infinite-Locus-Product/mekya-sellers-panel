import { getOrders } from "@/lib/data/orders";
import { B2COrderManagementClient } from "../B2COrderManagementClient";

export default async function B2COrderManagementPage() {
    const orders = await getOrders();
    return <B2COrderManagementClient initialOrders={orders} />;
}
