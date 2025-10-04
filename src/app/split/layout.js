import { metadata } from './metadata';
import { getToolMetadata } from "@/lib/toolSeoHelper";

export { metadata };

// Get structured data from centralized helper
const toolSeo = getToolMetadata('/split');
const structuredData = toolSeo?.structuredData || [];

export default function SplitPdfLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Split PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to split PDF files?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our PDF splitter is completely free to use. You can split as many PDF files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure and private?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "All splitting is done client-side in your browser. Your files are never uploaded or stored on any server, ensuring complete privacy for your documents."
              }
            },
            {
              "@type": "Question",
              "name": "Can I split large PDFs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can split PDFs up to 50MB in size. For very large files, consider splitting in batches to maintain optimal performance."
              }
            },
            {
              "@type": "Question",
              "name": "Can I extract non-consecutive pages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Custom Ranges option allows you to define multiple page ranges to extract non-consecutive pages in a single operation."
              }
            },
            {
              "@type": "Question",
              "name": "What format will my split files be in?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You will receive standard PDF files, or a ZIP archive if extracting individual pages or custom ranges. Each split PDF maintains the original quality and formatting."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}