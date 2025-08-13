import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Redaction Tool - Remove Sensitive Information",
  description: "Permanently remove sensitive information from PDF documents with secure redaction and verification. GDPR compliant and privacy-focused.",
  keywords: [
  "PDF redaction",
  "remove sensitive data",
  "document privacy",
  "data protection",
  "GDPR compliance",
  "information removal",
  "document sanitization",
  "privacy tool",
  "secure redaction",
  "content removal",
  "document security",
  "data anonymization"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-redaction",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Redaction Tool",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Redaction Tool", url: "https://easy-pdf-murex.vercel.app/tools/pdf-redaction" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Redaction Tool",
  description: "Permanently remove sensitive information from PDF documents with secure redaction and verification. GDPR compliant and privacy-focused.",
  url: "/tools/pdf-redaction",
  features: [
  "Content removal",
  "Metadata cleaning",
  "Visual verification",
  "Secure deletion"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Redaction Tool", url: "https://easy-pdf-murex.vercel.app/tools/pdf-redaction" }
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
