import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Report Generator - Create Professional Business Reports PDF",
  description: "Create professional business reports with sections, metrics, charts, and recommendations. Perfect for business analysis and reporting.",
  keywords: [
  "report generator",
  "business report",
  "PDF report",
  "professional report",
  "report maker",
  "business analysis",
  "report template",
  "professional reporting"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/report-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Report Generator",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Report Generator", url: "https://easy-pdf-murex.vercel.app/report-generator" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Report Generator",
  description: "Create professional business reports with sections, metrics, charts, and recommendations. Perfect for business analysis and reporting.",
  url: "/report-generator",
  features: [
  "Multiple report templates",
  "Key metrics dashboard",
  "Customizable sections",
  "Professional formatting"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Report Generator", url: "https://easy-pdf-murex.vercel.app/report-generator" }
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
