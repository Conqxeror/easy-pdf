import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Sign / Annotate PDF Online – Easy PDF Tool",
  description: "Draw, type, or upload your signature and place it on your PDF. Free online PDF signing tool with drawing and typing options.",
  keywords: [
  "Sign PDF",
  "PDF signature",
  "Annotate PDF",
  "Digital signature",
  "PDF signing tool",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF sign",
  "Wali Mohammad Kadri"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/sign",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Signature Tool",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Signature Tool", url: "https://easy-pdf-murex.vercel.app/sign" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF Signature Tool",
  description: "Draw, type, or upload your signature and place it on your PDF. Free online PDF signing tool with drawing and typing options.",
  url: "/sign",
  features: [
  "Digital signatures",
  "Drawing tools",
  "Text annotations",
  "Signature placement"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Signature Tool", url: "https://easy-pdf-murex.vercel.app/sign" }
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
