import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Legal Analyzer for PDF – Easy PDF Tool",
  description: "Analyze legal clauses in PDF files instantly. 100% client-side, privacy-first, fast, and secure legal analyzer. No uploads required.",
  keywords: [
    "Legal analyzer PDF",
    "Analyze PDF clauses",
    "PDF legal tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload legal analyzer",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/legal-analyzer",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Legal Analyzer for PDF",
  description: "Analyze legal clauses in PDF files instantly. 100% client-side, privacy-first, fast, and secure legal analyzer. No uploads required.",
  url: "/legal-analyzer",
  features: [
    "AI-powered analysis",
    "Clause extraction",
    "Risk assessment",
    "Legal insights"
  ]
});

export default function LegalAnalyzerLayout({ children }) {
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