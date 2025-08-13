import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "OCR (Text Recognition) PDF – Easy PDF Tool",
  description: "Extract editable text from scanned PDFs and images. Free online OCR tool with multiple language support and high accuracy.",
  keywords: [
  "OCR PDF",
  "Extract text",
  "PDF text recognition",
  "Scan to text",
  "PDF OCR online",
  "Client-side PDF",
  "Privacy PDF tool",
  "No upload PDF OCR",
  "Wali Mohammad Kadri"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/ocr",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF OCR Tool",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF OCR Tool", url: "https://easy-pdf-murex.vercel.app/ocr" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "PDF OCR Tool",
  description: "Extract editable text from scanned PDFs and images. Free online OCR tool with multiple language support and high accuracy.",
  url: "/ocr",
  features: [
  "Text extraction",
  "Multiple languages",
  "Image processing",
  "Editable output"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "PDF OCR Tool", url: "https://easy-pdf-murex.vercel.app/ocr" }
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
