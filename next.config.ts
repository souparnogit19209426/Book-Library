import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, too small for phone camera photos uploaded as
      // book covers (see uploadBookCoverAction, capped at 8MB there).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
