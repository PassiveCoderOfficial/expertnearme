import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Compiler for now - it's experimental and heavy
  reactCompiler: false,
  
  // Turbopack config (Next.js 16 default) - empty for now
  turbopack: {},
  
  // Optimize bundle splitting (webpack fallback)
  webpack: (config) => {
    // Tree-shake Prisma better
    config.externals = ['prisma', ...config.externals];
    return config;
  },
};

export default nextConfig;
