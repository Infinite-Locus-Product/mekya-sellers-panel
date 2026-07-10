import { ProductViewClient } from "./ProductViewClient";

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <ProductViewClient productId={productId} />;
}
