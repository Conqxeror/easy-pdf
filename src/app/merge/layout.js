import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Merge PDF Files Online – Easy PDF Tool",
  description:
    "Merge multiple PDF files into one, 100% client-side, privacy-first. Fast, free, and secure PDF merger for everyone. No uploads, instant processing.",
  keywords: [
    "Merge PDF", "Combine PDF", "PDF merger", "Join PDF", "PDF tools", "Client-side PDF",
    "Privacy PDF tool", "No upload PDF merger", "Free PDF merger", "Secure PDF merge",
    "Browser PDF merge", "Offline PDF merge", "PDF combiner", "Document merger"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/merge",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Merger",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Merge PDF", url: "https://easy-pdf-murex.vercel.app/merge" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Merge PDF Files Online",
  description: "Combine multiple PDF files into one seamless document with drag-and-drop functionality",
  url: "/merge",
  features: [
    "Drag & drop multiple files",
    "Reorder before merging", 
    "No file size limits",
    "100% secure processing",
    "Instant preview",
    "Download merged PDF"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Merge PDF", url: "https://easy-pdf-murex.vercel.app/merge" }
  ]
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function MergeLayout({ children }) {
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


