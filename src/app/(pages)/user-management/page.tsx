import { getUsers } from "@/lib/data";
import { UserManagementClient } from "./UserManagementClient";

export default async function UserManagementPage() {
  const users = await getUsers();
  return <UserManagementClient initialUsers={users} />;
}
