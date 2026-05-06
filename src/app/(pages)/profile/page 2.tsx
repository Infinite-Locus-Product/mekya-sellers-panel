import { getProfile } from "@/lib/data";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const initialData = await getProfile();
  return <ProfileClient initialData={initialData} />;
}
