import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Define explicit Turbopack root to avoid picking parent workspace
  // and keep relative paths (like Prisma SQLite) resolving from this app dir
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
