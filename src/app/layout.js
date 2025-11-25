import React from "react";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
// Note: Analytics and SpeedInsights are client-side and are included in ClientLayout
// Note: Font is loaded server-side via next/font for optimal LCP

// Optimized font loading - server-side with subset and swap for better Core Web Vitals
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
  // Only load essential weights to reduce bundle size
  weight: ["400", "500", "600", "700"],
});

// Base metadata for the entire site - page-specific metadata is in each page.js
export const metadata = generateEnhancedMetadata({
  // Title template is defined in generateEnhancedMetadata, individual pages override
  canonicalUrl: "https://easy-pdf-murex.vercel.app",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('homepage');

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${inter.className} scroll-smooth bg-background`}>
      <body className="antialiased bg-background text-foreground">
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}