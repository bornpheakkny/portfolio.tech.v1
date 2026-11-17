import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@/shared"],
  // Allow time for the Render free-tier API to wake from sleep (see src/lib/api.ts).
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
