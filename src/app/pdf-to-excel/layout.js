import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to Excel Converter - Easy PDF Tool",
  description: "Convert PDF files to Excel instantly. 100% client-side, privacy-first, fast, and secure PDF to Excel converter. No uploads required.",
  keywords: [
    "PDF to Excel",
    "Convert PDF to Excel",
    "PDF to XLSX",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to Excel",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-excel",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to Excel Converter",
  description: "Convert PDF files to Excel instantly. 100% client-side, privacy-first, fast, and secure PDF to Excel converter. No uploads required.",
  url: "/pdf-to-excel",
  features: [
    "Convert PDF to Excel",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PdfToExcelLayout({ children }) {
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