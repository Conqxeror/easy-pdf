import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Batch Processor - Bulk PDF Operations",
  description: "Process multiple PDF files at once with various operations like merge, split, compress. Efficient bulk PDF processing tool.",
  keywords: [
  "PDF batch processing",
  "bulk PDF operations",
  "mass PDF processing",
  "batch converter",
  "bulk merge PDF",
  "batch compression",
  "mass watermarking",
  "automated PDF processing",
  "bulk PDF tools",
  "batch operations",
  "multiple file processing",
  "PDF automation"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-batch-processor",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Batch Processor",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Batch Processor", url: "https://easy-pdf-murex.vercel.app/tools/pdf-batch-processor" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Batch Processor",
  description: "Process multiple PDF files at once with various operations like merge, split, compress. Efficient bulk PDF processing tool.",
  url: "/tools/pdf-batch-processor",
  features: [
  "Batch merge multiple PDFs",
  "Bulk compression",
  "Mass watermarking",
  "Batch operations"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Batch Processor", url: "https://easy-pdf-murex.vercel.app/tools/pdf-batch-processor" }
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
