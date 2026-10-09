import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vigilart/shared"],
  devIndicators: { position: "bottom-right" }
};

export default nextConfig;
