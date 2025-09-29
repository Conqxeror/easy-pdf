// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Helper to get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    domains: ['cdn.buymeacoffee.com'],
  },
  
  // Bundle optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot', 'framer-motion'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // External packages for server components
  serverExternalPackages: ['pdf-lib', 'pdfjs-dist', 'canvas'],
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Exclude service worker from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        './sw.js': 'commonjs ./sw.js'
      });
    }
    
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            pdf: {
              test: /[\\/]node_modules[\\/](pdf-lib|pdfjs-dist)[\\/]/,
              name: 'pdf-libs',
              priority: 20,
              reuseExistingChunk: true,
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
              name: 'ui-libs',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Split heavy libraries into separate chunks
            tesseract: {
              test: /[\\/]node_modules[\\/](tesseract.js)[\\/]/,
              name: 'tesseract',
              priority: 18,
              reuseExistingChunk: true,
            },
            html2canvas: {
              test: /[\\/]node_modules[\\/](html2canvas)[\\/]/,
              name: 'html2canvas',
              priority: 17,
              reuseExistingChunk: true,
            },
            canvas: {
              test: /[\\/]node_modules[\\/](canvas)[\\/]/,
              name: 'canvas',
              priority: 16,
              reuseExistingChunk: true,
            },
          },
        },
        // Minimize JavaScript
        minimize: true,
      };
      
      // Add module concatenation for smaller bundles
      config.optimization.concatenateModules = true;
    }
    
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.js': 'pdfjs-dist/build/pdf.worker.min.js',
    };
    
    // Add resolve extensions for better tree shaking
    config.resolve.extensions = [...config.resolve.extensions, '.mjs', '.jsx'];
    
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow buymeacoffee image CDN and the buymeacoffee script host so the external button widget can load
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://cdn.jsdelivr.net https://vercel.live https://cdnjs.buymeacoffee.com; worker-src 'self' blob: https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' https://cdn.buymeacoffee.com https://www.buymeacoffee.com data: blob:; media-src 'self'; font-src 'self'; connect-src 'self' https://infragrid.v.network https://cdn.jsdelivr.net https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests; block-all-mixed-content;",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/:path*\\.(jpg|jpeg|png|gif|ico|svg|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts
      {
        source: '/:path*\\.(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Turbopack Configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  async redirects() {
    return [
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ]
  },

};

export default bundleAnalyzer(nextConfig);