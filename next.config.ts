import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use Webpack for dev (default) to avoid Turbopack panics on order-management; use `pnpm dev:turbo` to try Turbopack
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "recharts",
    ],
  },
};

export default nextConfig;
