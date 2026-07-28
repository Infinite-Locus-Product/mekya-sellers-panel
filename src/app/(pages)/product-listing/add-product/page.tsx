import { AddProductClient } from "./AddProductClient";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const productIdParam = resolvedSearchParams?.productId;
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;
  const defaultChannelParam = resolvedSearchParams?.defaultChannel;
  const rawChannel = Array.isArray(defaultChannelParam) ? defaultChannelParam[0] : defaultChannelParam;
  const validChannels = ["b2c", "b2b", "both"] as const;
  const defaultChannel = validChannels.includes(rawChannel as (typeof validChannels)[number])
    ? (rawChannel as (typeof validChannels)[number])
    : undefined;
  return (
    <AddProductClient
      initialProduct={null}
      productId={productId}
      defaultChannel={defaultChannel}
    />
  );
}
