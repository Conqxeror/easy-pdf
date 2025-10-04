import { getToolMetadata } from "@/lib/toolSeoHelper";

// Get metadata and structured data from centralized helper
const toolSeo = getToolMetadata('/advanced-ocr');
export const metadata = toolSeo?.metadata || {};
const structuredData = toolSeo?.structuredData || [];

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for Advanced OCR Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What makes this OCR tool 'advanced'?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our advanced OCR tool uses multiple recognition engines and processing techniques to achieve higher accuracy than standard OCR tools. It supports multiple languages and offers different processing modes for various document types."
              }
            },
            {
              "@type": "Question",
              "name": "What file types are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our tool supports PDF documents and common image formats including JPG, PNG, BMP, and TIFF. For best results, ensure your documents have clear, high-contrast text."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI-powered mode work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI-powered mode uses advanced neural networks to recognize text patterns with greater accuracy, especially for complex layouts, handwritten text, or documents with poor image quality."
              }
            },
            {
              "@type": "Question",
              "name": "Is my data secure when using this tool?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. All processing happens locally in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security for your sensitive documents."
              }
            },
            {
              "@type": "Question",
              "name": "Can I recognize text in multiple languages?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our tool supports recognition in over 100 languages. Simply select the appropriate language from the dropdown menu before processing your document."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
