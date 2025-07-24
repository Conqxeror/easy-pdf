import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Compress PDF Online – Easy PDF Tool",
  description: "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor with multiple quality levels.",
  keywords: [
    "Compress PDF", "PDF compressor", "Reduce PDF size", "Shrink PDF", "Optimize PDF",
    "Free PDF compression", "Client-side PDF", "Privacy PDF tool", "No upload PDF compressor",
    "PDF optimization", "File size reduction", "Document compression"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/compress",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Compressor",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Compress PDF", url: "https://easy-pdf-murex.vercel.app/compress" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Compress PDF Online",
  description: "Reduce PDF file size while maintaining quality with multiple compression levels",
  url: "/compress",
  features: [
    "Multiple compression levels",
    "Quality preservation", 
    "Batch processing",
    "Size preview",
    "Instant compression",
    "No quality loss"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Compress PDF", url: "https://easy-pdf-murex.vercel.app/compress" }
  ]
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function CompressLayout({ children }) {
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

