import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every real photo on the site is served through next/image (ImageSlot,
    // VehicleVisuals, the homepage hero) — this makes it hand each browser
    // the smallest format it supports (AVIF first, WebP next, original as
    // the last resort) instead of always shipping the source JPG/PNG.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
