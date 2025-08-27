import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Reorder PDF Pages Online – Free PDF Page Arrangement | easy-pdf",
  description: "Rearrange the order of pages within your PDF document. Free online PDF page reordering tool with drag-and-drop interface. 100% client-side with no uploads.",
  keywords: [
    "Reorder PDF pages",
    "Rearrange PDF",
    "Organize PDF pages",
    "PDF page order",
    "Sort PDF pages",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF reorder",
    "PDF page arrangement",
    "Change PDF page sequence",
    "PDF document reordering",
    "Free PDF page reorder",
    "Online PDF page arrangement",
    "PDF page sorting tool",
    "Drag and drop PDF pages",
    "PDF page management",
    "PDF page sequence changer",
    "Visual PDF page reordering",
    "Interactive PDF page arrangement",
    "Batch PDF page reordering"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/reorder",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Page Reorderer",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Page Reorderer", url: "https://easy-pdf-murex.vercel.app/reorder" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Page Reorderer",
  description: "Rearrange the order of pages within your PDF document. Free online PDF page reordering tool with drag-and-drop interface.",
  url: "/reorder",
  features: [
    "Drag & drop interface",
    "Visual page preview",
    "Instant reordering",
    "Download organized PDF"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Page Reorderer", url: "https://easy-pdf-murex.vercel.app/reorder" }
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
