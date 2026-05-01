import React from "react";
import SponsorDashboardClient from "./components/SponsorDashboardClient";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "Sponsor Dashboard - easy-pdf",
  description: "Restricted access dashboard for easy-pdf sponsors to view performance analytics.",
  keywords: ["sponsor dashboard", "analytics", "restricted access"],
  canonicalUrl: `${siteUrl}/sponsor-dashboard`,
  metadataBaseUrl: siteUrl,
  pageType: "website",
  robots: {
    index: false, // Don't index the login page for the dashboard
    follow: false
  }
});


const structuredData = generateComprehensiveJsonLd('website', {
  title: "Sponsor Dashboard - easy-pdf",
  description: "Restricted access dashboard for easy-pdf sponsors to view performance analytics.",
  url: `${siteUrl}/sponsor-dashboard`,
});

export default function SponsorDashboardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SponsorDashboardClient />
    </>
  );
}