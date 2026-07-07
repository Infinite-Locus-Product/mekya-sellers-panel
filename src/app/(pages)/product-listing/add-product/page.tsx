import { AddProductClient } from "./AddProductClient";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const productIdParam = resolvedSearchParams?.productId;
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;
  return <AddProductClient categoryOptions={[]} initialProduct={null} productId={productId} />;
}
