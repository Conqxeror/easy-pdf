import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Version Comparison - Document Diff Tool",
  description: "Compare different versions of PDF documents with visual diff highlighting. Track changes and identify differences between document versions.",
  keywords: [
  "PDF comparison",
  "document diff",
  "version control",
  "change tracking",
  "document comparison",
  "PDF diff tool",
  "version tracking",
  "change detection",
  "document versioning",
  "file comparison",
  "revision tracking",
  "document analysis"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-version-comparison",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Version Comparison",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Version Comparison", url: "https://easy-pdf-murex.vercel.app/tools/pdf-version-comparison" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Version Comparison",
  description: "Compare different versions of PDF documents with visual diff highlighting. Track changes and identify differences between document versions.",
  url: "/tools/pdf-version-comparison",
  features: [
  "Visual diff",
  "Text comparison",
  "Layout changes",
  "Version tracking"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Version Comparison", url: "https://easy-pdf-murex.vercel.app/tools/pdf-version-comparison" }
  ]
});

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for PDF Version Comparison Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Can I compare two different PDF versions?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can upload two PDF files and visually compare their content, layout, and changes."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF data secure during comparison?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "All processing is done client-side in your browser. Your files are never uploaded to any server."
              }
            },
            {
              "@type": "Question",
              "name": "What types of differences can I detect?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can detect text changes, layout modifications, and other visual differences between PDF versions."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any file size limits?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB each for comparison."
              }
            },
            {
              "@type": "Question",
              "name": "Can I download the comparison results?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can download a summary or visual diff of the comparison results."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
