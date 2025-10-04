import React from "react";
import ClientLayout from "./ClientLayout";
import { generateEnhancedMetadata, generateComprehensiveJsonLd, generatePerformanceHints } from "@/lib/seoEnhancements";
// Note: Analytics and SpeedInsights are client-side and are included in ClientLayout

export const metadata = generateEnhancedMetadata({


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
  const cacheBust = Date.now();

  // Inline white pen-tool SVG data URL to force immediate favicon rendering in browsers
  const inlineFaviconSvg = encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m2.3 2.3 7.286 7.286" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="11" cy="11" r="2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`);
  const inlineFavicon = `data:image/svg+xml;utf8,${inlineFaviconSvg}`;

  return (
  <html lang="en" className="scroll-smooth" style={{ backgroundColor: '#000000' }}>
      <head>
        {/* Inline data-URL favicon (highest priority) */}
        <link rel="icon" href={inlineFavicon} />
        <link rel="manifest" href="/site.webmanifest" />
    {/* Favicon & touch icons with cache-bust to ensure fresh load during dev */}
  {/* Prefer ICO/PNG (white) for tab visibility; SVG left as fallback */}
  <link rel="icon" href={`/favicon.ico?v=${cacheBust}`} type="image/x-icon" />
  <link rel="icon" href={`/favicon.png?v=${cacheBust}`} sizes="16x16" />
  <link rel="shortcut icon" href={`/favicon.png?v=${cacheBust}`} />
  <link rel="apple-touch-icon" href={`/apple-touch-icon.png?v=${cacheBust}`} />
    {/* Prefer SVG icon for modern browsers as a fallback */}
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <meta name="msapplication-TileImage" content={`/apple-touch-icon.png?v=${cacheBust}`} />
  {/* Safari pinned tab mask icon (use white for dark tab visibility) */}
  <link rel="mask-icon" href="/icon.svg" color="#ffffff" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        
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
        <meta name="msapplication-TileColor" content="#000000" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased bg-black">
  <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}