import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Report Generator - Create Professional Business Reports PDF",
  description: "Create professional business reports with sections, metrics, charts, and recommendations. Perfect for business analysis and reporting.",
  keywords: ["report generator", "business report", "pdf report", "professional report", "report maker"],
  canonicalUrl: "/report-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Report Generator",
  description: "Create professional business reports with sections, metrics, charts, and recommendations. Perfect for business analysis and reporting.",
  url: "/report-generator",
  features: [
    "Professional report templates",
    "Key metrics dashboard",
    "Customizable sections",
    "Professional formatting"
  ]
});

export default function ReportGeneratorLayout({ children }) {
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