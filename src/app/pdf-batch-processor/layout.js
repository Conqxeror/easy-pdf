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
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-batch-processor",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Batch Processor",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Batch Processor", url: "https://easy-pdf-murex.vercel.app/pdf-batch-processor" }
  ]
});


const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Batch Processor",
  description: "Process multiple PDF files at once with various operations like merge, split, compress. Efficient bulk PDF processing tool.",
  url: "/pdf-batch-processor",
  features: [
    "Batch merge multiple PDFs",
    "Bulk compression",
    "Mass watermarking",
    "Batch operations"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Batch Processor", url: "https://easy-pdf-murex.vercel.app/pdf-batch-processor" }
  ]
});

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What types of batch operations are available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The PDF Batch Processor supports four main operations: merge (combine all PDFs into one), compress (reduce file sizes), split (separate each PDF by page), and rotate (rotate all pages 90 degrees)."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a limit to how many files I can process?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can upload multiple PDF files, but for best performance, we recommend processing up to 20 files at once. Each file should be under 50MB for optimal results."
      }
    },
    {
      "@type": "Question",
      "name": "Are my files secure during batch processing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! All processing happens locally in your browser. Your files never leave your device, ensuring complete privacy and security for your sensitive documents."
      }
    },
    {
      "@type": "Question",
      "name": "Can I process different operations on different files?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Currently, the batch processor applies the same operation to all uploaded files. For different operations, you'll need to process files in separate batches."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if one file fails during processing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If a file fails during processing, the tool will continue with the remaining files. Failed files will be logged in the console, and you'll still receive the successfully processed files."
      }
    }
  ]
};

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      {children}
    </>
  );
}
