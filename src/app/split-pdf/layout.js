import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Split PDF Pages Online – Easy PDF Tool",
  description: "Split PDF files into separate pages instantly. 100% client-side, privacy-first, fast, and secure PDF splitter for everyone. No uploads required.",
  keywords: [
    "Split PDF",
    "PDF splitter",
    "Extract PDF pages",
    "Separate PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF split",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/split-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Split PDF Pages Online",
  description: "Split PDF files into separate pages instantly. 100% client-side, privacy-first, fast, and secure PDF splitter for everyone. No uploads required.",
  url: "/split-pdf",
  features: [
    "Extract specific pages",
    "Split by page ranges",
    "Preview before splitting",
    "Download as ZIP"
  ]
});

export default function SplitPdfLayout({ children }) {
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