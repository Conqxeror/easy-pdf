import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Sponsor Dashboard - easy-pdf",
  description: "Analytics dashboard for easy-pdf sponsors. View performance metrics, user engagement, and sponsorship ROI data.",
  keywords: [
    "sponsor dashboard", "sponsor analytics", "sponsorship metrics", "ROI tracking",
    "sponsor performance", "engagement analytics", "sponsorship data", "partner dashboard"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sponsor-dashboard",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "article",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Sponsors", url: "/sponsors" },
    { name: "Dashboard", url: "/sponsor-dashboard" }
  ]
});

export default function SponsorDashboardLayout({ children }) {
  return children;
}