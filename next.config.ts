import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
