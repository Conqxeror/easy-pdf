import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Table Extractor - Extract Tables to CSV/Excel",
  description: "Extract and export tables from PDF documents to CSV, Excel, or JSON format. Advanced table detection and data extraction.",
  keywords: [
  "PDF table extraction",
  "extract tables from PDF",
  "PDF to CSV",
  "PDF to Excel",
  "table data extraction",
  "PDF data mining",
  "table converter",
  "data extraction tool",
  "PDF table parser",
  "structured data extraction",
  "tabular data export",
  "PDF data export"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-table-extractor",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Table Extractor",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Table Extractor", url: "https://easy-pdf-murex.vercel.app/tools/pdf-table-extractor" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Table Extractor",
  description: "Extract and export tables from PDF documents to CSV, Excel, or JSON format. Advanced table detection and data extraction.",
  url: "/tools/pdf-table-extractor",
  features: [
  "Extract tables automatically",
  "Export to CSV/Excel/JSON",
  "Preview extracted data",
  "Handle complex table structures"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Table Extractor", url: "https://easy-pdf-murex.vercel.app/tools/pdf-table-extractor" }
  ]
});

export default function Layout({ children }) {
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
