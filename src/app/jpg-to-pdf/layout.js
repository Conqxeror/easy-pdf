import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/jpg-to-pdf');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for JPG to PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to convert JPG to PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our JPG to PDF converter is completely free to use. You can convert as many image files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when converting JPG to PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All JPG to PDF conversion happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "What image formats are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our tool supports JPG, PNG, GIF, and WEBP image formats. You can combine different image types into a single PDF."
              }
            },
            {
              "@type": "Question",
              "name": "Can I combine multiple images into one PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can upload multiple image files, and our tool will combine them into a single PDF document, with each image appearing on a new page."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a file size limit for JPG to PDF conversion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "While there isn't a strict limit on the number of images, the total size of all uploaded images should ideally not exceed 50MB for optimal performance, as all processing occurs client-side."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
