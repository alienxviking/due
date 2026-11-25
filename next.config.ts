import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited tabs in the client cache for 30s so switching back is instant.
    // Any post action revalidates, so this never shows stale data after your own changes.
    staleTimes: { dynamic: 30, static: 300 },
  },
};

export default nextConfig;
