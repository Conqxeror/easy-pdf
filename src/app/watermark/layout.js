import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/watermark');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Watermark PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I add both text and image watermarks to my PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can choose to add either text or image watermarks to your PDF documents, with full control over position, opacity, and rotation for each watermark type."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all watermarking is done 100% client-side in your browser. Your files never leave your device, ensuring complete privacy and security for your documents."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for watermarking. For larger files, consider breaking them into smaller sections first."
              }
            },
            {
              "@type": "Question",
              "name": "Can I adjust the watermark's opacity and rotation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can set the opacity and rotation for both text and image watermarks to achieve the perfect visual effect for your branding or protection needs."
              }
            },
            {
              "@type": "Question",
              "name": "Is the watermark permanent?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, once you download the watermarked PDF, the watermark is embedded permanently and cannot be easily removed unless you use a specialized PDF editor."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
