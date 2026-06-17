import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Pin project root when a parent directory also contains a lockfile (avoids Turbopack picking the wrong root). */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optional: use `npm run dev:turbo` to try Turbopack for local dev.
  turbopack: {
    root: turbopackRoot,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async rewrites() {
    return [
      {
        source: "/__api-proxy/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
