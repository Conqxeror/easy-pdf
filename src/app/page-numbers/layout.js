import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/page-numbers');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Add Page Numbers Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I add page numbers to my PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Upload your PDF file, configure page numbering options (position, format, starting number), and download the modified PDF with page numbers added to every page."
                }
              },
              {
                "@type": "Question",
                "name": "Where can I position page numbers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can place page numbers at the top, bottom, or sides of each page, with full customization of font size, style, and positioning."
                }
              },
              {
                "@type": "Question",
                "name": "Can I skip numbering on specific pages?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can exclude the first page or any other pages from numbering while maintaining page numbers on the rest of the document."
                }
              },
              {
                "@type": "Question",
                "name": "Is my file secure when adding page numbers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. All page numbering operations happen directly in your browser. Your files never leave your device and are never uploaded to servers."
                }
              },
              {
                "@type": "Question",
                "name": "What numbering formats are available?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We support various numbering formats including standard numerals (1, 2, 3), Roman numerals (I, II, III), and letters (A, B, C)."
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
