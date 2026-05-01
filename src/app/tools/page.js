import React from "react";
import AllToolsClient from "./components/AllToolsClient";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "All PDF Tools - easy-pdf | Free Online PDF Editor",
  description: "Browse our complete collection of free, privacy-first PDF tools. Merge, split, compress, convert, and protect  PDFs directly in your browser.",
  keywords: ["all pdf tools", "pdf utilities", "free pdf software", "browser-based pdf tools", "merge pdf", "split pdf", "compress pdf"],
  canonicalUrl: `${siteUrl}/tools`,
  metadataBaseUrl: siteUrl,
  pageType: "website",
  breadcrumbs: [
    { name: "Home", url: siteUrl },
    { name: "Tools", url: `${siteUrl}/tools` }
  ]
});

const structuredData = generateComprehensiveJsonLd('website', {
  title: "All PDF Tools - easy-pdf | Free Online PDF Editor",
  description: "Browse our complete collection of free, privacy-first PDF tools.",
  url: `${siteUrl}/tools`,
});

export default function ToolsPage() {
  return (
    <>
      <h1 className="sr-only">All PDF Tools - Complete Suite for Document Processing</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AllToolsClient />
    </>
  );
}