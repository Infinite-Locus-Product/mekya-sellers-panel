import { getReturns } from "@/lib/data";
import { ReturnsClient } from "./ReturnsClient";

export default async function ReturnsPage() {
  const initialReturns = await getReturns();
  return <ReturnsClient initialReturns={initialReturns} />;
}
