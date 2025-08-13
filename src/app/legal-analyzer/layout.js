import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Legal Document Analyzer – Easy PDF Tool",
  description: "AI-powered tool for legal document review and clause extraction. Free online legal document analysis tool with risk assessment.",
  keywords: [
  "Legal document analyzer",
  "Contract review",
  "Legal AI",
  "Document analysis",
  "Clause extraction",
  "AI document processing",
  "Legal analysis",
  "Contract analysis",
  "Document review"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/legal-analyzer",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Legal Document Analyzer",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Legal Document Analyzer", url: "https://easy-pdf-murex.vercel.app/legal-analyzer" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Legal Document Analyzer",
  description: "AI-powered tool for legal document review and clause extraction. Free online legal document analysis tool with risk assessment.",
  url: "/legal-analyzer",
  features: [
  "AI-powered analysis",
  "Clause extraction",
  "Risk assessment",
  "Legal insights"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Legal Document Analyzer", url: "https://easy-pdf-murex.vercel.app/legal-analyzer" }
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
