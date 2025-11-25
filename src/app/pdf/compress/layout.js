import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/pdf/compress');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Compress PDF Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How much can I compress my PDF file?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The compression amount depends on the content of your PDF. Documents with many images or large embedded fonts will see significant reduction, while text-only PDFs may have less room for compression. Our tool uses advanced algorithms to optimize file size."
              }
            },
            {
              "@type": "Question",
              "name": "Is it safe to compress my PDF files online?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Your privacy and security are our top priorities. All PDF compression happens directly in your web browser. Your files are never uploaded to our servers, ensuring your documents remain confidential."
              }
            },
            {
              "@type": "Question",
              "name": "Will the quality of my PDF be affected?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our PDF compressor is designed to reduce file size while minimizing quality loss. You can choose from different compression levels and adjust image quality to find the right balance for your needs. For most uses, the 'Balanced' option provides excellent results."
              }
            },
            {
              "@type": "Question",
              "name": "What types of content are compressed in a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our compressor primarily optimizes images within the PDF by re-encoding them with efficient compression algorithms. It also removes redundant PDF objects and optimizes fonts, leading to overall file size reduction."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a file size limit for compression?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, the maximum file size for a PDF to be compressed is 50MB. For larger files, processing might be slower due to client-side operations."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
