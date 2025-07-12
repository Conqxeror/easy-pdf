import ClientLayout from "./ClientLayout";
import { generateMetadata } from "@/lib/metadata";
import { generateJsonLd } from "@/lib/structuredData";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata = generateMetadata({
  title: "easy-pdf - Free Online PDF Tools",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser.",
  keywords: ["PDF tools", "Merge PDF", "Split PDF", "Compress PDF", "JPG to PDF", "PDF to JPG", "Free PDF Tools", "India", "Privacy-first", "Client-side processing"],
  canonicalUrl: "https://easy-pdf-murex.vercel.app",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateJsonLd('homepage');

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}