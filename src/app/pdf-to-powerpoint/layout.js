import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to PowerPoint Converter - Easy PDF Tool",
  description: "Convert PDF files to PowerPoint instantly. 100% client-side, privacy-first, fast, and secure PDF to PowerPoint converter. No uploads required.",
  keywords: [
    "PDF to PowerPoint",
    "Convert PDF to PowerPoint",
    "PDF to PPTX",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF to PowerPoint",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-powerpoint",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to PowerPoint Converter",
  description: "Convert PDF files to PowerPoint instantly. 100% client-side, privacy-first, fast, and secure PDF to PowerPoint converter. No uploads required.",
  url: "/pdf-to-powerpoint",
  features: [
    "Convert PDF to PowerPoint",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PdfToPowerpointLayout({ children }) {
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