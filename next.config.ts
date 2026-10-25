import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every real photo on the site is served through next/image (ImageSlot,
    // VehicleVisuals, the homepage hero) — this makes it hand each browser
    // the smallest format it supports (AVIF first, WebP next, original as
    // the last resort) instead of always shipping the source JPG/PNG.
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // The new-model page briefly shipped under the wrong slug (named
      // after the Indonesia-market name, "AIRA EV") before the dealer
      // confirmed the Thailand market name is "MINI EV GEN 5" — permanent
      // redirect in case it was crawled or linked in that short window.
      { source: '/models/aira', destination: '/models/mini-ev-gen5', permanent: true },
    ];
  },
};

export default nextConfig;
