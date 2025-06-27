// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests; block-all-mixed-content;",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  // --- Turbopack Configuration (Updated for stability) ---
  // The 'experimental.turbo' flag is deprecated.
  // All Turbopack configuration now goes directly under a top-level 'turbopack' object.
  turbopack: {
    // Add other Turbopack specific rules or configurations here if needed.
    // E.g., for custom loaders or aliases, as per Next.js documentation:
    // rules: { /* ... */ },
    // resolveAlias: { /* ... */ },
    // resolveExtensions: [ /* ... */ ],
  },
};

// Export the nextConfig object.
export default nextConfig;
