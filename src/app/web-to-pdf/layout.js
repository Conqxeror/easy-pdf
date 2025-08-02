import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Web to PDF Converter - Easy PDF Tool",
  description: "Convert web pages to PDF instantly. 100% client-side, privacy-first, fast, and secure web to PDF converter. No uploads required.",
  keywords: [
    "Web to PDF",
    "Convert web page to PDF",
    "HTML to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload Web to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/web-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Web to PDF Converter",
  description: "Convert web pages to PDF instantly. 100% client-side, privacy-first, fast, and secure web to PDF converter. No uploads required.",
  url: "/web-to-pdf",
  features: [
    "Convert web pages to PDF",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function WebToPdfLayout({ children }) {
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