import { getEditableProductDraftById, getProducts } from "@/lib/data";
import { AddProductClient } from "./AddProductClient";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const productIdParam = resolvedSearchParams?.productId;
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;
  const products = await getProducts();
  const initialProduct = productId
    ? await getEditableProductDraftById(productId)
    : null;
  const categoryOptions = [...new Set(products.map((p) => p.category))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  return <AddProductClient categoryOptions={categoryOptions} initialProduct={initialProduct} />;
}
