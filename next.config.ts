import type { NextConfig } from "next";

/**
 * Hosts that should bounce to the canonical domain. Only active once
 * NEXT_PUBLIC_SITE_URL is set, so merging this before the domain is live
 * can't send visitors to a site that doesn't answer yet.
 */
function canonicalHostRedirects() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return [];
  const canonical = new URL(site);
  const aliases = [`www.${canonical.host}`, 'spotifun.vercel.app'].filter(host => host !== canonical.host);
  return aliases.map(host => ({
    source: '/:path*',
    has: [{ type: 'host' as const, value: host }],
    destination: `${canonical.origin}/:path*`,
    permanent: true,
  }));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    return [
      // The example profile used to live at /demo
      { source: '/demo', destination: '/example', permanent: true },
      ...canonicalHostRedirects(),
    ];
  },
};

export default nextConfig;
