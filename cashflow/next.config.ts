import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The UI is a single self-contained page in /public; serve it at the
  // site root and the login form at /login. All data goes through the
  // authenticated /api/rpc route, so the static HTML itself holds no secrets.
  async rewrites() {
    return [
      { source: "/", destination: "/cashflow.html" },
      { source: "/login", destination: "/login.html" },
    ];
  },
};

export default nextConfig;
