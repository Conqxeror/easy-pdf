import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to Text Converter - Easy PDF Tool",
  description: "Convert PDF files to Text instantly. 100% client-side, privacy-first, fast, and secure PDF to Text converter. No uploads required.",
  keywords: [
    "PDF to Text",
    "Convert PDF to Text",
    "PDF to TXT",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to Text",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-text",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to Text Converter",
  description: "Convert PDF files to Text instantly. 100% client-side, privacy-first, fast, and secure PDF to Text converter. No uploads required.",
  url: "/pdf-to-text",
  features: [
    "Convert PDF to Text",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PdfToTextLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}