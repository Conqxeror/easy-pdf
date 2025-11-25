import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf/merge');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Merge PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is my data uploaded to servers?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No — merging happens client-side in your browser. Files are processed locally and are not uploaded."
              }
            },
            {
              "@type": "Question",
              "name": "What file types are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PDF files only. Make sure each file has a .pdf extension for best results."
              }
            },
            {
              "@type": "Question",
              "name": "What size limits are there?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Individual files up to 50MB are supported. For very large batches, merge in smaller groups to avoid memory limits in the browser."
              }
            },
            {
              "@type": "Question",
              "name": "Can I change the order after uploading?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes — drag any file in the list to change the order before merging."
              }
            },
            {
              "@type": "Question",
              "name": "Will the merged PDF preserve quality?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes — the tool preserves original PDF quality, fonts, and vector content where possible."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
