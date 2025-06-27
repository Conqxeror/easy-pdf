// Server component layout for /jpg-to-pdf route to provide SEO metadata
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "JPG to PDF Converter – Easy PDF Tool",
  description:
    "Convert JPG images to PDF instantly, 100% client-side. Fast, secure, privacy-first JPG to PDF converter. No uploads required.",
  keywords: [
    "JPG to PDF",
    "Image to PDF",
    "Convert JPG",
    "Photo to PDF",
    "Client-side PDF",
    "Privacy PDF tool",
    "No upload JPG to PDF",
    "Wali Mohammad Kadri",
  ],
  canonicalUrl: "https://easy-pdf-murex.vercel.app/jpg-to-pdf",
  metadataBaseUrl: "https://easy-pdf-murex.vercel.app",
});

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover, color-scheme: dark";

export default function JpgToPdfLayout({ children }) {
  return children;
}