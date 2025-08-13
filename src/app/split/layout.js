import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Split PDF Online – Easy PDF Tool",
  description: "Extract specific pages or split a PDF into multiple files. Free online tool with secure browser-based processing.",
  keywords: [
  "Split PDF",
  "Extract PDF pages",
  "Separate PDF",
  "Divide PDF",
  "PDF splitter",
  "Page extraction",
  "PDF page separator",
  "Document splitter",
  "Free PDF split"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/split",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Splitter",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Splitter", url: "https://easy-pdf-murex.vercel.app/split" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Splitter",
  description: "Extract specific pages or split a PDF into multiple files. Free online tool with secure browser-based processing.",
  url: "/split",
  features: [
  "Extract specific pages",
  "Split by page ranges",
  "Preview before splitting",
  "Download as ZIP"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Splitter", url: "https://easy-pdf-murex.vercel.app/split" }
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
