import React from "react";
import AboutClient from "./components/AboutClient";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "About easy-pdf - Privacy-First Free PDF Tools",
  description: "Learn about easy-pdf's mission to democratize document processing with secure, client-side tools. Completely free, private, and accessible to everyone.",
  keywords: ["about easy-pdf", "privacy-first pdf tools", "client-side processing", "free pdf tools mission", "secure pdf editor team"],
  canonicalUrl: `${siteUrl}/about`,
  metadataBaseUrl: siteUrl,
  pageType: "about",
  breadcrumbs: [
    { name: "Home", url: siteUrl },
    { name: "About", url: `${siteUrl}/about` }
  ]
});

const structuredData = generateComprehensiveJsonLd('about', {
  title: "About easy-pdf - Privacy-First Free PDF Tools",
  description: "Learn about easy-pdf's mission to democratize document processing with secure, client-side tools.",
  url: `${siteUrl}/about`,
});

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutClient />
    </>
  );
}
