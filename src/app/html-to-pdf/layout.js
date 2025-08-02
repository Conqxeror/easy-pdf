import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "HTML to PDF Converter – Easy PDF Tool",
  description: "Convert HTML to PDF instantly, 100% client-side. Fast, secure, privacy-first HTML to PDF converter. No uploads required.",
  keywords: [
    "HTML to PDF",
    "Convert HTML",
    "Webpage to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload HTML to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/html-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "HTML to PDF Converter",
  description: "Convert HTML to PDF instantly, 100% client-side. Fast, secure, privacy-first HTML to PDF converter. No uploads required.",
  url: "/html-to-pdf",
  features: [
    "Convert HTML to PDF",
    "Preserve styling",
    "Custom page sizes",
    "Instant conversion"
  ]
});

export default function HtmlToPdfLayout({ children }) {
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