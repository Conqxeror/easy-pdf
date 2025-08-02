import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to PDF/A Converter - Easy PDF Tool",
  description: "Convert PDF files to PDF/A instantly. 100% client-side, privacy-first, fast, and secure PDF to PDF/A converter. No uploads required.",
  keywords: [
    "PDF to PDF/A",
    "Convert PDF to PDF/A",
    "PDF/A converter",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to PDF/A",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-pdfa",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to PDF/A Converter",
  description: "Convert PDF files to PDF/A instantly. 100% client-side, privacy-first, fast, and secure PDF to PDF/A converter. No uploads required.",
  url: "/pdf-to-pdfa",
  features: [
    "Convert PDF to PDF/A",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PdfToPdfaLayout({ children }) {
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