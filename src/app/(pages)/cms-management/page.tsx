import { getCmsLandingData } from "@/lib/data";
import { CMSManagementClient } from "./CMSManagementClient";

export default async function CMSManagementPage() {
  const data = await getCmsLandingData();
  return <CMSManagementClient data={data} />;
}
