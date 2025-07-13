import { generateMetadata as generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata({
  title: "Report Generator - Create Professional Business Reports PDF",
  description: "Create professional business reports with sections, metrics, charts, and recommendations. Perfect for business analysis and reporting.",
  keywords: ["report generator", "business report", "pdf report", "professional report", "report maker"],
  canonicalUrl: "/report-generator",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app"
});

export default function ReportGeneratorLayout({ children }) {
  return children;
}