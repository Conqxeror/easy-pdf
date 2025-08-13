import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "PDF to JPG Converter – Easy PDF Tool",
  description: "Convert PDF pages into high-quality JPG image files. Free online tool with customizable quality settings and batch processing.",
  keywords: [
  "PDF to JPG",
  "PDF to PNG",
  "Convert PDF to image",
  "PDF to photo",
  "Extract images",
  "PDF image converter",
  "Document to image",
  "Free PDF converter"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/pdf-to-jpg",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF to Image Converter",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF to Image Converter", url: "https://easy-pdf-murex.vercel.app/pdf-to-jpg" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF to Image Converter",
  description: "Convert PDF pages into high-quality JPG image files. Free online tool with customizable quality settings and batch processing.",
  url: "/pdf-to-jpg",
  features: [
  "High-quality output",
  "Custom resolution",
  "Batch processing",
  "Multiple formats"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF to Image Converter", url: "https://easy-pdf-murex.vercel.app/pdf-to-jpg" }
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
