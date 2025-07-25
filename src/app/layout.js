import React from "react";
import ClientLayout from "./ClientLayout";
import { generateEnhancedMetadata, generateComprehensiveJsonLd, generatePerformanceHints } from "@/lib/seoEnhancements";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata = generateEnhancedMetadata({
  title: "easy-pdf - Free Online PDF Tools",
  description:
    "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser. Privacy-first, secure, and completely free.",
  keywords: [
    "PDF tools", "Merge PDF", "Split PDF", "Compress PDF", "JPG to PDF", "PDF to JPG", 
    "Free PDF Tools", "India", "Privacy-first", "Client-side processing", "Secure PDF tools",
    "Browser PDF editor", "No upload PDF tools", "PDF converter", "Document processing"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "homepage",
  lastModified: new Date().toISOString()
});

const structuredData = generateComprehensiveJsonLd('homepage');
const performanceHints = generatePerformanceHints();

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Performance Optimizations */}
        {performanceHints.preconnect.map((hint, index) => (
          <link key={`preconnect-${index}`} rel="preconnect" href={hint.href} {...(hint.crossOrigin && { crossOrigin: hint.crossOrigin })} />
        ))}
        
        {performanceHints.preload.map((hint, index) => (
          <link key={`preload-${index}`} rel="preload" href={hint.href} as={hint.as} {...(hint.type && { type: hint.type })} {...(hint.crossOrigin && { crossOrigin: hint.crossOrigin })} />
        ))}
        
        {performanceHints.prefetch.map((hint, index) => (
          <link key={`prefetch-${index}`} rel="prefetch" href={hint.href} as={hint.as} />
        ))}
        
        <link rel="dns-prefetch" href="https://vercel.live" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="easy-pdf" />
        <meta name="application-name" content="easy-pdf" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased bg-black">
        <ClientLayout>{children}</ClientLayout>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}