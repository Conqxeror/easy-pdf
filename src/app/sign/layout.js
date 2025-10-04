import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/sign');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Sign PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is it free to sign PDF documents?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our PDF signing tool is completely free to use. You can sign as many PDF documents as you need without any hidden costs or limitations."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure when signing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy is our top priority. All PDF processing, including signature placement, happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Can I add multiple signatures to one document?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently, you can add one signature per session. To add multiple signatures, you would need to repeat the process with the previously signed PDF."
              }
            },
            {
              "@type": "Question",
              "name": "What signature formats are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can draw freehand signatures using your mouse, trackpad, or touch screen. The tool supports customizable pen colors and stroke widths for personalized signatures."
              }
            },
            {
              "@type": "Question",
              "name": "Can I sign on any page of the PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can select any page of your PDF document to place your signature. Use the page selector to choose the specific page where you want to add your signature."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
