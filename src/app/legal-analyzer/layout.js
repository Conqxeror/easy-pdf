// Server component layout for /legal-analyzer route to provide SEO metadata
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Legal Analyzer for PDF – Easy PDF Tool",
  description:
    "Analyze legal clauses in PDF files instantly. 100% client-side, privacy-first, fast, and secure legal analyzer. No uploads required.",
  keywords: [
    "Legal analyzer PDF",
    "Analyze PDF clauses",
    "PDF legal tool",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload legal analyzer",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/legal-analyzer",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function LegalAnalyzerLayout({ children }) {
  return children;
}