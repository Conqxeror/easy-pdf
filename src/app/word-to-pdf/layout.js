import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Word to PDF Converter - Easy PDF Tool",
  description: "Convert Word files to PDF instantly. 100% client-side, privacy-first, fast, and secure Word to PDF converter. No uploads required.",
  keywords: [
    "Word to PDF",
    "Convert Word to PDF",
    "DOCX to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload Word to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/word-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Word to PDF Converter",
  description: "Convert Word files to PDF instantly. 100% client-side, privacy-first, fast, and secure Word to PDF converter. No uploads required.",
  url: "/word-to-pdf",
  features: [
    "Convert Word files to PDF",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function WordToPdfLayout({ children }) {
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