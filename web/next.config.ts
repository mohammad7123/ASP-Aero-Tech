import type { NextConfig } from "next";

/**
 * Product images uploaded through the admin console are served by the API
 * server at /api/storage/objects/*. Allow next/image to optimise them when
 * ASP_API_URL is configured.
 */
function apiImagePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const raw = process.env.ASP_API_URL;
  if (!raw) return [];
  try {
    const url = new URL(raw);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/api/storage/**",
      },
    ];
  } catch {
    return [];
  }
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: apiImagePatterns(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // ~30 static pages: a couple of build workers beat one-per-core, especially
    // on memory-constrained machines (15 parallel workers caused swap thrash).
    staticGenerationMinPagesPerWorker: 20,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Long-lived caching for static 3D assets (GLB models, Draco decoders).
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    // The nav calls the blog "Insights"; make the friendly URL work too.
    return [{ source: "/insights", destination: "/blog", permanent: true }];
  },
};

export default nextConfig;
