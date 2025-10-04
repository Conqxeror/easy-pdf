import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/reorder');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Reorder PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to reorder PDF pages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Reorder PDF Pages tool is completely free to use. You can rearrange pages in as many PDF files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when reordering pages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF processing, including reordering, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I reorder pages from multiple PDFs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This tool is designed to reorder pages within a single PDF document. If you need to combine pages from multiple PDFs, please use our 'Merge PDF' tool first, and then reorder the combined document."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a limit to the number of pages I can reorder?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "While there isn't a strict limit on the number of pages, very large PDFs (e.g., hundreds of pages) might take longer to load and process due to client-side operations. We recommend keeping file sizes manageable for optimal performance."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
