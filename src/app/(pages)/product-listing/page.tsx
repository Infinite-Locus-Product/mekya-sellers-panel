import { getProducts } from "@/lib/data";
import { ProductListingClient } from "./ProductListingClient";

export default async function ProductListingPage() {
  const products = await getProducts();
  return <ProductListingClient initialProducts={products} listingVariant="b2c" />;
}
