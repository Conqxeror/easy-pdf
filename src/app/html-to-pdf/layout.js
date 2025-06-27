// Server component layout for /html-to-pdf route to provide SEO metadata
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "HTML to PDF Converter – Easy PDF Tool",
  description:
    "Convert HTML to PDF instantly, 100% client-side. Fast, secure, privacy-first HTML to PDF converter. No uploads required.",
  keywords: [
    "HTML to PDF",
    "Convert HTML",
    "Webpage to PDF",
    "PDF converter",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload HTML to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/html-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function HtmlToPdfLayout({ children }) {
  return children;
}