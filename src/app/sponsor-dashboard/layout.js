import { generateEnhancedMetadata } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "Sponsor Dashboard - easy-pdf",
  description: "Analytics dashboard for easy-pdf sponsors. View performance metrics, user engagement, and sponsorship ROI data.",
  keywords: [
    "sponsor dashboard", "sponsor analytics", "sponsorship metrics", "ROI tracking",
    "sponsor performance", "engagement analytics", "sponsorship data", "partner dashboard"
  ],
  canonicalUrl: `${siteUrl}/sponsor-dashboard`,
  metadataBaseUrl: siteUrl,
  pageType: "article",
  breadcrumbs: [
    { name: "Home", url: siteUrl },
    { name: "Sponsors", url: `${siteUrl}/sponsors` },
    { name: "Dashboard", url: `${siteUrl}/sponsor-dashboard` }
  ]
});

export default function SponsorDashboardLayout({ children }) {
  return children;
}