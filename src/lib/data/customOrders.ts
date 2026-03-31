/**
 * Custom orders data layer. API-ready: replace with fetch when backend is integrated.
 */

export interface CustomOrder {
  id: string;
  vendor: string;
  date: string;
  orderValue: string;
  customizationStatus: "In Process" | "Fulfilled" | "Pending Further information" ;
  requirements: string;
}

const mockCustomOrders: CustomOrder[] = [
  { id: "CUS-2024-001", vendor: "Rajesh Kumar", date: "14 Jun 2025, 10:30 am", orderValue: "₹25,000", customizationStatus: "In Process", requirements: "Custom logo embroidery, specific color scheme" },
  { id: "CUS-2024-002", vendor: "ABC Retailers Pvt Ltd", date: "14 Jun 2025, 11:00 am", orderValue: "₹45,000", customizationStatus: "Fulfilled", requirements: "Bulk custom packaging, personalized branding" },
  { id: "CUS-2024-003", vendor: "XYZ Store", date: "14 Jun 2025, 11:30 am", orderValue: "₹18,500", customizationStatus: "Pending Further information", requirements: "Size specifications needed, material preferences" },
  { id: "CUS-2024-004", vendor: "Test Vendor", date: "14 Jun 2025, 12:00 pm", orderValue: "₹32,000", customizationStatus: "Pending Further information", requirements: "Custom design implementation, quality check required" },
  { id: "CUS-2024-005", vendor: "Sample Store", date: "14 Jun 2025, 12:30 pm", orderValue: "₹12,500", customizationStatus: "In Process", requirements: "Logo placement specifications, color matching" },
  { id: "CUS-2024-006", vendor: "Demo Vendor", date: "14 Jun 2025, 1:00 pm", orderValue: "₹67,000", customizationStatus: "Fulfilled", requirements: "Complete brand overhaul, custom manufacturing" },
];

export async function getCustomOrders(): Promise<CustomOrder[]> {
  return Promise.resolve(mockCustomOrders);
}
