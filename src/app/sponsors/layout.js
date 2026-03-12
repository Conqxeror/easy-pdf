import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Our Sponsors - easy-pdf",
  description: "Meet the amazing sponsors who make easy-pdf completely free for everyone. Discover privacy-focused partners and services that support our mission.",
  keywords: [
    "easy-pdf sponsors", "privacy-focused sponsors", "PDF tool sponsors", "community supporters",
    "free PDF tools sponsors", "privacy tools partners", "document processing sponsors",
    "business partners", "sponsor partnerships", "community funding"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sponsors",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "article",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Sponsors", url: "/sponsors" }
  ]
});

export default function SponsorsLayout({ children }) {
  return children;
}