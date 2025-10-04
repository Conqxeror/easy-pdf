import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/qr-generator');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for QR Generator Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the QR code generator free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can create and download unlimited QR codes for free."
              }
            },
            {
              "@type": "Question",
              "name": "Can I create QR codes for WiFi, email, or contacts?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our tool supports many QR code types including WiFi, email, vCard, phone, and more."
              }
            },
            {
              "@type": "Question",
              "name": "Are my QR code contents stored?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all generation is done in your browser. Your content is never uploaded or saved."
              }
            },
            {
              "@type": "Question",
              "name": "Can I customize the QR code's appearance?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can adjust size, margin, and error correction level. Advanced styling coming soon."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a limit to the number of QR codes I can generate?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No limits—generate as many as you need!"
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
