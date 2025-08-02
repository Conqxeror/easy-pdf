import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "OCR PDF (Extract Text) – Easy PDF Tool",
  description: "Extract text from PDF using OCR instantly. 100% client-side, privacy-first, fast, and secure PDF OCR tool. No uploads required.",
  keywords: [
    "OCR PDF",
    "Extract text PDF",
    "PDF OCR",
    "Text recognition PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF OCR",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/ocr",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "OCR PDF (Extract Text) – Easy PDF Tool",
  description: "Extract text from PDF using OCR instantly. 100% client-side, privacy-first, fast, and secure PDF OCR tool. No uploads required.",
  url: "/ocr",
  features: [
    "Extract text from PDF",
    "Multiple languages supported",
    "Instant processing",
    "Secure and private"
  ]
});

export default function OcrLayout({ children }) {
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