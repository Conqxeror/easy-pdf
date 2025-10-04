import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf-to-jpg');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for PDF to JPG Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to convert PDF to JPG?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our PDF to JPG converter is completely free to use. You can convert as many PDF files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when converting PDF to JPG?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF to JPG conversion happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I extract text from specific pages of a multi-page PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can choose to convert all pages, a single page, or a specific range of pages. This is useful for large documents where you only need images from certain sections."
              }
            },
            {
              "@type": "Question",
              "name": "What file types does the PDF to JPG tool support?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our tool supports PDF documents and various image formats including JPG, PNG, GIF, and BMP. For best results, ensure your documents have clear, high-quality text and good contrast."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a file size limit for PDF to JPG conversion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the maximum file size for a PDF to be converted to JPG is 50MB. For larger files, processing might be slower due to client-side operations."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
