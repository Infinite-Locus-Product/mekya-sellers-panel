import { getCustomOrders } from "@/lib/data";
import { CustomOrdersClient } from "./CustomOrdersClient";

export default async function CustomOrdersPage() {
  const initialOrders = await getCustomOrders();
  return <CustomOrdersClient initialOrders={initialOrders} />;
}
