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

      {/* FAQ structured data for PDF Redaction Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I permanently remove sensitive information from a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our tool allows you to permanently redact text, images, and metadata from your PDF documents."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all redaction is done 100% client-side in your browser. Your files never leave your device."
              }
            },
            {
              "@type": "Question",
              "name": "Can I clean metadata from my PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can choose to clean metadata for complete document sanitization."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for redaction."
              }
            },
            {
              "@type": "Question",
              "name": "Is the redaction process secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, all processing happens locally in your browser, ensuring privacy and security."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
