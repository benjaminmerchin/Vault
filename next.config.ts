import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep `pg` external so it isn't bundled into server functions.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
