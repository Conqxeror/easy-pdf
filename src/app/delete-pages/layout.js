import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/delete-pages');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Delete Pages Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to delete pages from a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Delete PDF Pages tool is completely free to use. You can remove pages from as many PDF files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when deleting pages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF processing, including page deletion, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I delete multiple pages at once?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can select multiple individual pages or specify page ranges to delete. Simply click on the pages you want to remove or enter ranges like '1-5,8,10-15' in the input field."
              }
            },
            {
              "@type": "Question",
              "name": "Can I undo page deletion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Once you've downloaded the modified PDF, the deleted pages are permanently removed. To recover them, you would need to use the original PDF file. We recommend keeping a backup of your original document."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a limit to the number of pages I can delete?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, you can delete as many pages as you want from your PDF. The tool works with documents of any size, though processing speed may vary based on file complexity."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
