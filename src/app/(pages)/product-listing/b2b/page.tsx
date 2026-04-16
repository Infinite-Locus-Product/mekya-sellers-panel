import { getB2BProducts } from "@/lib/data";
import { ProductListingClient } from "../ProductListingClient";

export default async function ProductListingB2BPage() {
  const products = await getB2BProducts();
  return <ProductListingClient initialProducts={products} listingVariant="b2b" />;
}
