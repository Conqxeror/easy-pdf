import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-version-comparison');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for PDF Version Comparison Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I compare two different PDF versions?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can upload two PDF files and visually compare their content, layout, and changes."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF data secure during comparison?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "All processing is done client-side in your browser. Your files are never uploaded to any server."
              }
            },
            {
              "@type": "Question",
              "name": "What types of differences can I detect?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can detect text changes, layout modifications, and other visual differences between PDF versions."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any file size limits?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB each for comparison."
              }
            },
            {
              "@type": "Question",
              "name": "Can I download the comparison results?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can download a summary or visual diff of the comparison results."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
