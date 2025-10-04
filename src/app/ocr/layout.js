import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/ocr');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for OCR Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is OCR and how does it work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "OCR (Optical Character Recognition) is a technology that converts scanned documents, images, and PDFs into editable text. Our tool uses advanced AI algorithms to recognize and extract text from various file formats, making scanned documents searchable and editable."
              }
            },
            {
              "@type": "Question",
              "name": "What file types does the OCR tool support?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our OCR tool supports PDF documents and various image formats including JPG, PNG, TIFF, and BMP. For best results, ensure your documents have clear, high-quality text and good contrast."
              }
            },
            {
              "@type": "Question",
              "name": "How accurate is the text recognition?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The accuracy depends on the quality of your source document. Clear, well-scanned documents with good contrast typically achieve 95%+ accuracy. Handwritten text or low-quality scans may have lower accuracy."
              }
            },
            {
              "@type": "Question",
              "name": "Are my files secure during OCR processing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely! All OCR processing happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents."
              }
            },
            {
              "@type": "Question",
              "name": "Can I extract text from specific pages of a multi-page PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can choose to extract text from all pages, a single page, or a specific range of pages. This is useful for large documents where you only need text from certain sections."
              }
            },
            {
              "@type": "Question",
              "name": "What languages does the OCR tool support?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently, our OCR tool supports English text recognition. For documents in other languages, the accuracy may vary depending on the text quality and character complexity."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
