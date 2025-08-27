import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Delete PDF Pages Online – Free PDF Page Remover | easy-pdf",
  description: "Remove unwanted pages from your PDF document easily. Free online tool to extract specific pages or delete page ranges. 100% client-side with no uploads.",
  keywords: [
    "Delete PDF pages",
    "Remove PDF pages",
    "Extract PDF pages",
    "PDF page removal",
    "Trim PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF delete",
    "PDF page extractor",
    "Remove specific PDF pages",
    "Delete PDF page range",
    "PDF document trimming",
    "Free PDF page remover",
    "Online PDF page deletion",
    "PDF page management",
    "Selective PDF page removal",
    "PDF page cutter",
    "PDF page reduction",
    "Batch PDF page deletion",
    "PDF page cleanup"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/delete-pages",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Page Deleter",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Page Deleter", url: "https://easy-pdf-murex.vercel.app/delete-pages" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Page Deleter",
  description: "Remove unwanted pages from your PDF document easily. Free online tool to extract specific pages or delete page ranges.",
  url: "/delete-pages",
  features: [
    "Select specific pages",
    "Page range deletion",
    "Preview before deletion",
    "Instant processing"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Page Deleter", url: "https://easy-pdf-murex.vercel.app/delete-pages" }
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
