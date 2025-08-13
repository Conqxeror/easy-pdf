import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Add Page Numbers to PDF – Easy PDF Tool",
  description: "Insert customizable page numbers, headers, or footers into your PDF. Free online tool with header/footer options and custom numbering.",
  keywords: [
  "Add page numbers",
  "PDF page numbers",
  "Number PDF pages",
  "PDF headers footers",
  "Paginate PDF",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF numbering",
  "Wali Mohammad Kadri"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/page-numbers",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Page Number Tool",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Page Number Tool", url: "https://easy-pdf-murex.vercel.app/page-numbers" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Page Number Tool",
  description: "Insert customizable page numbers, headers, or footers into your PDF. Free online tool with header/footer options and custom numbering.",
  url: "/page-numbers",
  features: [
  "Custom numbering formats",
  "Header & footer options",
  "Position control",
  "Font customization"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Page Number Tool", url: "https://easy-pdf-murex.vercel.app/page-numbers" }
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
