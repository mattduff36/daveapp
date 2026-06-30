import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack's dev filesystem cache (SST files) can fail on Windows when
  // `.next/dev` is recreated, causing missing manifests and runaway recompiles.
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
