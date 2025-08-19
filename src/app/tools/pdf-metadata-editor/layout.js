import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF Metadata Editor - Edit PDF Properties Online",
  description: "Edit PDF metadata including title, author, subject, keywords, and creation dates. Free online tool with secure browser-based processing.",
  keywords: [
  "PDF metadata editor",
  "edit PDF properties",
  "PDF title editor",
  "PDF author editor",
  "PDF subject editor",
  "PDF keywords editor",
  "document metadata",
  "PDF information editor",
  "free metadata editor",
  "browser PDF metadata",
  "client-side metadata editing"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/tools/pdf-metadata-editor",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Metadata Editor",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Metadata Editor", url: "https://easy-pdf-murex.vercel.app/tools/pdf-metadata-editor" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Metadata Editor",
  description: "Edit PDF metadata including title, author, subject, keywords, and creation dates. Free online tool with secure browser-based processing.",
  url: "/tools/pdf-metadata-editor",
  features: [
  "Edit title, author, subject",
  "Modify keywords and creation date",
  "Preserve document structure",
  "Client-side processing"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Metadata Editor", url: "https://easy-pdf-murex.vercel.app/tools/pdf-metadata-editor" }
  ]
});

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* FAQ structured data for PDF Metadata Editor Tool */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What metadata can I edit in a PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can edit the title, author, subject, keywords, creator, producer, creation date, and modification date of your PDF document."
              }
            },
            {
              "@type": "Question",
              "name": "Is my PDF file uploaded to any server?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, all metadata editing is done 100% client-side in your browser. Your files never leave your device."
              }
            },
            {
              "@type": "Question",
              "name": "Are there any limits on file size?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can upload PDF files up to 50MB for metadata editing."
              }
            },
            {
              "@type": "Question",
              "name": "Will editing metadata affect the PDF content?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No, editing metadata only changes the document properties and does not affect the actual content, text, or layout of the PDF."
              }
            },
            {
              "@type": "Question",
              "name": "Can I revert to the original metadata?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you can view and restore the original metadata before making changes."
              }
            }
          ]
        }) }}
      />
      {children}
    </>
  );
}
