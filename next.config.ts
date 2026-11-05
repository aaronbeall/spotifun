import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    // The example profile used to live at /demo
    return [{ source: '/demo', destination: '/example', permanent: true }];
  },
};

export default nextConfig;
