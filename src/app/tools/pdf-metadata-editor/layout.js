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
      {children}
    </>
  );
}
