/**
 * Products / catalog data layer. API-ready: replace mock with fetch when backend is live.
 */

import type { ProductInventoryType, ProductRow } from "@/lib/tableTypes";

const mockProducts: ProductRow[] = [
  {
    id: "prod-001",
    name: "T-Shirt A",
    articleNumber: "LUX-CS-2025-001",
    category: "Men's Clothing",
    sizes: "M, L, XL, XXL, XXXL",
    colors: "Red, Blue",
    inventoryType: "ready_to_ship",
    price: "₹500",
    quantity: 1000,
    status: "active",
  },
  {
    id: "prod-002",
    name: "Jeans B",
    articleNumber: "LUX-CS-2025-002",
    category: "Women's Clothing",
    sizes: "S, M, L, XXL",
    colors: "Black",
    inventoryType: "pre_booking",
    price: "₹1,200",
    quantity: 600,
    status: "inactive",
  },
  {
    id: "prod-003",
    name: "Jacket C",
    articleNumber: "LUX-CS-2025-003",
    category: "Accessories",
    sizes: "XS, M, XXXL",
    colors: "Green, Brown, Black",
    inventoryType: "stock_clearance",
    price: "₹1,500",
    quantity: 200,
    status: "active",
  },
  {
    id: "prod-004",
    name: "Linen Kurti Set",
    articleNumber: "LUX-CS-2025-004",
    category: "Women's Clothing",
    sizes: "S, M, L, XL",
    colors: "Ivory, Maroon",
    inventoryType: "ready_to_ship",
    price: "₹2,199",
    quantity: 85,
    status: "active",
  },
  {
    id: "prod-005",
    name: "Running Sneakers Pro",
    articleNumber: "LUX-CS-2025-005",
    category: "Men's Clothing",
    sizes: "7, 8, 9, 10, 11",
    colors: "White, Navy",
    inventoryType: "pre_booking",
    price: "₹3,499",
    quantity: 320,
    status: "inactive",
  },
  {
    id: "prod-006",
    name: "Leather Belt",
    articleNumber: "LUX-CS-2025-006",
    category: "Accessories",
    sizes: "32, 34, 36, 38",
    colors: "Brown, Black",
    inventoryType: "ready_to_ship",
    price: "₹899",
    quantity: 150,
    status: "active",
  },
  {
    id: "prod-007",
    name: "Wool Scarf",
    articleNumber: "LUX-CS-2025-007",
    category: "Accessories",
    sizes: "One Size",
    colors: "Grey, Camel, Burgundy",
    inventoryType: "stock_clearance",
    price: "₹1,099",
    quantity: 45,
    status: "inactive",
  },
  {
    id: "prod-008",
    name: "Oxford Shirt",
    articleNumber: "LUX-CS-2025-008",
    category: "Men's Clothing",
    sizes: "M, L, XL",
    colors: "White, Light Blue",
    inventoryType: "ready_to_ship",
    price: "₹1,450",
    quantity: 410,
    status: "active",
  },
  {
    id: "prod-009",
    name: "Kids Hoodie",
    articleNumber: "LUX-KP-2025-011",
    category: "Kids",
    sizes: "4Y, 6Y, 8Y, 10Y",
    colors: "Yellow, Teal",
    inventoryType: "pre_booking",
    price: "₹990",
    quantity: 220,
    status: "active",
  },
  {
    id: "prod-010",
    name: "Canvas Tote",
    articleNumber: "LUX-AC-2025-014",
    category: "Accessories",
    sizes: "One Size",
    colors: "Beige, Olive",
    inventoryType: "ready_to_ship",
    price: "₹650",
    quantity: 180,
    status: "inactive",
  },
  {
    id: "prod-011",
    name: "Pleated Midi Skirt",
    articleNumber: "LUX-CS-2025-012",
    category: "Women's Clothing",
    sizes: "XS, S, M, L",
    colors: "Black, Plum",
    inventoryType: "stock_clearance",
    price: "₹1,799",
    quantity: 92,
    status: "active",
  },
  {
    id: "prod-012",
    name: "Bomber Jacket",
    articleNumber: "LUX-CS-2025-013",
    category: "Men's Clothing",
    sizes: "S, M, L, XL, XXL",
    colors: "Olive, Charcoal",
    inventoryType: "ready_to_ship",
    price: "₹2,899",
    quantity: 64,
    status: "active",
  },
];

const mockB2BProducts: ProductRow[] = mockProducts.map((product, index) => ({
  ...product,
  id: `b2b-${product.id}`,
  name: `${product.name} (Bulk)`,
  articleNumber: product.articleNumber.replaceAll("LUX-", "B2B-"),
  quantity: product.quantity + (index + 1) * 50,
}));

export interface EditableProductDraft {
  id: string;
  name: string;
  articleNumber: string;
  category: string;
  categoryId?: string;
  inventoryType: ProductInventoryType;
  gender?: string;
  deliveryTimeline?: string;
  sizes: string[];
  colors: string[];
  mrp: string;
  sellingPrice: string;
  availableQty: number;
  minQty: number;
  maxQty: number;
  tags: string[];
  description: string;
}

function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export type B2BPricingWizardPrefill = {
  wholeSalePricePerUnit: string;
  wholeSalePricePerSet: string;
  availableQty: string;
  minQty: number;
  maxQty: number;
  tags: string[];
};

export type B2BProductWizardPrefill = {
  pricing: B2BPricingWizardPrefill;
  description: string;
};

/** Maps a listing row to defaults for the B2B add/edit wizard (pricing + description steps). */
export function getB2BWizardPrefillFromProductRow(row: ProductRow): B2BProductWizardPrefill {
  const d = toEditableDraft(row);
  const priceStr = d.sellingPrice || "";
  return {
    pricing: {
      wholeSalePricePerUnit: priceStr,
      wholeSalePricePerSet: priceStr,
      availableQty: String(d.availableQty),
      minQty: d.minQty,
      maxQty: d.maxQty,
      tags: [...d.tags],
    },
    description: d.description,
  };
}

function toEditableDraft(row: ProductRow): EditableProductDraft {
  const cleanPrice = row.price.replaceAll(/[^\d.]/g, "");
  return {
    id: row.id,
    name: row.name,
    articleNumber: row.articleNumber,
    category: row.category,
    inventoryType: row.inventoryType,
    sizes: parseCsv(row.sizes),
    colors: parseCsv(row.colors),
    mrp: cleanPrice,
    sellingPrice: cleanPrice,
    availableQty: row.quantity,
    minQty: 1,
    maxQty: Math.max(2, Math.min(20, row.quantity)),
    tags: [row.category, row.inventoryType.replaceAll("_", " ")],
    description: `${row.name} (${row.articleNumber}) demo description for edit mode.`,
  };
}

export async function getProducts(): Promise<ProductRow[]> {
  return mockProducts;
}

export async function getB2BProducts(): Promise<ProductRow[]> {
  return mockB2BProducts;
}

export async function getEditableProductDraftById(
  productId: string
): Promise<EditableProductDraft | null> {
  const product = [...mockProducts, ...mockB2BProducts].find((item) => item.id === productId);
  if (!product) return null;
  return toEditableDraft(product);
}
