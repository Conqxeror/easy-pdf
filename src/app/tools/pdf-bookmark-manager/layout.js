import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Bookmark Manager - Organize PDF Navigation",
  description: "Add, edit, and organize PDF bookmarks and navigation structure. Improve document navigation and user experience.",
  keywords: [
    "PDF bookmarks",
    "PDF navigation",
    "bookmark manager",
    "PDF outline",
    "document navigation",
    "PDF table of contents",
    "bookmark editor",
    "navigation structure",
    "PDF organization",
    "document outline",
    "bookmark creation",
    "PDF structure"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-bookmark-manager",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Bookmark Manager",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/#tools" },
    { name: "PDF Bookmark Manager", url: "/tools/pdf-bookmark-manager" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Bookmark Manager",
  description: "Add, edit, and organize PDF bookmarks and navigation structure. Improve document navigation and user experience.",
  url: "/tools/pdf-bookmark-manager",
  features: [
    "Add custom bookmarks",
    "Edit existing bookmarks",
    "Organize bookmark hierarchy",
    "Export bookmark list",
    "Navigation optimization",
    "Structural organization"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Tools", url: "https://easy-pdf-murex.vercel.app/#tools" },
    { name: "PDF Bookmark Manager", url: "https://easy-pdf-murex.vercel.app/tools/pdf-bookmark-manager" }
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
