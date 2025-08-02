import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Version Comparison - Document Diff Tool",
  description: "Compare different versions of PDF documents with visual diff highlighting. Track changes and identify differences between document versions.",
  keywords: [
    "PDF comparison",
    "document diff",
    "version control",
    "change tracking",
    "document comparison",
    "PDF diff tool",
    "version tracking",
    "change detection",
    "document versioning",
    "file comparison",
    "revision tracking",
    "document analysis"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-version-comparison",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Version Comparison",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/#tools" },
    { name: "PDF Version Comparison", url: "/tools/pdf-version-comparison" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Version Comparison",
  description: "Compare different versions of PDF documents with visual diff highlighting. Track changes and identify differences between document versions.",
  url: "/tools/pdf-version-comparison",
  features: [
    "Visual diff",
    "Text comparison",
    "Layout changes",
    "Version tracking",
    "Change highlighting",
    "Detailed reports"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Tools", url: "https://easy-pdf-murex.vercel.app/#tools" },
    { name: "PDF Version Comparison", url: "https://easy-pdf-murex.vercel.app/tools/pdf-version-comparison" }
  ]
});

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
