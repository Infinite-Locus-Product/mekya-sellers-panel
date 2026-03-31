/**
 * Users data layer. API-ready: replace mock implementation with fetch when backend is integrated.
 */

import type { UserRow } from "@/lib/tableTypes";

const mockUsers: UserRow[] = [
  { id: "USR-2025-001", vendor: "Rajesh Kumar", email: "rajesh.kumar@example.com", role: "Brand", status: "active", onboardingdate: "01 Jan 2025" },
  { id: "USR-2025-002", vendor: "ABC Retailers Pvt Ltd", email: "contact@abcretailers.com", role: "Agent", status: "pending", onboardingdate: "10 Feb 2025" },
  { id: "USR-2025-003", vendor: "XYZ Store", email: "xyz.store@example.com", role: "Retailer", status: "active", onboardingdate: "15 Mar 2025" },
  { id: "USR-2025-004", vendor: "Test Vendor", email: "test.vendor@example.com", role: "Institutional Buyer", status: "suspended", onboardingdate: "20 Apr 2025" },
  { id: "USR-2025-005", vendor: "Sample Store", email: "sample.store@example.com", role: "Retailer", status: "inactive", onboardingdate: "25 May 2025" },
  { id: "USR-2025-006", vendor: "Demo Vendor", email: "demo.vendor@example.com", role: "Agent", status: "active", onboardingdate: "30 Jun 2025" },
];

/**
 * Fetch all users. Replace body with: const res = await fetch('/api/users'); return res.json();
 */
export async function getUsers(): Promise<UserRow[]> {
  return Promise.resolve(mockUsers);
}
