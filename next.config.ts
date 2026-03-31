import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid picking ~/package-lock.json when another lockfile exists above this app
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
