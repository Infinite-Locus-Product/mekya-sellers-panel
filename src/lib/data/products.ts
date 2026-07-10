import type { ProductInventoryType } from "@/lib/tableTypes";

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
  b2bSellingPrice?: string;
  availableQty: number;
  minQty: number;
  maxQty: number;
  tags: string[];
  description: string;
  images?: Array<{ id: string; url: string }>;
  channels?: "b2c" | "b2b" | "both";
}
