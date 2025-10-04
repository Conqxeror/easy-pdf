import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-metadata-editor');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for PDF Metadata Editor Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What metadata can I edit in a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can edit the title, author, subject, keywords, creator, producer, creation date, and modification date of your PDF document."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all metadata editing is done 100% client-side in your browser. Your files never leave your device."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for metadata editing."
              }
            },
            {
              "@type": "Question",
              "name": "Will editing metadata affect the PDF content?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, editing metadata only changes the document properties and does not affect the actual content, text, or layout of the PDF."
              }
            },
            {
              "@type": "Question",
              "name": "Can I revert to the original metadata?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can view and restore the original metadata before making changes."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
