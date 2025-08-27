import { generateEnhancedMetadata } from "@/lib/seoEnhancements";
import HomeClient from './components/HomeClient';

export const metadata = generateEnhancedMetadata({
  title: "easy-pdf - Free Online PDF Tools | Merge, Split, Compress PDF",
  description: "100% client-side PDF tools for India. Merge, split, compress, convert, protect, and edit PDFs directly in your browser. Privacy-first, secure, and completely free with no file uploads.",
  keywords: [
    "PDF tools", "Merge PDF", "Split PDF", "Compress PDF", "JPG to PDF", "PDF to JPG", 
    "Free PDF Tools", "India", "Privacy-first", "Client-side processing", "Secure PDF tools",
    "Browser PDF editor", "No upload PDF tools", "PDF converter", "Document processing",
    "Online PDF editor", "PDF merger", "PDF splitter", "PDF compressor"
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
  pageType: "homepage",
  lastModified: new Date().toISOString()
});

export default function Home() {
  return <HomeClient />;
}