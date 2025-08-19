import { generateEnhancedMetadata, generateComprehensiveJsonLd } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Advanced OCR with AI - Smart Text Recognition",
  description: "Extract text from PDFs and images with AI-powered enhancement and formatting. Multi-language support and high accuracy.",
  keywords: [
  "advanced OCR",
  "AI text recognition",
  "smart OCR",
  "text extraction",
  "AI-powered OCR",
  "multi-language OCR",
  "intelligent text recognition",
  "OCR enhancement",
  "document digitization",
  "text mining",
  "AI document processing",
  "smart text extraction"
],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/advanced-ocr",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "Advanced OCR with AI",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Advanced OCR with AI", url: "https://easy-pdf-murex.vercel.app/advanced-ocr" }
  ]
});

const structuredData = generateComprehensiveJsonLd('tool', {
  title: "Advanced OCR with AI",
  description: "Extract text from PDFs and images with AI-powered enhancement and formatting. Multi-language support and high accuracy.",
  url: "/advanced-ocr",
  features: [
  "AI-enhanced text extraction",
  "Multiple language support",
  "Format preservation",
  "Confidence scoring"
],
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Advanced OCR with AI", url: "https://easy-pdf-murex.vercel.app/advanced-ocr" }
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
