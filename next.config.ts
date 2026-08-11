import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Pin project root when a parent directory also contains a lockfile (avoids Turbopack picking the wrong root). */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optional: use `npm run dev:turbo` to try Turbopack for local dev.
  turbopack: {
    root: turbopackRoot,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
