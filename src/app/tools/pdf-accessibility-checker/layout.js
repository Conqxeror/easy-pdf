import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Accessibility Checker - WCAG Compliance Tool",
  description: "Check PDF documents for accessibility compliance and WCAG standards. Ensure your PDFs are accessible to all users.",
  keywords: [
  "PDF accessibility",
  "WCAG compliance",
  "accessibility checker",
  "document accessibility",
  "screen reader compatibility",
  "inclusive design",
  "accessibility audit",
  "PDF compliance",
  "disability access",
  "universal design",
  "accessibility testing",
  "barrier-free documents"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-accessibility-checker",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Accessibility Checker",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Accessibility Checker", url: "https://easy-pdf-murex.vercel.app/tools/pdf-accessibility-checker" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Accessibility Checker",
  description: "Check PDF documents for accessibility compliance and WCAG standards. Ensure your PDFs are accessible to all users.",
  url: "/tools/pdf-accessibility-checker",
  features: [
  "WCAG compliance check",
  "Alt text validation",
  "Reading order analysis",
  "Color contrast testing",
  "Screen reader compatibility",
  "Accessibility reporting"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Accessibility Checker", url: "https://easy-pdf-murex.vercel.app/tools/pdf-accessibility-checker" }
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
