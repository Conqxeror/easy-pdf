import { generateEnhancedMetadata } from "@/lib/seoEnhancements";
import HomeClient from './components/HomeClient';

export const metadata = generateEnhancedMetadata({
  title: "easy-pdf - Free Online PDF Tools | Merge, Split, Compress PDF",
  description: "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser. Privacy-first, secure, and completely free with no file uploads.",
  keywords: [
    // Core PDF Operations
    "PDF tools", "Merge PDF", "Split PDF", "Compress PDF", "JPG to PDF", "PDF to JPG",
    "Rotate PDF", "Reorder PDF pages", "Delete PDF pages", "Watermark PDF",

    // Security & Privacy
    "Protect PDF", "Unlock PDF", "Encrypt PDF", "Password protect PDF", "PDF redaction",
    "Client-side processing", "Privacy-first", "Secure PDF tools", "No upload PDF tools",

    // AI & Analysis
    "OCR PDF", "PDF text extraction", "Advanced OCR", "AI OCR", "PDF table extractor",
    "Extract text from PDF", "Scanned PDF to text",

    // Forms & Documents
    "PDF form filler", "Sign PDF", "PDF signature", "Invoice generator", "Report generator",
    "QR code generator", "Business documents",

    // Advanced Tools
    "PDF metadata editor", "PDF bookmark manager", "PDF batch processor",
    "PDF accessibility checker", "PDF version comparison", "PDF annotation collaboration",

    // General Terms
    "Free PDF Tools", "India", "Browser PDF editor", "Online PDF editor",
    "PDF converter", "Document processing", "PDF editor online free"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "homepage",
  ogImage: "https://easy-pdf-murex.vercel.app/og/homepage",
  lastModified: new Date().toISOString()
});

export default function Home() {
  return (
    <>
      {/* ✅ SSR H1 for SEO - Hidden visually but visible to crawlers */}
      <h1 className="sr-only">
        Easy PDF - Free Online PDF Tools | Privacy-First Document Processing
      </h1>
      <HomeClient />
    </>
  );
}