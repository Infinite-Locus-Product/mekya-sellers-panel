import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use Webpack for dev (default) to avoid Turbopack panics on order-management; use `pnpm dev:turbo` to try Turbopack
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
