import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Compress PDF Online – Reduce PDF Size Free | easy-pdf",
  description: "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor with multiple quality levels. Perfect for email attachments and storage optimization.",
  keywords: [
    "Compress PDF",
    "PDF compressor",
    "Reduce PDF size",
    "Shrink PDF",
    "Optimize PDF",
    "Free PDF compression",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF compressor",
    "PDF optimization",
    "File size reduction",
    "Document compression",
    "PDF file size reducer",
    "Compress large PDF",
    "PDF size optimizer",
    "Small PDF converter",
    "Lightweight PDF",
    "PDF compression tool",
    "Online PDF compressor",
    "Free online PDF compressor"
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
  title: "PDF Compressor",
  description: "Compress PDF files instantly and securely, 100% client-side. Reduce PDF size for free with no uploads. Fast, privacy-first PDF compressor with multiple quality levels.",
  url: "/compress",
  features: [
    "Multiple compression levels",
    "Quality preservation",
    "Batch processing",
    "Size preview"
  ],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF Compressor", url: "https://easy-pdf-murex.vercel.app/compress" }
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
