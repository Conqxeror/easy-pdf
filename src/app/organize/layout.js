import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/organize');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Organize PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I organize pages in a PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Upload your PDF, view all pages as thumbnails, then drag and drop pages to rearrange them in the order you want. Download the reorganized PDF when done."
                }
              },
              {
                "@type": "Question",
                "name": "Can I delete pages while organizing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can select and delete unwanted pages directly within the organizing interface. Remove multiple pages at once and download the cleaned PDF."
                }
              },
              {
                "@type": "Question",
                "name": "How many pages can I organize?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can organize PDFs with hundreds of pages. The tool handles large documents efficiently with smooth drag-and-drop functionality."
                }
              },
              {
                "@type": "Question",
                "name": "Is my PDF data safe?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your privacy is guaranteed. All PDF organization happens entirely in your browser. Files are processed locally and never uploaded to any servers."
                }
              },
              {
                "@type": "Question",
                "name": "Can I merge PDFs while organizing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This tool focuses on rearranging pages within a PDF. For merging multiple PDFs, use our dedicated Merge PDF tool which works perfectly in combination with this tool."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
