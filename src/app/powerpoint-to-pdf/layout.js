import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PowerPoint to PDF Converter - Easy PDF Tool",
  description: "Convert PowerPoint files to PDF instantly. 100% client-side, privacy-first, fast, and secure PowerPoint to PDF converter. No uploads required.",
  keywords: [
    "PowerPoint to PDF",
    "Convert PowerPoint to PDF",
    "PPTX to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PowerPoint to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/powerpoint-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PowerPoint to PDF Converter",
  description: "Convert PowerPoint files to PDF instantly. 100% client-side, privacy-first, fast, and secure PowerPoint to PDF converter. No uploads required.",
  url: "/powerpoint-to-pdf",
  features: [
    "Convert PowerPoint to PDF",
    "Batch conversion",
    "Instant conversion"
  ]
});

export default function PowerpointToPdfLayout({ children }) {
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