import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to HTML Converter - Easy PDF Tool",
  description: "Convert PDF files to HTML instantly. 100% client-side, privacy-first, fast, and secure PDF to HTML converter. No uploads required.",
  keywords: [
    "PDF to HTML",
    "Convert PDF to HTML",
    "PDF to web page",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to HTML",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-html",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to HTML Converter",
  description: "Convert PDF files to HTML instantly. 100% client-side, privacy-first, fast, and secure PDF to HTML converter. No uploads required.",
  url: "/pdf-to-html",
  features: [
    "Convert PDF to HTML",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PdfToHtmlLayout({ children }) {
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