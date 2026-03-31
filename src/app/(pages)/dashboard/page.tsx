import { getOrders } from "@/lib/data"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const orders = await getOrders()
  return <DashboardClient initialOrders={orders} />
}
