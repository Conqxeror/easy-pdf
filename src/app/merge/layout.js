import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Merge PDF Online – Easy PDF Tool",
  description: "Combine multiple PDF files into one seamlessly. Free online PDF merger with 100% client-side processing. Fast, secure, and privacy-first.",
  keywords: [
  "Merge PDF",
  "Combine PDF",
  "PDF merger",
  "Join PDF",
  "PDF tools",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF merger",
  "Free PDF merger",
  "Secure PDF merge",
  "Browser PDF merge",
  "Offline PDF merge",
  "PDF combiner",
  "Document merger"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/merge",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Merger",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Merger", url: "https://easy-pdf-murex.vercel.app/merge" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Merger",
  description: "Combine multiple PDF files into one seamlessly. Free online PDF merger with 100% client-side processing. Fast, secure, and privacy-first.",
  url: "/merge",
  features: [
  "Drag & drop multiple files",
  "Reorder before merging",
  "No file size limits",
  "100% secure processing"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Merger", url: "https://easy-pdf-murex.vercel.app/merge" }
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
