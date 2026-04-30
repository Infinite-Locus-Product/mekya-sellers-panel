import dynamic from "next/dynamic";
import { getOrders } from "@/lib/data";

const OrderManagementClient = dynamic(
  () =>
    import("./OrderManagementClient").then((m) => ({ default: m.OrderManagementClient })),
  { ssr: true }
);

export default async function OrderManagementPage() {
  const orders = await getOrders();
  return <OrderManagementClient initialOrders={orders} />;
}
