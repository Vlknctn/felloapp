import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@transferwise/components",
    "@wise/components-theming",
    "@wise/art",
  ],
};

export default nextConfig;
