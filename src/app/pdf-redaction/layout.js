import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-redaction');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for PDF Redaction Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I permanently remove sensitive information from a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our tool allows you to permanently redact text, images, and metadata from your PDF documents."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all redaction is done 100% client-side in your browser. Your files never leave your device."
              }
            },
            {
              "@type": "Question",
              "name": "Can I clean metadata from my PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can choose to clean metadata for complete document sanitization."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for redaction."
              }
            },
            {
              "@type": "Question",
              "name": "Is the redaction process secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all processing happens locally in your browser, ensuring privacy and security."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
