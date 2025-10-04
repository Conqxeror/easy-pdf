import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-batch-processor');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

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
