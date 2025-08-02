import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Excel to PDF Converter - Easy PDF Tool",
  description: "Convert Excel files to PDF instantly. 100% client-side, privacy-first, fast, and secure Excel to PDF converter. No uploads required.",
  keywords: [
    "Excel to PDF",
    "Convert Excel to PDF",
    "Excel converter",
    "XLSX to PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload Excel to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/excel-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Excel to PDF Converter",
  description: "Convert Excel files to PDF instantly. 100% client-side, privacy-first, fast, and secure Excel to PDF converter. No uploads required.",
  url: "/excel-to-pdf",
  features: [
    "Convert Excel files to PDF",
    "Batch conversion",
    "Custom page sizes",
    "Instant conversion"
  ]
});

export default function ExcelToPdfLayout({ children }) {
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