import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "JPG to PDF Converter – Easy PDF Tool",
  description: "Convert JPG, PNG, and other images to PDF format. Free online converter with batch processing and custom page sizing. No uploads, instant conversion.",
  keywords: [
    "JPG to PDF", "PNG to PDF", "Image to PDF", "Convert images", "Photo to PDF",
    "Image converter", "Picture to PDF", "Free image converter", "Batch image conversion"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/jpg-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Image to PDF Converter",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Image to PDF Converter", url: "https://easy-pdf-murex.vercel.app/jpg-to-pdf" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "JPG to PDF Converter – Easy PDF Tool",
  description: "Convert JPG, PNG, and other images to PDF format. Free online converter with batch processing and custom page sizing. No uploads, instant conversion.",
  url: "/jpg-to-pdf",
  features: [
    "Multiple image formats",
    "Batch conversion",
    "Custom page sizes",
    "Image ordering",
    "Quality preservation",
    "Instant conversion"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Image to PDF Converter", url: "https://easy-pdf-murex.vercel.app/jpg-to-pdf" }
  ]
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

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