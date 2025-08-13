import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Medical Document Analyzer – Easy PDF Tool",
  description: "AI-powered tool for medical document review and key information extraction. Free online medical document analysis tool.",
  keywords: [
  "Medical document analyzer",
  "Medical AI",
  "Health document review",
  "Medical analysis",
  "Patient document",
  "AI medical analysis",
  "Patient data extraction",
  "Diagnosis identification",
  "Health insights"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/medical-analyzer",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Medical Document Analyzer",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Medical Document Analyzer", url: "https://easy-pdf-murex.vercel.app/medical-analyzer" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Medical Document Analyzer",
  description: "AI-powered tool for medical document review and key information extraction. Free online medical document analysis tool.",
  url: "/medical-analyzer",
  features: [
  "Medical AI analysis",
  "Patient data extraction",
  "Diagnosis identification",
  "Health insights"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Medical Document Analyzer", url: "https://easy-pdf-murex.vercel.app/medical-analyzer" }
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
