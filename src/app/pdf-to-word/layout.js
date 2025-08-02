import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to Word Converter - Easy PDF Tool",
  description: "Convert PDF files to Word instantly. 100% client-side, privacy-first, fast, and secure PDF to Word converter. No uploads required.",
  keywords: [
    "PDF to Word",
    "Convert PDF to Word",
    "PDF to DOCX",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to Word",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-word",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to Word Converter",
  description: "Convert PDF files to Word instantly. 100% client-side, privacy-first, fast, and secure PDF to Word converter. No uploads required.",
  url: "/pdf-to-word",
  features: [
    "Convert PDF to Word",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PdfToWordLayout({ children }) {
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