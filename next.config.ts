import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  // Tell Next.js not to bundle these native/binary packages — they'll be
  // loaded at runtime from node_modules (required for Prisma in serverless)
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
