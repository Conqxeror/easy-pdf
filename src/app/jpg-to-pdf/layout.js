import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "JPG to PDF Converter – Free Image to PDF | easy-pdf",
  description: "Convert JPG, PNG, and other images to PDF format. Free online converter with batch processing and custom page sizing. 100% client-side with no uploads.",
  keywords: [
    "JPG to PDF",
    "PNG to PDF",
    "Image to PDF",
    "Convert images",
    "Photo to PDF",
    "Image converter",
    "Picture to PDF",
    "Free image converter",
    "Batch image conversion",
    "Online JPG to PDF",
    "Free PNG to PDF converter",
    "Image PDF converter",
    "Photo PDF creator",
    "Multiple image to PDF",
    "JPG PDF converter",
    "PNG PDF converter",
    "Image file to PDF",
    "Online image converter",
    "Free photo to PDF",
    "Batch JPG to PDF"
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
  title: "Image to PDF Converter",
  description: "Convert JPG, PNG, and other images to PDF format. Free online converter with batch processing and custom page sizing.",
  url: "/jpg-to-pdf",
  features: [
    "Multiple image formats",
    "Batch conversion",
    "Custom page sizes",
    "Image ordering"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Image to PDF Converter", url: "https://easy-pdf-murex.vercel.app/jpg-to-pdf" }
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
