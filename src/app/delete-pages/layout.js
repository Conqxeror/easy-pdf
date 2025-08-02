// Server component layout for /delete-pages route to provide SEO metadata
import { generateEnhancedMetadata } from "@/lib/seoEnhancements";

export const metadata = generateEnhancedMetadata({
  title: "Delete PDF Pages Online – Easy PDF Tool",
  description:
    "Delete pages from your PDF instantly. 100% client-side, privacy-first, fast, and secure PDF page remover. No uploads required.",
  keywords: [
    "Delete PDF pages",
    "Remove PDF pages",
    "PDF editor",
    "PDF page remover",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload PDF delete",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/delete-pages",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function DeletePagesLayout({ children }) {
  return children;
}