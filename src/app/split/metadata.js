import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Split PDF Online – Extract Pages Free | easy-pdf",
  description: "Split PDF files into multiple documents. Extract specific pages or ranges, or separate all pages. 100% client-side, privacy-first processing with no uploads. Fast and secure.",
  keywords: [
    "Split PDF", "Extract PDF pages", "PDF splitter", "Divide PDF", "PDF tools", 
    "Client-side PDF", "Privacy PDF tool", "No upload PDF splitter", "Free PDF splitter", 
    "Secure PDF split", "Browser PDF split", "Offline PDF split", "PDF page extractor",
    "Separate PDF pages", "PDF page range splitter", "Split PDF by pages", "Extract PDF sections"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/split",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  toolName: "PDF Splitter",
  pageType: "tool",
  breadcrumbs: [
    { name: "Home", url: "https://easy-pdf-murex.vercel.app" },
    { name: "Split PDF", url: "https://easy-pdf-murex.vercel.app/split" }
  ]
});

export default function SplitPdfPage() {
  return null;
}