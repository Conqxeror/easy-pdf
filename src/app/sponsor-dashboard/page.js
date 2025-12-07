import React from "react";
import SponsorDashboardClient from "./components/SponsorDashboardClient";
import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Sponsor Dashboard - easy-pdf",
  description: "Restricted access dashboard for easy-pdf sponsors to view performance analytics.",
  keywords: ["sponsor dashboard", "analytics", "restricted access"],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sponsor-dashboard",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "website",
  robots: {
    index: false, // Don't index the login page for the dashboard
    follow: false
  }
});


const structuredData = generateComprehensiveJsonLd('website');

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