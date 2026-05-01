import React from "react";
import SponsorsClient from "./components/SponsorsClient";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "Sponsors & Partners - easy-pdf | Free PDF Tools",
  description: "Meet the incredible sponsors and partners who make easy-pdf free for everyone. Join our mission to provide privacy-first document tools.",
  keywords: ["easy-pdf sponsors", "support open source", "partner with easy-pdf", "donate to easy-pdf", "privacy-first sponsors"],
  canonicalUrl: `${siteUrl}/sponsors`,
  metadataBaseUrl: siteUrl,
  pageType: "website",
  breadcrumbs: [
    { name: "Home", url: siteUrl },
    { name: "Sponsors", url: `${siteUrl}/sponsors` }
  ]
});

const structuredData = generateComprehensiveJsonLd('website', {
  title: "Sponsors & Partners - easy-pdf | Free PDF Tools",
  description: "Meet the sponsors and partners who make easy-pdf free for everyone.",
  url: `${siteUrl}/sponsors`,
});

export default function SponsorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SponsorsClient />
    </>
  );
}