import { generateEnhancedMetadata } from "@/lib/seoEnhancements";
import { resolveSiteUrl } from "@/lib/siteUrl";

const siteUrl = resolveSiteUrl();

export const metadata = generateEnhancedMetadata({
  title: "Our Sponsors - easy-pdf",
  description: "Meet the amazing sponsors who make easy-pdf completely free for everyone. Discover privacy-focused partners and services that support our mission.",
  keywords: [
    "easy-pdf sponsors", "privacy-focused sponsors", "PDF tool sponsors", "community supporters",
    "free PDF tools sponsors", "privacy tools partners", "document processing sponsors",
    "business partners", "sponsor partnerships", "community funding"
  ],
  canonicalUrl: `${siteUrl}/sponsors`,
  metadataBaseUrl: siteUrl,
  pageType: "article",
  breadcrumbs: [
    { name: "Home", url: siteUrl },
    { name: "Sponsors", url: `${siteUrl}/sponsors` }
  ]
});

export default function SponsorsLayout({ children }) {
  return children;
}