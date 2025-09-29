import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Merge PDF Online – Easy PDF Tool",
  description: "Combine multiple PDF files into one seamlessly. Our free online PDF merger runs 100% in your browser — no uploads, fast processing, and built for privacy. Perfect for reports, presentations, and archiving.",
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
  description: "Combine multiple PDF files into one seamlessly. Our client-side PDF merger supports drag & drop, reordering, and instant merging without leaving your browser. Ideal for professionals and casual users who need a quick, private merge.",
  url: "/merge",
  features: [
    "Drag & drop multiple files",
    "Reorder files with drag-and-drop",
    "Preview merged output",
    "No server uploads — 100% client-side processing",
    "Supports large PDFs up to 50MB per file",
    "Preserves original PDF quality and metadata (optional)"
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
