/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,

  // Tree-shake heavy libraries so we don't pull every component when only a
  // handful are used. Big payload reduction in the shared vendor chunk
  // (~880 ms script-eval in Lighthouse).
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "embla-carousel-react",
      "react-hook-form",
    ],
  },

  async headers() {
    return [
      // Aggressive cache for Next.js build assets.
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache common static asset folders from /public (if used).
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/about/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      // Dynamic extension-based cache rule for public assets (future-proof names).
      {
        source: "/:asset*\\.(mp4|webm|ogg|png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf|eot|css|js)",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      // Service workers should update quickly; don't cache aggressively.
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/firebase-messaging-sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      // Keep dynamic/sensitive frontend routes out of cache.
      // PDP: always fresh HTML at the edge. Prevents Cloudflare (or any CDN
      // "Cache Everything") from serving a stale 404 or old page for a valid slug
      // when the origin/API had a brief failure. Data fetch still uses Next
      // fetch cache where configured on the server.
      {
        source: "/p/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/checkout/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/cart/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/verify-payment/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/success/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/failed/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/verification-failed/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/order-placed/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/order-invoice/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/profile/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/account/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/orders/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/add-address/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
      {
        source: "/favourites/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" }],
      },
    ];
  },
  images: {
    // Serve modern formats first. AVIF is ~30-50% smaller than WebP, which is
    // ~30% smaller than JPEG. Browsers that don't support them automatically
    // fall back to the original. Big payload reduction for image-heavy pages.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "knowear.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "knowearcommerce.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com", // ✅ Add Giphy here
      },
    ],
  }
};

export default nextConfig;
