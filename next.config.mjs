// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // IMPORTANT: The 'webpack' configuration should still be commented out
  // if you intend to use Turbopack, as Turbopack replaces Webpack.
  /*
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "pdfjs-dist": "commonjs pdfjs-dist",
        "pdfjs-dist/build/pdf.mjs": "commonjs pdfjs-dist/build/pdf.mjs",
        "pdfjs-dist/build/pdf.worker.min.mjs":
          "commonjs pdfjs-dist/build/pdf.worker.min.mjs",
      });
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config;
  },
  */

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
