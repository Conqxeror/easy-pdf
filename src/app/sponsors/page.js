import React from "react";
import SponsorsClient from "./components/SponsorsClient";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Sponsors & Partners - easy-pdf | Free PDF Tools",
  description: "Meet the incredible sponsors and partners who make easy-pdf free for everyone. Join our mission to provide privacy-first document tools.",
  keywords: ["easy-pdf sponsors", "support open source", "partner with easy-pdf", "donate to easy-pdf", "privacy-first sponsors"],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sponsors",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "website",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Sponsors", url: "https://easy-pdf-murex.vercel.app/sponsors" }
  ]
});

const structuredData = generateComprehensiveJsonLd('website');

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