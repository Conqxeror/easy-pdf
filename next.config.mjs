// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
