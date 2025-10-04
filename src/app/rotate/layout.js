import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/rotate');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Rotate PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to rotate PDF pages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Rotate PDF tool is completely free to use. You can rotate as many PDF files as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when rotating PDFs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF processing, including rotation, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I rotate only specific pages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can specify a custom page range to rotate. This allows you to precisely control which pages are affected by the rotation."
              }
            },
            {
              "@type": "Question",
              "name": "What rotation angles are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can choose from 90 degrees clockwise, 180 degrees, or 270 degrees clockwise (which is equivalent to 90 degrees counter-clockwise)."
              }
            },
            {
              "@type": "Question",
              "name": "Does rotating affect the quality of my PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, rotating your PDF pages with our tool does not affect the quality of your document. The content remains sharp and clear."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
